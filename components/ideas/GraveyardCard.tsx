'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SkullIcon, Edit2, Trash2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GraveyardCardProps {
    id: string
    ideaName: string
    ideaOneLiner?: string
    finalScore?: number
    recommendation?: string
    brutalSummary?: string
    whyFailed: string
    lessonsLearned?: string
    futurePivots?: string
    learningsTags?: string[]
    killedAt: string
    onEdit?: (id: string) => void
    onDelete?: (id: string) => void
}

export function GraveyardCard({
    id,
    ideaName,
    ideaOneLiner,
    finalScore,
    recommendation,
    brutalSummary,
    whyFailed,
    lessonsLearned,
    futurePivots,
    learningsTags = [],
    killedAt,
    onEdit,
    onDelete,
}: GraveyardCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const getRecommendationColor = (rec?: string) => {
        switch (rec) {
            case 'Build':
                return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'Iterate':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'Kill':
                return 'bg-red-500/10 text-red-500 border-red-500/20'
            default:
                return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
        }
    }

    const getScoreColor = (score?: number) => {
        if (score === undefined) return 'text-slate-400'
        if (score >= 8) return 'text-green-500'
        if (score >= 5) return 'text-yellow-500'
        return 'text-red-500'
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    return (
        <Card className="group transition-all duration-500 border-border/40 backdrop-blur-xl bg-card hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-1 flex-shrink-0">
                            <SkullIcon className="h-5 w-5 text-red-500/60" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg font-bold tracking-tight text-foreground line-clamp-2">
                                {ideaName}
                            </CardTitle>
                            {ideaOneLiner && (
                                <CardDescription className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {ideaOneLiner}
                                </CardDescription>
                            )}
                        </div>
                    </div>

                    {finalScore !== undefined && (
                        <div className={cn('text-right flex-shrink-0', getScoreColor(finalScore))}>
                            <div className="text-2xl font-black">{finalScore}</div>
                            <div className="text-[10px] font-medium text-muted-foreground">/10</div>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                    {recommendation && (
                        <Badge className={cn('text-[10px] font-black uppercase tracking-wider', getRecommendationColor(recommendation))}>
                            {recommendation}
                        </Badge>
                    )}
                    {learningsTags.length > 0 && learningsTags.slice(0, 2).map((tag) => (
                        <Badge
                            key={tag}
                            variant="outline"
                            className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-muted-foreground/20"
                        >
                            {tag}
                        </Badge>
                    ))}
                    {learningsTags.length > 2 && (
                        <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-muted-foreground/20">
                            +{learningsTags.length - 2}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Why Failed */}
                <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-500/70 mb-2">
                        <BookOpen className="h-3 w-3 inline mr-1" />
                        Why It Failed
                    </h4>
                    <p className="text-sm text-foreground/70 leading-relaxed">{whyFailed}</p>
                </div>

                {/* Expandable Content */}
                {(lessonsLearned || futurePivots || brutalSummary) && (
                    <div className="space-y-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full justify-between h-8 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                        >
                            <span>View Learnings</span>
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>

                        {isExpanded && (
                            <div className="space-y-3 mt-3 pt-3 border-t border-border/40">
                                {brutalSummary && (
                                    <div className="bg-slate-500/5 border border-slate-500/10 rounded-lg p-3">
                                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500/70 mb-2">
                                            Brutal Summary
                                        </h5>
                                        <p className="text-sm text-foreground/70 italic">{brutalSummary}</p>
                                    </div>
                                )}

                                {lessonsLearned && (
                                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
                                        <h5 className="text-xs font-bold uppercase tracking-wider text-blue-500/70 mb-2">
                                            Key Learnings
                                        </h5>
                                        <p className="text-sm text-foreground/70 leading-relaxed">{lessonsLearned}</p>
                                    </div>
                                )}

                                {futurePivots && (
                                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-3">
                                        <h5 className="text-xs font-bold uppercase tracking-wider text-purple-500/70 mb-2">
                                            Future Pivot Ideas
                                        </h5>
                                        <p className="text-sm text-foreground/70 leading-relaxed">{futurePivots}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Killed At */}
                <div className="text-xs text-muted-foreground/60 text-center pt-2 border-t border-border/40">
                    Archived {formatDate(killedAt)}
                </div>
            </CardContent>

            {/* Actions */}
            {(onEdit || onDelete) && (
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {onEdit && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(id)}
                            className="h-7 w-7 p-0 hover:bg-blue-500/10 hover:text-blue-500"
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
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            )}
        </Card>
    )
}
