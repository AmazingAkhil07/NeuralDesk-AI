import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Delete all graveyard entries for this user
        const { data, error } = await supabase
            .from('idea_graveyard')
            .delete()
            .eq('user_id', user.id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Count deleted rows (Supabase returns deleted rows by default)
        const deletedCount = data ? (Array.isArray(data) ? data.length : 1) : 0

        return NextResponse.json({ 
            message: 'Graveyard cleared successfully',
            deletedCount: deletedCount
        })
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to clear graveyard' }, { status: 500 })
    }
}
