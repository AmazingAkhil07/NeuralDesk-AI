import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { discoverNewTools } from '@/lib/services/toolDiscovery'

export async function POST(request: Request) {
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // 1. Check if user has ANY tools. If 0, seed defaults first.
        const { count } = await (supabase
            .from('tools') as any)
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userData.user.id)

        let seeded = 0
        if (!count || count === 0) {
            const { seedDefaultsForUser } = await import('@/lib/services/toolDiscovery')
            seeded = await seedDefaultsForUser(userData.user.id)
        }

        const result = await discoverNewTools(userData.user.id)
        return NextResponse.json({ success: true, ...result, seeded })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
