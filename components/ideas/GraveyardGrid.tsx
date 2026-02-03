'use client'

import { GraveyardCard } from './GraveyardCard'

interface GraveyardGridProps {
    items: any[]
    isLoading?: boolean
    onEdit?: (id: string) => void
    onDelete?: (id: string) => void
}

export function GraveyardGrid({ items, isLoading, onEdit, onDelete }: GraveyardGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-96 bg-card border border-border/40 rounded-xl animate-pulse" />
                ))}
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-6xl mb-4">🪦</div>
                <h3 className="text-xl font-bold mb-2">Graveyard is Empty</h3>
                <p className="text-muted-foreground max-w-sm">
                    No killed ideas yet. When ideas don't make the cut, they'll be archived here with learnings for the future.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <GraveyardCard
                    key={item.id}
                    id={item.id}
                    ideaName={item.idea_name}
                    ideaOneLiner={item.idea_one_liner}
                    finalScore={item.final_score}
                    recommendation={item.recommendation}
                    brutalSummary={item.brutal_summary}
                    whyFailed={item.why_failed}
                    lessonsLearned={item.lessons_learned}
                    futurePivots={item.future_pivots}
                    learningsTags={item.learnings_tags}
                    killedAt={item.killed_at}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}
