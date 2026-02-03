import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const vaultSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    url: z.string().url().optional(),
    content_excerpt: z.string().optional(),
    full_content: z.string().optional(),
    source_type: z.enum(['news', 'model', 'tool', 'idea', 'external', 'research']),
    source_id: z.string().uuid().optional(),
    personal_notes: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    rating: z.number().min(1).max(5).optional(),
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
    const sourceType = searchParams.get('source_type')
    const sort = searchParams.get('sort') || 'created_at' // created_at, rating, title
    const archived = searchParams.get('archived') === 'true'

    let query = supabase
        .from('vault')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', archived)

    if (search) {
        query = query.or(`title.ilike.%${search}%,personal_notes.ilike.%${search}%,content_excerpt.ilike.%${search}%`)
    }

    if (tag) {
        query = query.contains('tags', [tag])
    }

    if (sourceType) {
        query = query.eq('source_type', sourceType)
    }

    // Apply sorting
    if (sort === 'rating') {
        query = query.order('rating', { ascending: false, nullsFirst: false })
    } else if (sort === 'title') {
        query = query.order('title', { ascending: true })
    } else {
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const validated = vaultSchema.parse(body)

        const { data, error } = await (supabase
            .from('vault') as any)
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
        return NextResponse.json({ error: 'Failed to create vault item' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isArchived = searchParams.get('archived') === 'true'

    const { error } = await (supabase
        .from('vault') as any)
        .update({ is_archived: true })
        .eq('user_id', user.id)
        .eq('is_archived', !isArchived)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
