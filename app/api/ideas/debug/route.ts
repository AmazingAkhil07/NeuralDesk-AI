import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Get ALL ideas
        const { data: allIdeas, error: allError } = await ((supabase
            .from('ideas')) as any)
            .select('id, name, recommendation, score, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (allError) {
            return NextResponse.json({ error: allError.message }, { status: 500 })
        }

        // Get killed ideas specifically
        const { data: killedIdeas, error: killError } = await ((supabase
            .from('ideas')) as any)
            .select('id, name, recommendation, score, created_at')
            .eq('user_id', user.id)
            .eq('recommendation', 'Kill')
            .order('created_at', { ascending: false })

        if (killError) {
            return NextResponse.json({ error: killError.message }, { status: 500 })
        }

        // Get ideas in graveyard
        const { data: inGraveyard, error: gravError } = await ((supabase
            .from('idea_graveyard')) as any)
            .select('original_idea_id, name')
            .eq('user_id', user.id)

        if (gravError) {
            return NextResponse.json({ error: gravError.message }, { status: 500 })
        }

        const graveyardIds = new Set(inGraveyard?.map((g: any) => g.original_idea_id) || [])

        return NextResponse.json({
            debug: {
                totalIdeas: allIdeas?.length || 0,
                allIdeas: allIdeas?.map((i: any) => ({ id: i.id, name: i.name, recommendation: i.recommendation, score: i.score })),
                killedIdeas: killedIdeas?.length || 0,
                killedList: killedIdeas?.map((i: any) => ({ id: i.id, name: i.name })),
                inGraveyard: inGraveyard?.length || 0,
                graveyardList: inGraveyard?.map((g: any) => ({ id: g.original_idea_id, name: g.name })),
                readyToMigrate: killedIdeas?.filter((i: any) => !graveyardIds.has(i.id)).map((i: any) => ({ id: i.id, name: i.name })) || []
            }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
