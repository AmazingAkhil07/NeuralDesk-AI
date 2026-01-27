'use client';

import { Idea, IdeaRecommendation } from '@/types/ideas';
import { IdeaCard } from './IdeaCard';
import { Loader2 } from 'lucide-react';

interface IdeaGridProps {
    ideas: Idea[];
    loading?: boolean;
    onEdit: (idea: Idea) => void;
    onDelete: (id: string, name: string) => void;
    onAnalyze: (id: string) => void;
    analyzingIds: string[];
}

export function IdeaGrid({ ideas, loading, onEdit, onDelete, onAnalyze, analyzingIds }: IdeaGridProps) {
    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (ideas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/10 rounded-3xl bg-black/20">
                <h3 className="text-xl font-bold text-white mb-2">No Ideas Found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                    The graveyard is empty... for now. Start by brutally validating your first startup idea.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ideas.map((idea) => (
                <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAnalyze={onAnalyze}
                    isAnalyzing={analyzingIds.includes(idea.id)}
                />
            ))}
        </div>
    );
}
