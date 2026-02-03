'use client'

import { VaultCard } from './VaultCard'

interface VaultGridProps {
    items: any[]
    isLoading?: boolean
    onEdit?: (id: string) => void
    onDelete?: (id: string) => void
    onArchive?: (id: string) => void
}

export function VaultGrid({ items, isLoading, onEdit, onDelete, onArchive }: VaultGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-80 bg-card border border-border/40 rounded-xl animate-pulse" />
                ))}
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-bold mb-2">Vault is Empty</h3>
                <p className="text-muted-foreground max-w-sm">
                    No bookmarks yet. Save articles, tools, models, and ideas to build your personal knowledge base.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <VaultCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    url={item.url}
                    contentExcerpt={item.content_excerpt}
                    sourceType={item.source_type}
                    personalNotes={item.personal_notes}
                    tags={item.tags}
                    rating={item.rating}
                    createdAt={item.created_at}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onArchive={onArchive}
                />
            ))}
        </div>
    )
}
