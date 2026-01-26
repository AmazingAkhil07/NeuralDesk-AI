'use client'

import { AI_Tool } from '@/types/tools'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Star, Trash2, Edit2, ArrowRight, Check, Plus, Minus, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ToolCardProps {
    tool: AI_Tool
    onEdit: (tool: AI_Tool) => void
    onDelete: (id: string) => void
    onCompareToggle?: (tool: AI_Tool) => void
    isComparing?: boolean
    isDisabled?: boolean
}

export function ToolCard({ tool, onEdit, onDelete, onCompareToggle, isComparing, isDisabled }: ToolCardProps) {
    const [imgError, setImgError] = useState(false)

    const statusStyles = {
        Active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        Testing: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        Replaced: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 border-white/5 bg-white/5 backdrop-blur-md",
            isComparing && "ring-2 ring-primary bg-primary/5 shadow-lg shadow-primary/10",
            isDisabled && "opacity-20 grayscale pointer-events-none scale-95"
        )}>
            {isDisabled && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <Badge variant="outline" className="bg-rose-500/20 text-rose-500 border-rose-500/40 font-black text-[8px] uppercase tracking-widest px-4 py-1 rounded-full">
                        Category Mismatch
                    </Badge>
                </div>
            )}
            {/* Decorative gradient background */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20" />

            <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {!imgError && tool.logo_url ? (
                                <img
                                    src={tool.logo_url}
                                    alt={tool.name}
                                    onError={() => setImgError(true)}
                                    className="h-14 w-14 rounded-2xl object-cover border border-white/10 shadow-lg bg-white/5"
                                />
                            ) : (
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center font-extrabold text-xl text-primary border border-primary/20 shadow-inner">
                                    {getInitials(tool.name)}
                                </div>
                            )}
                            {isComparing && (
                                <div className="absolute -top-2 -right-2 h-6 w-6 bg-primary rounded-full border-2 border-background flex items-center justify-center animate-in zoom-in duration-300">
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-extrabold text-xl tracking-tighter text-foreground group-hover:text-primary transition-colors">
                                {tool.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={cn('text-[9px] uppercase tracking-widest px-2 py-0 border-transparent bg-white/5 text-muted-foreground')}>
                                    {tool.category}
                                </Badge>
                                <Badge variant="outline" className={cn('text-[9px] uppercase tracking-widest px-2 py-0', statusStyles[tool.status])}>
                                    {tool.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span>{tool.rating || 'N/A'}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{tool.pricing_model}</span>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 font-medium italic">
                    "{tool.description || 'Harnessing the power of AI to transform your unique workflow and productivity.'}"
                </p>

                <div className="space-y-4 mb-6">
                    {tool.features && tool.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {tool.features.slice(0, 3).map((feature, i) => (
                                <span key={i} className="text-[10px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-muted-foreground flex items-center gap-1">
                                    <Zap className="h-2.5 w-2.5 text-primary" /> {feature}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70 flex items-center gap-1">
                                <Plus className="h-3 w-3" /> Pros
                            </span>
                            <ul className="space-y-1">
                                {(tool.pros && tool.pros.length > 0 ? tool.pros : ['High Utility', 'Ecosystem Standard']).slice(0, 2).map((pro, i) => (
                                    <li key={i} className="text-[11px] font-medium text-foreground/80 line-clamp-1 flex items-start gap-1">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                        {pro}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500/70 flex items-center gap-1">
                                <Minus className="h-3 w-3" /> Cons
                            </span>
                            <ul className="space-y-1">
                                {(tool.cons && tool.cons.length > 0 ? tool.cons : ['Learning curve', 'Subscription']).slice(0, 2).map((con, i) => (
                                    <li key={i} className="text-[11px] font-medium text-foreground/80 line-clamp-1 flex items-start gap-1">
                                        <div className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                                        {con}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-4 border-t border-white/5">
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground" onClick={() => onEdit(tool)}>
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500" onClick={() => onDelete(tool.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        {onCompareToggle && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-9 px-3 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all",
                                    isComparing
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                )}
                                onClick={() => onCompareToggle(tool)}
                            >
                                {isComparing ? 'Selected' : 'Compare'}
                            </Button>
                        )}
                    </div>

                    {tool.url && (
                        <Button className="h-9 px-4 rounded-xl text-xs font-black tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/10 transition-all hover:translate-x-1" asChild>
                            <a href={tool.url} target="_blank" rel="noopener noreferrer">
                                EXPLORE <ArrowRight className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
