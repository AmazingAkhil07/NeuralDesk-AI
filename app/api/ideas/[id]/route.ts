import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { UpdateIdeaInput } from '@/types/ideas'

// Fix for Next.js 15: params must be awaited
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const supabase = await createClient()
    const supabaseAny = supabase as any
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', params.id)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {

    const params = await props.params;
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json: UpdateIdeaInput = await request.json()
    const supabaseAny = supabase as any;
    const { data, error } = await supabaseAny
        .from('ideas')
        .update({
            name: json.name,
            one_liner: json.one_liner,
            problem: json.problem,
            target_user: json.target_user,
            solution: json.solution,
            why_ai: json.why_ai,
            score: json.score,
            recommendation: json.recommendation,
            brutal_summary: json.brutal_summary,
            analysis_json: json.analysis_json,
        } as any)
        .eq('id', params.id)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', params.id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
