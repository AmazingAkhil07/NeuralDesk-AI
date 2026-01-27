import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const ideaSchema = z.object({
    name: z.string().min(1, 'Idea name is required'),
    one_liner: z.string().refine((val) => val.trim().split(/\s+/).length <= 50, 'One-liner must be 50 words or less'),
    problem: z.string().min(10, 'Problem statement must be detailed'),
    target_user: z.string().min(3, 'Target user is required'),
    solution: z.string().min(10, 'Solution description must be detailed'),
    why_ai: z.string().min(5, 'AI justification is required'),
})

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const recommendation = searchParams.get('recommendation')
    const minScore = searchParams.get('min_score')

    let query = supabase
        .from('ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (search) {
        query = query.or(`name.ilike.%${search}%,one_liner.ilike.%${search}%,problem.ilike.%${search}%`)
    }

    if (recommendation && recommendation !== 'All') {
        query = query.eq('recommendation', recommendation)
    }

    if (minScore) {
        query = query.gte('score', parseInt(minScore))
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const supabaseAny = supabase as any
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const json = await request.json()
        const validation = ideaSchema.safeParse(json)

        if (!validation.success) {
            console.error('Validation Error Details:', JSON.stringify(validation.error, null, 2));
            // Defensive access using type casting to avoid strict TS issues if Zod types are weird
            const errorObj = validation.error as any;
            const issues = errorObj.errors || errorObj.issues || [];
            const errorMessage = issues[0]?.message || 'Invalid input data';

            return NextResponse.json({ error: errorMessage }, { status: 400 })
        }

        const validatedData = validation.data
        const { data, error } = await supabaseAny
            .from('ideas')
            .insert({
                user_id: user.id,
                name: validatedData.name,
                one_liner: validatedData.one_liner,
                problem: validatedData.problem,
                target_user: validatedData.target_user,
                solution: validatedData.solution,
                why_ai: validatedData.why_ai,
            } as any)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Create Idea Error:', error)
        return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 })
    }
}
