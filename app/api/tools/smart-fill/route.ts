import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { url } = await request.json()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })

        if (!response.ok) throw new Error('Failed to fetch URL')

        const html = await response.text()
        const $ = cheerio.load(html)

        // Basic metadata extraction
        const title = $('title').text().split('|')[0].trim() || $('meta[property="og:title"]').attr('content')
        const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content')
        const logo = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || $('meta[property="og:image"]').attr('content')

        // Normalize logo URL
        let absoluteLogo = logo
        if (logo && !logo.startsWith('http')) {
            const baseUrl = new URL(url).origin
            absoluteLogo = new URL(logo, baseUrl).toString()
        }

        return NextResponse.json({
            name: title || '',
            description: description || '',
            logo_url: absoluteLogo || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`,
            category: 'Coding & Dev' // Default category
        })
    } catch (error) {
        console.error('Extraction error:', error)
        return NextResponse.json({ error: 'Failed to extract metadata' }, { status: 500 })
    }
}
