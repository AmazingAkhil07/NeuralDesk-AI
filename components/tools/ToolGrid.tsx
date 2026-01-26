'use client'

import { AI_Tool, TOOL_CATEGORIES } from '@/types/tools'
import { ToolCard } from './ToolCard'
import { ToolComparison } from './ToolComparison'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { X, LayoutGrid, Columns, Hammer, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ToolGridProps {
    tools: AI_Tool[]
    loading: boolean
    onEdit: (tool: AI_Tool) => void
    onDelete: (id: string) => void
}

export function ToolGrid({ tools, loading, onEdit, onDelete }: ToolGridProps) {
    const [comparingTools, setComparingTools] = useState<AI_Tool[]>([])
    const [isCompareMode, setIsCompareMode] = useState(false)

    const toggleCompare = (tool: AI_Tool) => {
        setComparingTools(prev => {
            const exists = prev.find(t => t.id === tool.id)
            if (exists) {
                return prev.filter(t => t.id !== tool.id)
            }

            // Enforce same category
            if (prev.length > 0 && prev[0].category !== tool.category) {
                toast.error(`Category Mismatch: You can only compare tools within the "${prev[0].category}" ecosystem.`)
                return prev
            }

            if (prev.length >= 3) {
                toast.info('Maximum 3 tools can be benchmarked simultaneously.')
                return prev
            }
            return [...prev, tool]
        })
    }

    const groupedTools = useMemo(() => {
        const groups: Record<string, AI_Tool[]> = {}
        tools.forEach(tool => {
            if (!groups[tool.category]) groups[tool.category] = []
            groups[tool.category].push(tool)
        })
        return groups
    }, [tools])

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-[280px] rounded-3xl bg-white/5 animate-pulse border border-white/5" />
                ))}
            </div>
        )
    }

    if (tools.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-700">
                <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-6 border border-primary/10 shadow-2xl shadow-primary/5">
                    <Hammer className="h-10 w-10 text-primary animate-bounce" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-2">The Radar is Clear</h3>
                <p className="text-muted-foreground max-w-xs font-medium">Ready to discover and track the next generation of AI innovation?</p>
            </div>
        )
    }

    const currentSelectionCategory = comparingTools.length > 0 ? comparingTools[0].category : null

    return (
        <div className="space-y-12 pb-20">
            <div className="flex items-center justify-between sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 border-b border-white/5 mx-[-2rem] px-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setIsCompareMode(!isCompareMode)
                            if (isCompareMode) setComparingTools([])
                        }}
                        className={cn(
                            "rounded-xl transition-all duration-500 h-10 px-5 font-bold tracking-tight",
                            isCompareMode ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20" : "bg-primary/10 text-primary hover:bg-primary/20"
                        )}
                    >
                        {isCompareMode ? <X className="mr-2 h-4 w-4" /> : <Columns className="mr-2 h-4 w-4" />}
                        {isCompareMode ? 'Exit Benchmarking' : 'COMPARE BENCHMARKS'}
                    </Button>
                    {isCompareMode && (
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground animate-in slide-in-from-left-4 duration-500">
                            <Info className="h-3 w-3 text-primary" />
                            <span>Select up to 3 models from the same category to benchmark</span>
                        </div>
                    )}
                </div>
                {comparingTools.length > 0 && isCompareMode && (
                    <div className="flex items-center gap-4 animate-in slide-in-from-right-4 duration-500">
                        <span className="text-[11px] font-black uppercase text-primary tracking-widest px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                            {comparingTools.length} / 3 Selected
                        </span>
                        <Button
                            variant="link"
                            size="sm"
                            className="text-muted-foreground font-bold hover:text-primary transition-colors"
                            onClick={() => setComparingTools([])}
                        >
                            Reset Choice
                        </Button>
                    </div>
                )}
            </div>

            {isCompareMode && comparingTools.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-10 duration-700">
                    <ToolComparison
                        tools={comparingTools}
                        onClose={() => {
                            setIsCompareMode(false)
                            setComparingTools([])
                        }}
                    />
                </div>
            )}

            {/* Categorized Sections */}
            <div className="space-y-16">
                {Object.entries(groupedTools).map(([category, categoryTools]) => (
                    <section key={category} className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
                                <span className="w-2 h-8 bg-primary rounded-full shadow-lg shadow-primary/20" />
                                {category}
                                <span className="text-xs font-bold text-muted-foreground uppercase ml-2 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                    {categoryTools.length}
                                </span>
                            </h2>
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {categoryTools.map((tool) => (
                                <ToolCard
                                    key={tool.id}
                                    tool={tool}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onCompareToggle={isCompareMode ? toggleCompare : undefined}
                                    isComparing={comparingTools.some(t => t.id === tool.id)}
                                    isDisabled={isCompareMode && currentSelectionCategory !== null && currentSelectionCategory !== tool.category}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    )
}
