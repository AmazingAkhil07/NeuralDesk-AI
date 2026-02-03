'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Edit2, Trash2, Bookmark, Star, Copy, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface VaultCardProps {
    id: string
    title: string
    url?: string
    contentExcerpt?: string
    sourceType: 'news' | 'model' | 'tool' | 'idea' | 'external' | 'research'
    personalNotes?: string
    tags?: string[]
    rating?: number
    createdAt: string
    onEdit?: (id: string) => void
    onDelete?: (id: string) => void
    onArchive?: (id: string) => void
}

const SOURCE_TYPE_CONFIG = {
    news: { label: 'News', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: '📰' },
    model: { label: 'Model', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: '🤖' },
    tool: { label: 'Tool', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: '🛠️' },
    idea: { label: 'Idea', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: '💡' },
    external: { label: 'External', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: '🔗' },
    research: { label: 'Research', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', icon: '📚' },
}

export function VaultCard({
    id,
    title,
    url,
    contentExcerpt,
    sourceType,
    personalNotes,
    tags = [],
    rating,
    createdAt,
    onEdit,
    onDelete,
    onArchive,
}: VaultCardProps) {
    const config = SOURCE_TYPE_CONFIG[sourceType]

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const handleCopyUrl = () => {
        if (url) {
            navigator.clipboard.writeText(url)
            toast.success('URL copied to clipboard')
        }
    }

    return (
        <Card className="group transition-all duration-500 border-border/40 backdrop-blur-xl bg-card hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="text-2xl">{config.icon}</div>
                    {rating && (
                        <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        'h-3 w-3',
                                        i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <CardTitle className="text-base font-bold tracking-tight text-foreground line-clamp-2 mt-2">
                    {title}
                </CardTitle>

                <Badge className={cn('text-[10px] font-black uppercase tracking-wider mt-2', config.color)}>
                    {config.label}
                </Badge>
            </CardHeader>

            <CardContent className="space-y-3 flex-1">
                {contentExcerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {contentExcerpt}
                    </p>
                )}

                {personalNotes && (
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-2.5">
                        <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2">
                            💭 {personalNotes}
                        </p>
                    </div>
                )}

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {tags.slice(0, 3).map((tag) => (
                            <Badge
                                key={tag}
                                variant="outline"
                                className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground border-muted-foreground/20"
                            >
                                {tag}
                            </Badge>
                        ))}
                        {tags.length > 3 && (
                            <Badge
                                variant="outline"
                                className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground border-muted-foreground/20"
                            >
                                +{tags.length - 3}
                            </Badge>
                        )}
                    </div>
                )}

                <div className="text-xs text-muted-foreground/60 pt-2 border-t border-border/40">
                    Saved {formatDate(createdAt)}
                </div>
            </CardContent>

            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {url && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyUrl}
                        className="h-7 w-7 p-0 hover:bg-blue-500/10 hover:text-blue-500"
                        title="Copy URL"
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </Button>
                )}
                {url && (
                    <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        className="h-7 w-7 p-0 hover:bg-blue-500/10 hover:text-blue-500"
                        title="Open link"
                    >
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </Button>
                )}
                {onArchive && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onArchive(id)}
                        className="h-7 w-7 p-0 hover:bg-yellow-500/10 hover:text-yellow-500"
                        title="Archive"
                    >
                        <Archive className="h-3.5 w-3.5" />
                    </Button>
                )}
                {onEdit && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(id)}
                        className="h-7 w-7 p-0 hover:bg-green-500/10 hover:text-green-500"
                        title="Edit"
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                )}
                {onDelete && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(id)}
                        className="h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-500"
                        title="Delete"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
        </Card>
    )
}
