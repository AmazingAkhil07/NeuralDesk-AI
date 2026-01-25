import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aggregateAllNews } from '@/lib/services/newsAggregator'
import { batchSummarizeNews } from '@/lib/services/aiService'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max execution time

export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting automated news aggregation...')

    // Step 1: Aggregate news from all sources
    const newsItems = await aggregateAllNews()
    console.log(`Fetched ${newsItems.length} news items`)

    if (newsItems.length === 0) {
      return NextResponse.json({
        message: 'No new news items found',
        count: 0,
      })
    }

    // Step 2: Generate AI summaries for top items (limit to 30 for speed)
    // Using high concurrency for speed
    const processLimit = 30;
    const topNews = newsItems.slice(0, processLimit);
    console.log(`Generating parallel summaries for ${topNews.length} items...`);

    let summaries = new Map<string, string>();
    try {
      // Parallel batch summarize
      summaries = await batchSummarizeNews(
        topNews.map((item) => ({ title: item.title, url: item.url, source: item.source }))
      );
    } catch (error) {
      console.log('⚠️ Skipping AI summaries due to error or quota');
    }

    // Step 3: Identify recipients
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userIds: string[] = [];
    if (user) {
      userIds = [user.id];
    } else {
      const { data: profiles } = await supabase.from('profiles').select('id') as { data: { id: string }[] | null };
      if (!profiles || profiles.length === 0) return NextResponse.json({ success: true, processed: 0 });
      userIds = profiles.map(p => p.id);
    }

    let totalInserted = 0;
    let totalUpdated = 0;
    let totalDeleted = 0;

    // Step 4: Process per user with Change Detection
    for (const userId of userIds) {
      console.log(`💾 Syncing news for user: ${userId}`);

      for (const item of topNews) {
        const summary = summaries.get(item.url) || item.summary || null;

        // Check for existing item
        const { data: existing } = await (supabase
          .from('news') as any)
          .select('*')
          .eq('user_id', userId)
          .eq('url', item.url)
          .maybeSingle();

        if (existing) {
          // Change Detection: Only update if summary or tags changed
          const hasChanges = (summary !== (existing as any).summary) ||
            (JSON.stringify(item.tags) !== JSON.stringify((existing as any).tags));

          if (hasChanges) {
            const { error } = await (supabase
              .from('news') as any)
              .update({
                title: item.title,
                summary,
                tags: item.tags,
                published_at: item.publishedAt,
                updated_at: new Date().toISOString(),
              })
              .eq('id', (existing as any).id);

            if (!error) totalUpdated++;
          }
        } else {
          // Insert brand new item
          const { error } = await (supabase
            .from('news') as any)
            .insert({
              user_id: userId,
              title: item.title,
              url: item.url,
              source: item.source,
              summary,
              tags: item.tags,
              published_at: item.publishedAt,
            });

          if (!error) totalInserted++;
        }
      }

      // Step 5: Clean up old news (3 days older) for this specific user
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { error: cleanupError, count } = await (supabase
        .from('news') as any)
        .delete({ count: 'exact' })
        .eq('user_id', userId)
        .lt('published_at', threeDaysAgo.toISOString());

      if (!cleanupError) totalDeleted += (count || 0);
    }

    return NextResponse.json({
      success: true,
      message: 'News sync completed',
      stats: {
        fetched: newsItems.length,
        newNews: totalInserted,
        updatedNews: totalUpdated,
        deletedOld: totalDeleted,
      },
    });
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
