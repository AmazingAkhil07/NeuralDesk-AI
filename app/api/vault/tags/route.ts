import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const tagSchema = z.object({
    tag_name: z.string().min(1, 'Tag name is required').max(30, 'Tag name must be 30 characters or less'),
    tag_color: z.enum(['blue', 'purple', 'green', 'yellow', 'red', 'pink', 'orange', 'cyan']).default('blue'),
    tag_description: z.string().optional(),
})

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
        .from('vault_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('tag_name', { ascending: true })

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
        const validated = tagSchema.parse(body)

        // Check if tag already exists
        const { data: existing } = await supabase
            .from('vault_tags')
            .select('id')
            .eq('user_id', user.id)
            .eq('tag_name', validated.tag_name)
            .single()

        if (existing) {
            return NextResponse.json(
                { error: 'Tag already exists' },
                { status: 409 }
            )
        }

        const { data, error } = await (supabase
            .from('vault_tags') as any)
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
        return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
    }
}
