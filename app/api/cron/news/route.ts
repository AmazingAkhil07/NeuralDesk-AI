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

    // Step 2: Generate AI summaries for top items (limit to 20)
    const topNews = newsItems.slice(0, 20)
    console.log(`Generating summaries for ${topNews.length} items...`)

    let summaries = new Map<string, string>()
    try {
      summaries = await batchSummarizeNews(
        topNews.map((item) => ({
          title: item.title,
          url: item.url,
          source: item.source,
        }))
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.log('⚠️  Skipping AI summaries (quota exceeded or error):', errorMessage)
      // Continue without summaries
    }

    // Step 3: Get current authenticated user or all users
    const supabase = await createClient()
    
    // Try to get current user first
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    let userIds: string[] = []
    
    if (user) {
      // We have an authenticated user
      userIds = [user.id]
      console.log(`Using authenticated user: ${user.id}`)
    } else {
      // Fall back to getting all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')

      if (profilesError || !profiles || profiles.length === 0) {
        console.error('Error fetching profiles:', profilesError)
        return NextResponse.json({
          message: 'No users found. Please log in first.',
          count: 0,
        })
      }
      
      userIds = profiles.map((p: { id: string }) => p.id)
    }

    // Step 4: Insert news items for each user
    let insertedCount = 0
    for (const userId of userIds) {
      const newsToInsert = topNews.map((item) => ({
        user_id: userId,
        title: item.title,
        url: item.url,
        source: item.source,
        summary: summaries.get(item.url) || null,
        tags: item.tags,
        published_at: item.publishedAt,
      }))

      // Check for duplicates before inserting
      const { data: existing } = await supabase
        .from('news')
        .select('url')
        .eq('user_id', userId)
        .in('url', newsToInsert.map((n) => n.url))

      const existingUrls = new Set((existing as { url: string}[] | null)?.map((n) => n.url) || [])
      const newItems = newsToInsert.filter((item) => !existingUrls.has(item.url))

      if (newItems.length > 0) {
        const { error } = await supabase.from('news').insert(newItems as any)

        if (error) {
          console.error(`Error inserting news for user ${userId}:`, error)
        } else {
          insertedCount += newItems.length
          console.log(`Inserted ${newItems.length} news items for user ${userId}`)
        }
      }
    }

    return NextResponse.json({
      message: 'News aggregation completed',
      fetched: newsItems.length,
      inserted: insertedCount,
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
