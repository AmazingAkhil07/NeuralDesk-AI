import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await context.params

    const { data, error } = await (supabase
        .from('tools') as any)
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const body = await request.json()
    const { id } = await context.params

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await (supabase
        .from('tools') as any)
        .update(body)
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { id } = await context.params

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await (supabase
        .from('tools') as any)
        .delete()
        .eq('id', id)
        .eq('user_id', userData.user.id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
