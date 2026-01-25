import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateNewsSummary } from '@/lib/services/aiService'
import { Database } from '@/types/supabase'

type NewsUpdate = Database['public']['Tables']['news']['Update']

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { newsId, title, url, source } = await request.json()

    if (!newsId || !title || !url || !source) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate summary
    const summary = await generateNewsSummary({ title, url, source })

    // Update the news item in database
    const { error: updateError } = await (supabase
      .from('news') as any)
      .update({ summary })
      .eq('id', newsId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating news summary:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ summary })
  } catch (error: any) {
    console.error('Summarize error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to generate summary' 
    }, { status: 500 })
  }
}
