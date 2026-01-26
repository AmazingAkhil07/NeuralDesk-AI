import { NextResponse } from 'next/server'
import { discoverNewTools, syncToolStatuses } from '@/lib/services/toolDiscovery'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes

export async function GET(request: Request) {
    try {
        // Verify Vercel Cron Secret
        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('🚀 Starting daily tools sync and discovery...')

        // 1. Discover new tools
        const discoveryResult = await discoverNewTools()

        // 2. Sync existing tools health
        const syncResult = await syncToolStatuses()

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            discovery: discoveryResult,
            sync: syncResult
        })
    } catch (error: any) {
        console.error('Tools cron error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
