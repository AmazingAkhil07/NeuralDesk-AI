import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Idea } from '@/types/ideas'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

// Analyze why an idea failed and generate insights
async function analyzeFailedIdea(idea: Idea): Promise<{
    why_failed: string
    lessons_learned: string
    future_pivots: string
}> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

        const prompt = `You are a startup advisor analyzing why an idea was killed. Based on this idea details:

Name: ${idea.name}
One Liner: ${idea.one_liner}
Problem: ${idea.problem}
Target User: ${idea.target_user}
Solution: ${idea.solution}
Why AI: ${idea.why_ai}
Score: ${idea.score}/10
Analysis Summary: ${idea.brutal_summary || 'No summary provided'}

Provide a structured analysis in JSON format:
{
    "why_failed": "A concise explanation (1-2 sentences) of why this idea likely won't work based on the power test evaluation",
    "lessons_learned": "Key learnings from this failed attempt that could be valuable for future ideas (2-3 bullet points, comma-separated)",
    "future_pivots": "Potential pivots or variations of this idea that might work better (2-3 ideas, comma-separated)"
}

Return ONLY valid JSON, no markdown or extra text.`

        const result = await model.generateContent(prompt)
        const text = result.response.text()
        
        // Parse the JSON response
        const analysis = JSON.parse(text)
        
        return {
            why_failed: analysis.why_failed || 'Analysis pending',
            lessons_learned: analysis.lessons_learned || 'No specific lessons identified',
            future_pivots: analysis.future_pivots || 'Consider market research before next iteration'
        }
    } catch (error) {
        console.error('Error analyzing idea:', error)
        // Fallback response if AI analysis fails
        return {
            why_failed: `Score of ${idea.score}/10 indicates low viability. ${idea.brutal_summary || 'Market or differentiation concerns identified.'}`,
            lessons_learned: 'Validate market demand early, test core assumptions with target users',
            future_pivots: 'Consider pivoting problem definition, target user segment, or technology approach'
        }
    }
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Get all ideas with "Kill" recommendation that aren't already in graveyard
        const { data: killedIdeas, error: fetchError } = await ((supabase
            .from('ideas')) as any)
            .select('*')
            .eq('user_id', user.id)
            .eq('recommendation', 'Kill')
            .order('updated_at', { ascending: false })

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 })
        }

        if (!killedIdeas || killedIdeas.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No killed ideas found to migrate',
                migrated: [],
                count: 0
            })
        }

        // Check which ideas are already in graveyard
        const { data: existingGraveyard } = await ((supabase
            .from('idea_graveyard')) as any)
            .select('original_idea_id')
            .eq('user_id', user.id)

        const existingIds = new Set(existingGraveyard?.map((g: any) => g.original_idea_id) || [])

        // Filter out already migrated ideas
        const ideasToMigrate = killedIdeas.filter(
            (idea: any) => !existingIds.has(idea.id)
        )

        const migrated = []

        // Migrate each killed idea
        for (const idea of ideasToMigrate) {
            try {
                // Get AI analysis for this idea
                const analysis = await analyzeFailedIdea(idea)

                // Insert into graveyard
                const { data: graveyardEntry, error: insertError } = await ((supabase
                    .from('idea_graveyard')) as any)
                    .insert([
                        {
                            user_id: user.id,
                            idea_id: idea.id,
                            idea_name: idea.name,
                            idea_one_liner: idea.one_liner,
                            idea_problem: idea.problem,
                            idea_target_user: idea.target_user,
                            idea_solution: idea.solution,
                            final_score: idea.score,
                            recommendation: idea.recommendation,
                            brutal_summary: idea.brutal_summary,
                            why_failed: analysis.why_failed,
                            lessons_learned: analysis.lessons_learned,
                            future_pivots: analysis.future_pivots,
                            learnings_tags: [], // Can be populated based on idea tags
                        },
                    ])
                    .select()

                if (insertError) {
                    console.error(`Error migrating idea ${idea.id}:`, insertError)
                    continue
                }

                migrated.push({
                    id: idea.id,
                    name: idea.name,
                    graveyardId: graveyardEntry?.[0]?.id,
                    analysis: analysis
                })
            } catch (error) {
                console.error(`Error processing idea ${idea.id}:`, error)
                continue
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully migrated ${migrated.length} killed ideas to graveyard`,
            migrated,
            count: migrated.length,
            totalKilled: killedIdeas.length,
            alreadyMigrated: existingIds.size
        })
    } catch (error: any) {
        console.error('Migration error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to migrate killed ideas' },
            { status: 500 }
        )
    }
}

// GET endpoint to check status
export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Get all killed ideas
        const { data: killedIdeas, error: killError } = await ((supabase
            .from('ideas')) as any)
            .select('id')
            .eq('user_id', user.id)
            .eq('recommendation', 'Kill')

        const killedCount = killedIdeas?.length || 0

        // Get all already migrated idea IDs
        const { data: migratedGraveyard, error: gravError } = await ((supabase
            .from('idea_graveyard')) as any)
            .select('idea_id')
            .eq('user_id', user.id)

        const migratedIds = new Set(migratedGraveyard?.map((g: any) => g.idea_id) || [])

        // Calculate how many are ready to migrate
        const readyToMigrate = killedIdeas?.filter((idea: any) => !migratedIds.has(idea.id)).length || 0

        return NextResponse.json({
            killedIdeasCount: killedCount,
            migratedCount: migratedIds.size,
            readyToMigrate
        })
    } catch (error: any) {
        console.error('Status check error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
