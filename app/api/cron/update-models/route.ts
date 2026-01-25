import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchAllLatestModels } from '@/lib/services/modelsFetcher';

/**
 * Smart version detection - works for ALL providers
 * Extracts version numbers from model names
 */
function extractVersionNumber(name: string): number {
  // Match patterns like: GPT-5.2, Claude 4.5, Gemini 3, Llama 4, O3
  const match = name.match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  return parseFloat(match[0]);
}

/**
 * Determine if one model is newer than another
 */
function isNewerVersion(newName: string, oldName: string, company: string): boolean {
  const newVersion = extractVersionNumber(newName);
  const oldVersion = extractVersionNumber(oldName);
  return newVersion > oldVersion;
}

// Pruning and cleanup are now unified in the GET handler logic

/**
 * Cron endpoint to automatically update AI models
 * Run this daily/hourly via Vercel Cron or external scheduler
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated (for manual trigger)
    const { data: { user } } = await supabase.auth.getUser();

    // Verify cron secret for automated runs (when no user session)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow if user is authenticated OR if valid cron secret provided
    const isAuthorized = user || (cronSecret && authHeader === `Bearer ${cronSecret}`);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    // Fetch latest models from all providers
    console.log('Fetching latest AI models...');
    const allFetchedModels = await fetchAllLatestModels();

    // Step 1: Deduplicate and prune versions BEFORE processing
    // This prevents the "add and immediately delete" cycle
    const uniqueModelsMap = new Map<string, any>();
    for (const model of allFetchedModels) {
      const key = `${model.company}-${model.name}`;
      if (!uniqueModelsMap.has(key)) {
        uniqueModelsMap.set(key, model);
      }
    }
    let latestModels = Array.from(uniqueModelsMap.values());

    // Prune the latest list so it only contains the highest version of each tier
    // We reuse the grouping logic here
    const modelGroups = new Map<string, any[]>();
    for (const model of latestModels) {
      const tiers = ['Opus', 'Sonnet', 'Haiku', 'Pro', 'Ultra', 'Flash', 'Mini'];
      const modelTier = tiers.find(t => model.name.includes(t)) || '';
      const baseName = model.name.split(/[\s\-\d]/)[0] || model.name;
      const key = `${model.company}-${baseName}${modelTier ? `-${modelTier}` : ''}`;
      if (!modelGroups.has(key)) modelGroups.set(key, []);
      modelGroups.get(key)!.push(model);
    }

    const prunedLatest: any[] = [];
    for (const group of modelGroups.values()) {
      group.sort((a, b) => extractVersionNumber(b.name) - extractVersionNumber(a.name));
      prunedLatest.push(group[0]); // Keep only newest
    }
    latestModels = prunedLatest;
    console.log(`Processing ${latestModels.length} true frontier AI models`);

    // Step 2: Identify recipients
    let userIds: string[] = [];
    if (user) {
      userIds = [user.id];
      console.log(`✅ Session found: Updating models for user ${user.id}`);
    } else {
      console.log('No active session. Fetching all system profiles for update...');
      const { data: profiles } = await supabase.from('profiles').select('id');
      if (!profiles || profiles.length === 0) {
        return NextResponse.json({ success: true, message: 'No profiles to update', stats: { totalFetched: latestModels.length, newModels: 0, updatedModels: 0, deletedOutdated: 0 } });
      }
      userIds = profiles.map(p => p.id);
    }

    let totalInserted = 0;
    let totalUpdated = 0;
    let totalDeleted = 0;

    for (const userId of userIds) {
      console.log(`💾 Syncing models for user: ${userId}`);

      for (const model of latestModels) {
        const modelWithUser = { ...model, user_id: userId };

        const { data: existing } = await (supabase
          .from('models') as any)
          .select('*')
          .eq('user_id', userId)
          .eq('company', model.company)
          .eq('name', model.name)
          .maybeSingle();

        if (existing) {
          // Change Detection & Protection Logic: ONLY update technical specs
          // DO NOT overwrite user-entered strategic intelligence
          const updateData = { ...modelWithUser } as any;

          // Fields that must NEVER be overwritten by the cron
          const protectedFields = ['pricing', 'strengths', 'weaknesses', 'personal_rating', 'notes'];

          delete updateData.id;
          delete updateData.user_id;
          delete updateData.created_at;

          // Remove protected fields only if they have existing user content
          protectedFields.forEach(field => {
            const existingVal = (existing as any)[field];
            // If the field is already populated in DB, don't let the cron touch it
            if (existingVal !== null && existingVal !== undefined && (Array.isArray(existingVal) ? existingVal.length > 0 : true)) {
              delete updateData[field];
            }
          });

          let hasChanges = false;
          for (const key in updateData) {
            const existingVal = (existing as any)[key];
            const newVal = updateData[key];

            if (Array.isArray(newVal)) {
              if (JSON.stringify(newVal) !== JSON.stringify(existingVal)) hasChanges = true;
            } else if (newVal !== existingVal && newVal !== undefined) {
              hasChanges = true;
            }
          }

          if (hasChanges) {
            const { error } = await (supabase.from('models') as any).update(updateData).eq('id', (existing as any).id);
            if (!error) totalUpdated++;
          }
        } else {
          // Insert new model
          const { error } = await (supabase.from('models') as any).insert(modelWithUser);
          if (!error) totalInserted++;
        }
      }

      // Step 3: Cleanup Models that are no longer in our "True Frontier" list for this user
      const latestModelKeys = new Set(latestModels.map(m => `${m.company}-${m.name}`));
      const { data: userModels } = await (supabase.from('models') as any).select('id, name, company').eq('user_id', userId);

      const toDelete = userModels?.filter((m: any) => !latestModelKeys.has(`${m.company}-${m.name}`)) || [];
      if (toDelete.length > 0) {
        const { error: delErr } = await (supabase.from('models') as any).delete().in('id', toDelete.map((m: any) => m.id));
        if (!delErr) totalDeleted += toDelete.length;
        console.log(`🗑️ Cleaned up ${toDelete.length} legacy models for ${userId}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Models sync completed successfully',
      stats: {
        totalFetched: latestModels.length,
        newModels: totalInserted,
        updatedModels: totalUpdated,
        deletedOutdated: totalDeleted,
      },
    });
  } catch (error) {
    console.error('Error updating models:', error);
    return NextResponse.json(
      { error: 'Failed to update models', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Manual trigger for authenticated users
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
