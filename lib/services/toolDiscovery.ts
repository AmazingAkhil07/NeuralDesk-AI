import { aggregateAllNews, fetchProductHuntAI, fetchRedditNews } from './newsAggregator'
import { createClient } from '@/lib/supabase/server'
import { AI_Tool } from '@/types/tools'
import { batchSummarizeNews } from './aiService'
import axios from 'axios'

/**
 * Automatically discovers new tools from news sources and syncs them to the radar
 */
/**
 * Automatically discovers new tools from news sources and syncs them to the radar
 */
export async function discoverNewTools(specificUserId?: string) {
    const supabase = await createClient()

    // 1. Fetch potential tool candidates
    console.log('🔍 Searching for new tool candidates...')
    const phTools = await fetchProductHuntAI()
    const redditNews = await fetchRedditNews()

    const candidates = [...phTools, ...redditNews.filter(item =>
        item.title.toLowerCase().includes('just launched') ||
        item.title.toLowerCase().includes('new tool') ||
        item.title.toLowerCase().includes('release')
    )]

    console.log(`Found ${candidates.length} candidates. Filtering existing...`)

    // 2. Identify which tools are new for which users
    const usersToSync: string[] = []
    if (specificUserId) {
        usersToSync.push(specificUserId)
    } else {
        const { data: profiles } = await (supabase.from('profiles') as any).select('id')
        if (profiles) usersToSync.push(...(profiles as any[]).map((p: any) => p.id))
    }

    let addedCount = 0
    for (const userId of usersToSync) {
        const { data: existingTools } = await (supabase.from('tools') as any)
            .select('url')
            .eq('user_id', userId)

        const existingUrls = new Set((existingTools || []).map((t: any) => t.url))

        const newForThisUser = candidates
            .filter(c => !existingUrls.has(c.url))
            .map(item => ({
                name: item.title,
                url: item.url,
                description: item.summary || 'Automatically discovered via ' + item.source,
                category: 'Experimental/Agents',
                status: 'Testing',
                rating: 5,
                features: ['Newly Discovered', 'AI Native'],
                pros: ['Cutting edge', 'Community validated'],
                cons: ['Unstable', 'Early stage'],
                user_id: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }))

        if (newForThisUser.length > 0) {
            const { error } = await (supabase.from('tools') as any).insert(newForThisUser)
            if (!error) addedCount += newForThisUser.length
        }
    }

    console.log(`✅ Automatically added ${addedCount} new tool instances across users.`)
    return { added: addedCount }
}

/**
 * Automatically seeds benchmark tools for a new user
 */
export async function seedDefaultsForUser(userId: string) {
    const supabase = await createClient()

    const defaults = [
        // Coding & Dev
        { name: 'Cursor', description: 'The AI-first code editor. Built on VS Code, optimized for pair-programming.', category: 'Coding & Dev', url: 'https://cursor.com', pricing_model: 'freemium', rating: 10, status: 'Active', features: ['AI Chat', 'Composer', 'Auto-fix'], pros: ['Extremely fast', 'VS Code compatible'], cons: ['Subscription for Pro', 'Occasional hallucinations'], logo_url: 'https://cursor.com/favicon.ico' },
        { name: 'Windsurf', description: 'Next-gen agentic IDE by Codeium that understands your entire codebase.', category: 'Coding & Dev', url: 'https://codeium.com/windsurf', pricing_model: 'freemium', rating: 10, status: 'Active', features: ['Flow Context', 'Agentic Edit', 'Fast Indexing'], pros: ['Deep context', 'Very fast'], cons: ['New ecosystem', 'Less extensions than VS Code'], logo_url: 'https://codeium.com/favicon.ico' },
        { name: 'v0.dev', description: 'Generative UI by Vercel. Turn text into accessible React components.', category: 'Coding & Dev', url: 'https://v0.dev', pricing_model: 'freemium', rating: 9, status: 'Active', features: ['React Generation', 'Copy-paste Code', 'Version History'], pros: ['Perfect UI output', 'Vercel stack'], cons: ['Limited daily prompts', 'Component logic sometimes messy'], logo_url: 'https://v0.dev/favicon.ico' },
        { name: 'GitHub Copilot', description: 'The O.G. AI coding assistant. Still powerful, integrated everywhere.', category: 'Coding & Dev', url: 'https://github.com/features/copilot', pricing_model: 'paid', rating: 8, status: 'Active', features: ['Autocomplete', 'Chat', 'CLI'], pros: ['Ubiquitous integration', 'Reliable'], cons: ['Slower than Cursor', 'Less "agentic"'], logo_url: 'https://github.githubassets.com/favicons/favicon.svg' },

        // Image Generation
        { name: 'Midjourney', description: 'Highest quality image generation. Now with a web UI.', category: 'Image Generation', url: 'https://midjourney.com', pricing_model: 'paid', rating: 10, status: 'Active', features: ['High Fidelity', 'V6 Model', 'Style Reference'], pros: ['Best aesthetics', 'Active community'], cons: ['Discord only interface', 'No web UI yet'], logo_url: 'https://midjourney.com/favicon.ico' },
        { name: 'Dall-E 3', description: 'OpenAI high precision image generator. Great prompt adherence.', category: 'Image Generation', url: 'https://openai.com/dall-e-3', pricing_model: 'subscription', rating: 9, status: 'Active', features: ['Great prompt adherence', 'ChatGPT integration'], pros: ['Safe for work', 'Very easy to use'], cons: ['Artistic limits', 'Watermarks'], logo_url: 'https://openai.com/favicon.ico' },
        { name: 'Leonardo.ai', description: 'Powerful web-based image generation suite with fine-tuning.', category: 'Image Generation', url: 'https://leonardo.ai', pricing_model: 'freemium', rating: 9, status: 'Active', features: ['Custom Models', 'Canvas Editor', 'Texture Gen'], pros: ['Feature rich', 'Great UI'], cons: ['Credit system', 'Busy interface'], logo_url: 'https://leonardo.ai/favicon.ico' },
        { name: 'Flux.1', description: 'The new king of open weights image generation.', category: 'Image Generation', url: 'https://blackforestlabs.ai', pricing_model: 'free', rating: 10, status: 'Testing', features: ['Open Weights', 'SOTA Realism', 'Fast'], pros: ['Hyper-realistic', 'Open source'], cons: ['Hardware intensive', 'Self-host needed'], logo_url: 'https://blackforestlabs.ai/favicon.ico' },

        // Video Generation
        { name: 'Luma Dream Machine', description: 'Highly realistic video generation from text and images.', category: 'Video Generation', url: 'https://lumalabs.ai', pricing_model: 'freemium', rating: 9, status: 'Active', features: ['High Resolution', 'Physics Aware', 'Fast Render'], pros: ['Stable motion', 'Free tier'], cons: ['Queues can be long', 'Short clip length'], logo_url: 'https://lumalabs.ai/favicon.ico' },
        { name: 'Runway Gen-3', description: 'Professional AI video production. The industry standard.', category: 'Video Generation', url: 'https://runwayml.com', pricing_model: 'subscription', rating: 10, status: 'Active', features: ['Motion Brush', 'Multi-motion', 'Super Slowmo'], pros: ['Highly controllable', 'Industry standard'], cons: ['Expensive', 'Learning curve'], logo_url: 'https://runwayml.com/favicon.ico' },
        { name: 'Kling AI', description: 'Next-gen video generation with impressive physics.', category: 'Video Generation', url: 'https://klingai.com', pricing_model: 'freemium', rating: 9, status: 'Active', features: ['10s Duration', 'Realistic Dynamics', 'HD'], pros: ['Amazing physics', 'Long durations'], cons: ['Regional limits', 'Subscription based'], logo_url: 'https://klingai.com/favicon.ico' },
        { name: 'Sora', description: 'OpenAI highly anticipated video model.', category: 'Video Generation', url: 'https://openai.com/sora', pricing_model: 'paid', rating: 10, status: 'Testing', features: ['Cinematic', 'World Simulation', '1min Gen'], pros: ['Revolutionary', 'Long videos'], cons: ['Not available yet', 'Waitlisted'], logo_url: 'https://openai.com/favicon.ico' },

        // Audio & Music
        { name: 'Suno AI', description: 'Generate complete songs from text. Magical output.', category: 'Audio & Music', url: 'https://suno.com', pricing_model: 'freemium', rating: 10, status: 'Active', features: ['V3.5 Model', 'Song Editing', 'Custom Lyrics'], pros: ['Magical output', 'Hits and melodies'], cons: ['Copyright complex', 'Sometimes robotic'], logo_url: 'https://suno.com/favicon.ico' },
        { name: 'ElevenLabs', description: 'The best AI text-to-speech and voice cloning.', category: 'Audio & Music', url: 'https://elevenlabs.io', pricing_model: 'freemium', rating: 10, status: 'Active', features: ['Speech to Speech', 'Voice Cloning', 'Multilingual'], pros: ['Undisputed quality', 'Easy API'], cons: ['Pricey for volume', 'Strict usage limits'], logo_url: 'https://elevenlabs.io/favicon.ico' },
        { name: 'Udio', description: 'Professional grade music generation specialists.', category: 'Audio & Music', url: 'https://udio.com', pricing_model: 'freemium', rating: 9, status: 'Active', features: ['In-painting', 'High Fidelity', 'Extension'], pros: ['Studio quality', 'Nuanced control'], cons: ['Slow rendering', 'Pro UI complex'], logo_url: 'https://udio.com/favicon.ico' },

        // Writing & Research
        { name: 'Perplexity', description: 'The search engine of the future. Answer-first.', category: 'Writing & Research', url: 'https://perplexity.ai', pricing_model: 'freemium', rating: 10, status: 'Active', features: ['Sources provided', 'Pro Search', 'File Upload'], pros: ['No hallucinations', 'Fast answers'], cons: ['Pro is expensive', 'UI can feel cluttered'], logo_url: 'https://perplexity.ai/favicon.ico' },
        { name: 'Claude.ai', description: 'Advanced reasoning and Artifacts. Subtle writing style.', category: 'Writing & Research', url: 'https://claude.ai', pricing_model: 'freemium', rating: 10, status: 'Active', features: ['Artifacts', 'Projects', 'Long context'], pros: ['Subtle writing style', 'Best for coding'], cons: ['Strict daily limits', 'No live search'], logo_url: 'https://anthropic.com/favicon.ico' },
        { name: 'NotebookLM', description: 'Googles personal research assistant based on your docs.', category: 'Writing & Research', url: 'https://notebooklm.google.com', pricing_model: 'free', rating: 10, status: 'Active', features: ['Source Grounding', 'Audio Overview', 'Citation'], pros: ['Perfect for students', 'Zero halluncination'], cons: ['Google workspace lock', 'Limited formatting'], logo_url: 'https://www.gstatic.com/lamda/images/favicon_v2_f805f63683f12440fb22b.png' },

        // Creative/Vibe
        { name: 'Gamma', description: 'Beautiful presentations generated from a prompt.', category: 'Creative/Vibe', url: 'https://gamma.app', pricing_model: 'freemium', rating: 9, status: 'Active', features: ['AI Presentation', 'One-click Polish', 'Responsive'], pros: ['Beautiful design', 'Saves hours'], cons: ['Credits expire', 'Limited custom CSS'], logo_url: 'https://gamma.app/favicon.ico' },
        { name: 'Canva Magic Studio', description: 'AI design tools integrated into the Canva ecosystem.', category: 'Creative/Vibe', url: 'https://canva.com', pricing_model: 'freemium', rating: 8, status: 'Active', features: ['Magic Erase', 'Text to Design', 'Styles'], pros: ['Massive library', 'Simple UX'], cons: ['Paywalled features', 'Less creative freedom'], logo_url: 'https://canva.com/favicon.ico' },
        { name: 'Spline AI', description: 'Generate 3D objects and scenes with text.', category: 'Creative/Vibe', url: 'https://spline.design', pricing_model: 'freemium', rating: 8, status: 'Active', features: ['3D Generation', 'Interactive', 'Web Export'], pros: ['Cool 3D output', 'Ready for web'], cons: ['Technical gap', 'Resource heavy'], logo_url: 'https://spline.design/favicon.ico' },
        { name: 'Rosebud AI', description: 'AI powered world building and avatars for games.', category: 'Creative/Vibe', url: 'https://rosebud.ai', pricing_model: 'freemium', rating: 7, status: 'Testing', features: ['Game Engine AI', 'Sprite Gen', 'Dialogue'], pros: ['Game dev focus', 'Easy world gen'], cons: ['Early stage', 'Asset styling limits'], logo_url: 'https://rosebud.ai/favicon.ico' },

        // Experimental/Agents
        { name: 'Replicate', description: 'Run open-source AI models in the cloud.', category: 'Experimental/Agents', url: 'https://replicate.com', pricing_model: 'paid', rating: 10, status: 'Active', features: ['Cloud GPU', 'Huge Library', 'Simple API'], pros: ['Infinite models', 'Scale easily'], cons: ['Technical knowledge needed', 'Cold starts'], logo_url: 'https://replicate.com/favicon.ico' },
        { name: 'MultiOn', description: 'Automate anything on the web using an agent.', category: 'Experimental/Agents', url: 'https://multion.ai', pricing_model: 'freemium', rating: 8, status: 'Active', features: ['Web Agent', 'Automation', 'API'], pros: ['True web agency', 'Powerful'], cons: ['Security concerns', 'Slow site nav'], logo_url: 'https://multion.ai/favicon.ico' },
        { name: 'Devin', description: 'The first AI software engineer that actually works.', category: 'Experimental/Agents', url: 'https://cognition-labs.com', pricing_model: 'paid', rating: 9, status: 'Testing', features: ['Self-correction', 'Shell Access', 'Deployments'], pros: ['Truly autonomous', 'Impressive reasoning'], cons: ['Very expensive', 'Waitlist only'], logo_url: 'https://cognition.ai/favicon.ico' }
    ]

    const toolsToInsert = defaults.map(t => ({ ...t, user_id: userId }))
    await (supabase.from('tools') as any).insert(toolsToInsert)
    return defaults.length
}

/**
 * Checks existing tools for availability (Death Detection)
 */
export async function syncToolStatuses() {
    const supabase = await createClient()
    const { data: tools } = await (supabase
        .from('tools') as any)
        .select('id, url, name, status')
        .eq('status', 'Active') // Only check active tools for death

    if (!tools) return { updated: 0 }

    let updatedCount = 0
    for (const tool of (tools as any[])) {
        if (!tool.url) continue

        try {
            const response = await axios.get(tool.url, { timeout: 5000, validateStatus: () => true })

            // If 404 or specific error, mark as replaced/inactive
            if (response.status === 404 || response.status >= 500) {
                console.log(`💀 Tool "${tool.name}" seems dead (${response.status}). Marking for review.`)
                await (supabase
                    .from('tools') as any)
                    .update({ status: 'Testing', notes: `Automatically flagged: Site returned ${response.status} on ${new Date().toLocaleDateString()}` })
                    .eq('id', tool.id)
                updatedCount++
            }
        } catch (error) {
            console.log(`⚠️ Could not reach "${tool.name}". Skipping status update.`)
        }
    }

    return { updated: updatedCount }
}
