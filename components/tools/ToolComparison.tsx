'use client'

import { AI_Tool } from '@/types/tools'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, Star, ExternalLink, Zap, DollarSign, Activity, Plus, Minus, ListChecks, Search as SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'

interface ToolComparisonProps {
    tools: AI_Tool[]
    onClose: () => void
}

export function ToolComparison({ tools, onClose }: ToolComparisonProps) {
    const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
    const [searchTerm, setSearchTerm] = useState('')
    const [showSearch, setShowSearch] = useState(false)

    if (tools.length === 0) return null

    const handleImgError = (id: string) => {
        setImgErrors(prev => ({ ...prev, [id]: true }))
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const winner = useMemo(() => {
        const pricingPriority: Record<string, number> = {
            'free': 3,
            'freemium': 2,
            'paid': 1,
            'subscription': 0,
            'Unspecified': -1
        }

        return [...tools].sort((a, b) => {
            const rA = a.rating ?? 0
            const rB = b.rating ?? 0
            if (rB !== rA) return rB - rA
            const aPrice = pricingPriority[a.pricing_model || 'Unspecified'] || 0
            const bPrice = pricingPriority[b.pricing_model || 'Unspecified'] || 0
            return bPrice - aPrice
        })[0]
    }, [tools])

    const criteriaRows = [
        { id: 'status', label: 'Status', icon: <Activity className="h-4 w-4 text-primary" />, getValue: (t: AI_Tool) => t.status },
        { id: 'rating', label: 'Rating', icon: <Star className="h-4 w-4 text-amber-500" />, getValue: (t: AI_Tool) => `${t.rating}/10` },
        { id: 'pricing', label: 'Pricing', icon: <DollarSign className="h-4 w-4 text-emerald-500" />, getValue: (t: AI_Tool) => t.pricing_model || 'Unspecified' },
        { id: 'ecosystem', label: 'Ecosystem', icon: <ListChecks className="h-4 w-4 text-sky-500" />, getValue: (t: AI_Tool) => t.category },
        { id: 'pros', label: 'Advantages', icon: <Plus className="h-4 w-4 text-emerald-500" />, getValue: (t: AI_Tool) => (t.pros || []).join(', ') },
        { id: 'cons', label: 'Limitations', icon: <Minus className="h-4 w-4 text-rose-500" />, getValue: (t: AI_Tool) => (t.cons || []).join(', ') },
        { id: 'features', label: 'Features', icon: <Zap className="h-4 w-4 text-sky-500" />, getValue: (t: AI_Tool) => (t.features || []).join(', ') },
        { id: 'analysis', label: 'Analysis', icon: null, getValue: (t: AI_Tool) => t.description || 'No detailed analysis.' },
    ]

    const filteredRows = criteriaRows.filter(row =>
        row.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tools.some(tool => row.getValue(tool).toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <Card className="border-white/10 bg-neutral-950/98 backdrop-blur-3xl overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in slide-in-from-top-4 duration-700">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 px-8 py-6 relative">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3 text-white">
                        <Zap className="h-6 w-6 text-primary fill-primary/20" />
                        Comparison Battle
                    </CardTitle>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Benchmarking the best in class</p>
                </div>

                <div className="flex items-center gap-4">
                    {showSearch && (
                        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                            <input
                                autoFocus
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="SEARCH CRITERIA..."
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black tracking-[0.2em] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 w-64 uppercase"
                            />
                        </div>
                    )}
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
                            showSearch ? "bg-primary text-black" : "bg-white/5 text-muted-foreground hover:text-white"
                        )}
                    >
                        <SearchIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 rounded-full flex items-center justify-center bg-white/5 text-muted-foreground hover:text-white hover:bg-rose-500/20 hover:text-rose-500 transition-all duration-300"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-8 pb-12 text-left text-[10px] font-black text-white/40 uppercase tracking-[0.2em] w-[20%]">Criteria</th>
                            {tools.map(tool => (
                                <th key={tool.id} className="p-8 pb-12 text-center border-l border-white/5 relative">
                                    {winner.id === tool.id && (
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                                            <Badge className="bg-primary text-black font-black text-[8px] tracking-[0.2em] rounded-full border-4 border-neutral-950 px-3 py-1 animate-bounce shadow-lg shadow-primary/20 whitespace-nowrap">
                                                NEURALDESK CHOICE
                                            </Badge>
                                        </div>
                                    )}
                                    <div className={cn(
                                        "flex flex-col items-center gap-4 transition-all duration-500",
                                        winner.id === tool.id ? "scale-110" : "opacity-60 grayscale-[0.5]"
                                    )}>
                                        {!imgErrors[tool.id] && tool.logo_url ? (
                                            <img
                                                src={tool.logo_url}
                                                alt={tool.name}
                                                onError={() => handleImgError(tool.id)}
                                                className={cn(
                                                    "h-20 w-20 rounded-3xl object-cover border-2 shadow-2xl bg-white/10",
                                                    winner.id === tool.id ? "border-primary shadow-primary/20" : "border-white/10"
                                                )}
                                            />
                                        ) : (
                                            <div className={cn(
                                                "h-20 w-20 rounded-3xl flex items-center justify-center font-extrabold text-3xl text-white border-2 shadow-inner transition-all",
                                                winner.id === tool.id ? "bg-primary border-primary" : "bg-neutral-800 border-white/10"
                                            )}>
                                                {getInitials(tool.name)}
                                            </div>
                                        )}
                                        <span className={cn(
                                            "font-black text-2xl tracking-tighter",
                                            winner.id === tool.id ? "text-primary italic" : "text-white"
                                        )}>{tool.name}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredRows.map(row => (
                            <tr key={row.id} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                                <td className="p-8 font-black text-[11px] uppercase tracking-wider text-white/50 flex items-center gap-3">
                                    {row.icon}
                                    {row.label}
                                </td>
                                {tools.map(tool => {
                                    const value = row.getValue(tool)
                                    const isWinner = winner.id === tool.id
                                    return (
                                        <td key={tool.id} className={cn(
                                            "p-8 text-center border-l border-white/5 transition-all",
                                            isWinner ? "bg-primary/[0.02]" : "opacity-80"
                                        )}>
                                            {row.id === 'status' ? (
                                                <Badge variant="outline" className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest px-3 py-1 border-white/10",
                                                    isWinner ? "bg-primary text-black border-primary" : "bg-white/5 text-white"
                                                )}>
                                                    {value}
                                                </Badge>
                                            ) : row.id === 'rating' ? (
                                                <div className={cn(
                                                    "flex items-center justify-center gap-2 font-black text-2xl tracking-tighter",
                                                    isWinner ? "text-primary" : "text-amber-500"
                                                )}>
                                                    <Star className={cn("h-5 w-5 fill-current")} />
                                                    {value}
                                                </div>
                                            ) : (
                                                <div className={cn(
                                                    "text-[12px] font-bold leading-relaxed",
                                                    isWinner ? "text-primary" : "text-white/90"
                                                )}>
                                                    {value}
                                                </div>
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}

                        {/* Always show Action Row if not filtered out by name but search is active? No, just show it at bottom */}
                        <tr className="bg-white/[0.02]">
                            <td className="p-8 font-black text-white/50 uppercase text-[10px] tracking-widest">Final Action</td>
                            {tools.map(tool => (
                                <td key={tool.id} className={cn(
                                    "p-8 text-center border-l border-white/5",
                                    winner.id === tool.id && "bg-primary/[0.03]"
                                )}>
                                    {tool.url && (
                                        <Button className={cn(
                                            "h-12 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105",
                                            winner.id === tool.id
                                                ? "bg-primary text-black hover:bg-primary/90 shadow-2xl shadow-primary/40"
                                                : "bg-white/5 text-white hover:bg-white/10"
                                        )} asChild>
                                            <a href={tool.url} target="_blank" rel="noopener noreferrer">
                                                DEPLOY TOOL <ExternalLink className="ml-2 h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </CardContent>
        </Card>
    )
}
