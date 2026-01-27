// TypeScript types for Startup Idea Power Test (Phase 4)

export type IdeaRecommendation = 'Build' | 'Iterate' | 'Kill' | 'Pending';

export interface IdeaAnalysis {
    existence: {
        status: 'Exists' | 'Partially Exists' | 'New' | 'Unknown';
        references: string[];
    };
    market: {
        pain_intensity: 'Low' | 'Medium' | 'High' | 'Unknown';
        demand_likelihood: 'Low' | 'Medium' | 'High' | 'Unknown';
        is_must_have: boolean | null;
    };
    differentiation: {
        one_sentence_diff: string | null;
        flags: string[];
    };
    ai_justification: {
        necessity_level: 'Essential' | 'Optional' | 'Unnecessary' | 'Unknown';
        reasoning: string | null;
    };
    monetization: {
        buyer_persona: string | null;
        willingness_to_pay: 'Low' | 'Medium' | 'High' | 'Unknown';
    };
}

export interface Idea {
    id: string;
    user_id: string;
    name: string;
    one_liner: string;
    problem: string;
    target_user: string;
    solution: string;
    why_ai: string;

    // Evaluation Results
    score?: number | null; // 0-10
    recommendation?: IdeaRecommendation | null;
    brutal_summary?: string | null;
    analysis_json?: IdeaAnalysis | null;

    created_at: string;
    updated_at: string;
}

export interface CreateIdeaInput {
    name: string;
    one_liner: string;
    problem: string;
    target_user: string;
    solution: string;
    why_ai: string;
}

export interface UpdateIdeaInput extends Partial<CreateIdeaInput> {
    id: string;
    // Can also update analysis directly if needed manually, though usually AI does this
    score?: number;
    recommendation?: IdeaRecommendation;
    brutal_summary?: string;
    analysis_json?: IdeaAnalysis;
}

export interface IdeaFilters {
    search?: string;
    recommendation?: IdeaRecommendation;
    min_score?: number;
}
