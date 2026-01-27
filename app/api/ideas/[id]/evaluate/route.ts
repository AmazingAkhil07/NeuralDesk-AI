import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { evaluateStartupIdea } from '@/lib/services/aiService'
import { Idea } from '@/types/ideas'

// Increase timeout for AI processing
export const maxDuration = 60;

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const id = params.id;

        if (!id) {
            return NextResponse.json({ error: 'Missing idea ID' }, { status: 400 })
        }

        const supabase = await createClient()
        const supabaseAny = supabase as any
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Fetch the idea
        console.log(`[Evaluate Route] Fetching idea ${id}...`);
        const { data, error: fetchError } = await supabase
            .from('ideas')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !data) {
            console.error(`[Evaluate Route] Idea fetch failed: ${fetchError?.message}`);
            return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
        }

        const idea = data as Idea;
        console.log(`[Evaluate Route] Idea found: ${idea.name}. Starting AI analysis...`);

        // 2. Evaluate using AI
        try {
            const result = await evaluateStartupIdea({
                name: idea.name,
                one_liner: idea.one_liner,
                problem: idea.problem,
                target_user: idea.target_user,
                solution: idea.solution,
                why_ai: idea.why_ai,
            });

            console.log(`[Evaluate Route] AI analysis complete. Score: ${result.score}. Updating DB...`);

            // 3. Update the idea with results
            const { data: updatedIdea, error: updateError } = await supabaseAny
                .from('ideas')
                .update({
                    score: result.score,
                    recommendation: result.recommendation,
                    brutal_summary: result.brutal_summary,
                    analysis_json: result.analysis,
                } as any)
                .eq('id', id)
                .select()
                .single()

            if (updateError) {
                console.error('[Evaluate Route] DB Update Error:', updateError);
                throw new Error('Failed to save evaluation results to database');
            }

            console.log(`[Evaluate Route] Success! Returning updated idea.`);
            return NextResponse.json(updatedIdea);

        } catch (aiError: any) {
            console.error('[Evaluate Route] AI/DB Processing Error:', aiError);
            return NextResponse.json(
                { error: aiError.message || 'Evaluation processing failed' },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('Evaluation Route Error:', error)
        return NextResponse.json(
            { error: error.message || 'Evaluation failed due to an unexpected server error' },
            { status: 500 }
        )
    }
}
