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

/**
 * Identify and remove outdated model versions
 * Example: Keep GPT-5.2, remove GPT-5 and older GPTs
 */
async function cleanupOutdatedModels(supabase: any, userId: string, latestModels: any[]) {
  try {
    // Get all existing models for the user
    const { data: existingModels } = await supabase
      .from('models')
      .select('id, name, company, created_at')
      .eq('user_id', userId);

    if (!existingModels || existingModels.length === 0) return 0;

    // Create a set of latest model names for quick lookup
    const latestModelNames = new Set(latestModels.map(m => `${m.company}-${m.name}`));

    // Group models by company and base name (e.g., "GPT", "Claude", "Gemini")
    const modelGroups = new Map<string, any[]>();

    for (const model of existingModels) {
      // Extract base model name (GPT, Claude, Gemini, O3, Llama, etc.)
      // For "Claude 4.5 Sonnet" -> "Claude"
      // For "GPT-5.2" -> "GPT"
      const baseName = model.name.split(/[\s\-\d]/)[0] || model.name;
      const key = `${model.company}-${baseName}`;
      
      if (!modelGroups.has(key)) {
        modelGroups.set(key, []);
      }
      modelGroups.get(key)!.push(model);
    }

    const modelsToDelete: string[] = [];

    // For each group, keep only the models that are in latestModels list
    for (const [key, models] of modelGroups.entries()) {
      if (models.length <= 1) continue; // No duplicates/old versions

      // Sort by version (newest first) - extract all numbers from name
      models.sort((a, b) => {
        const extractVersion = (name: string) => {
          const matches = name.match(/\d+(\.\d+)?/g);
          if (!matches) return 0;
          // Convert to number: "5.2" -> 5.2, "4.5" -> 4.5
          return parseFloat(matches.join('.'));
        };
        
        const aVersion = extractVersion(a.name);
        const bVersion = extractVersion(b.name);
        return bVersion - aVersion;
      });

      // Mark models for deletion if they're NOT in the latest models list
      for (const model of models) {
        const modelKey = `${model.company}-${model.name}`;
        if (!latestModelNames.has(modelKey)) {
          modelsToDelete.push(model.id);
          console.log(`🗑️ Marking for deletion: ${model.name} (${model.company}) - Not in latest list`);
        }
      }
    }

    // Delete outdated models
    let deletedCount = 0;
    if (modelsToDelete.length > 0) {
      const { error } = await (supabase
        .from('models') as any)
        .delete()
        .in('id', modelsToDelete);

      if (!error) {
        deletedCount = modelsToDelete.length;
        console.log(`✅ Removed ${deletedCount} outdated model versions`);
      } else {
        console.error('Error deleting models:', error);
      }
    }

    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up outdated models:', error);
    return 0;
  }
}

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
    const latestModels = await fetchAllLatestModels();
    console.log(`Fetched ${latestModels.length} models`);

    // Step 1: Upsert all models first (insert new or update existing)
    let insertedCount = 0;
    let updatedCount = 0;
    let deletedCount = 0;

    if (user) {
      // Prepare models with user_id
      const modelsToUpsert = latestModels.map(model => ({
        ...model,
        user_id: user.id,
      }));

      // Upsert models (insert new or update existing)
      for (const model of modelsToUpsert) {
        // Check if model exists with exact name match
        const { data: existing } = await (supabase
          .from('models') as any)
          .select('id, name')
          .eq('user_id', user.id)
          .eq('company', model.company)
          .eq('name', model.name)
          .single();

        if (existing) {
          // Update existing model with latest data
          const updateData = {
            last_model_update: model.last_model_update,
            context_length: model.context_length,
            description: model.description,
            strengths: model.strengths,
            weaknesses: model.weaknesses,
            capabilities: model.capabilities,
            model_type: model.model_type,
            is_open_source: model.is_open_source,
            url: model.url,
            documentation_url: model.documentation_url,
            personal_rating: model.personal_rating,
            model_id: model.model_id,
          };
          
          const { error } = await (supabase
            .from('models') as any)
            .update(updateData)
            .eq('id', existing.id);

          if (!error) updatedCount++;
        } else {
          // Insert new model
          const { error } = await (supabase
            .from('models') as any)
            .insert(model);

          if (!error) insertedCount++;
        }
      }

      // Step 2: NOW clean up outdated models after all new ones are inserted
      deletedCount = await cleanupOutdatedModels(supabase, user.id, latestModels);
    }

    return NextResponse.json({
      success: true,
      message: 'Models updated successfully',
      stats: {
        totalFetched: latestModels.length,
        newModels: insertedCount,
        updatedModels: updatedCount,
        deletedOutdated: deletedCount,
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
