import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Get all ideas
        const { data: allIdeas, error: allError } = await ((supabase
            .from('ideas')) as any)
            .select('id, name, recommendation, score')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        // Get killed ideas specifically
        const { data: killedIdeas, error: killedError } = await ((supabase
            .from('ideas')) as any)
            .select('id, name, recommendation, score')
            .eq('user_id', user.id)
            .eq('recommendation', 'Kill')
            .order('created_at', { ascending: false })

        // Get graveyard entries
        const { data: graveyardEntries, error: graveyardError } = await ((supabase
            .from('idea_graveyard')) as any)
            .select('id, name, original_idea_id')
            .eq('user_id', user.id)

        if (allError) throw allError
        if (killedError) throw killedError
        if (graveyardError) throw graveyardError

        return NextResponse.json({
            totalIdeas: allIdeas?.length || 0,
            allIdeas: allIdeas || [],
            killedIdeas: killedIdeas || [],
            killedCount: killedIdeas?.length || 0,
            graveyardEntries: graveyardEntries || [],
            graveyardCount: graveyardEntries?.length || 0,
            migratedIds: graveyardEntries?.map((e: any) => e.original_idea_id) || []
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
