import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const graveyardSchema = z.object({
    idea_id: z.string().uuid().optional(),
    idea_name: z.string().min(1, 'Idea name is required'),
    idea_one_liner: z.string().optional(),
    idea_problem: z.string().optional(),
    idea_solution: z.string().optional(),
    idea_target_user: z.string().optional(),
    final_score: z.number().optional(),
    recommendation: z.string().optional(),
    brutal_summary: z.string().optional(),
    why_failed: z.string().min(5, 'Please explain why the idea was killed'),
    lessons_learned: z.string().optional(),
    future_pivots: z.string().optional(),
    learnings_tags: z.array(z.string()).optional().default([]),
})

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')
    const sort = searchParams.get('sort') || 'killed_at' // killed_at, name, score

    let query = supabase
        .from('idea_graveyard')
        .select('*')
        .eq('user_id', user.id)

    if (search) {
        query = query.or(`idea_name.ilike.%${search}%,lessons_learned.ilike.%${search}%,why_failed.ilike.%${search}%`)
    }

    if (tag) {
        query = query.contains('learnings_tags', [tag])
    }

    // Apply sorting
    if (sort === 'name') {
        query = query.order('idea_name', { ascending: true })
    } else if (sort === 'score') {
        query = query.order('final_score', { ascending: false })
    } else {
        query = query.order('killed_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Deduplicate by id to ensure no duplicate entries are returned
    const seenIds = new Set<string>()
    const deduplicatedData = (data || []).filter((item: any) => {
        if (seenIds.has(item.id)) {
            return false
        }
        seenIds.add(item.id)
        return true
    })

    return NextResponse.json(deduplicatedData)
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const validated = graveyardSchema.parse(body)

        const { data, error } = await (supabase
            .from('idea_graveyard') as any)
            .insert([
                {
                    user_id: user.id,
                    ...validated,
                },
            ])
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data[0], { status: 201 })
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }
        return NextResponse.json({ error: 'Failed to create graveyard entry' }, { status: 500 })
    }
}
