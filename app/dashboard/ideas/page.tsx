'use client'

import { useState, useEffect } from 'react'
import { Idea, CreateIdeaInput } from '@/types/ideas'
import { IdeaForm } from '@/components/ideas/IdeaForm'
import { IdeaGrid } from '@/components/ideas/IdeaGrid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Lightbulb, Loader2, Sparkles, Filter } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function IdeasPage() {
    const [ideas, setIdeas] = useState<Idea[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [recommendationFilter, setRecommendationFilter] = useState('All')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingIdea, setEditingIdea] = useState<Partial<Idea> | undefined>(undefined)
    const [formLoading, setFormLoading] = useState(false)
    const [analyzingIds, setAnalyzingIds] = useState<string[]>([])

    const fetchIdeas = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (recommendationFilter !== 'All') params.append('recommendation', recommendationFilter)
            if (search) params.append('search', search)

            const response = await fetch(`/api/ideas?${params.toString()}`)
            if (!response.ok) throw new Error('Failed to fetch ideas')
            const data = await response.json()
            setIdeas(data)
        } catch (error) {
            toast.error('Failed to load ideas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchIdeas()
        }, 300)
        return () => clearTimeout(timer)
    }, [recommendationFilter, search])

    const handleCreateOrUpdate = async (formData: CreateIdeaInput) => {
        setFormLoading(true)
        try {
            const url = editingIdea?.id ? `/api/ideas/${editingIdea.id}` : '/api/ideas'
            const method = editingIdea?.id ? 'PATCH' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const result = await response.json()

            if (!response.ok) throw new Error(result.error || 'Failed to save idea')

            setIsDialogOpen(false)
            setEditingIdea(undefined)

            // Refresh grid to show the new card
            await fetchIdeas()

            if (method === 'POST') {
                toast.info('Idea securely logged. Initiating Power Test sequence...')
                // Auto-trigger analysis for new ideas
                handleAnalyze(result.id)
            } else {
                toast.success('Idea updated successfully')
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save idea')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`EXTREME ACTION: Are you sure you want to KILL the idea "${name}" permanently? This cannot be undone.`)) return

        try {
            const response = await fetch(`/api/ideas/${id}`, { method: 'DELETE' })
            if (!response.ok) throw new Error('Failed to delete idea')
            toast.success('Idea laid to rest.')
            fetchIdeas()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const handleAnalyze = async (id: string) => {
        if (analyzingIds.includes(id)) return // Prevent double-trigger

        setAnalyzingIds(prev => [...prev, id])
        try {
            const response = await fetch(`/api/ideas/${id}/evaluate`, { method: 'POST' })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Analysis failed')

            toast.success(`Verdict received for idea.`)
            fetchIdeas()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setAnalyzingIds(prev => prev.filter(i => i !== id))
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative">
                <div className="absolute -left-12 -top-12 h-64 w-64 bg-yellow-500/5 rounded-full blur-[100px] -z-10" />

                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                        <Sparkles className="h-3 w-3 fill-current" />
                        Power Test Active
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter text-foreground leading-tight">
                            Startup <span className="text-yellow-500 italic">Arena.</span>
                        </h1>
                        <p className="text-muted-foreground text-base font-medium tracking-tight max-w-lg">
                            Brutally validate your ideas before building. The market doesn't care about your feelings.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => {
                            setEditingIdea(undefined)
                            setIsDialogOpen(true)
                        }}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 h-10 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] tracking-widest text-[10px]"
                    >
                        <Plus className="mr-2 h-4 w-4" /> NEW IDEA
                    </Button>
                </div>
            </div>

            {/* Search & Filter "Tab" Section */}
            <div className="relative">
                <div className="absolute -top-6 left-8 px-4 py-1.5 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-t-xl shadow-lg shadow-yellow-500/20">
                    Filter Arena
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-3xl bg-neutral-900 border border-white/5 shadow-2xl backdrop-blur-md relative z-10">
                    <div className="relative flex-1 group max-w-xl">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-yellow-500" />
                        <Input
                            placeholder="SEARCH IDEAS..."
                            className="pl-14 h-11 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-yellow-500/50 focus-visible:ring-offset-0 font-black tracking-widest text-sm placeholder:text-muted-foreground/30 transition-all focus:bg-white/10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="h-10 w-[1px] bg-white/10 hidden lg:block" />
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Verdict:</span>
                            {['All', 'Build', 'Iterate', 'Kill'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setRecommendationFilter(filter)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${recommendationFilter === filter
                                        ? 'bg-white text-black shadow-lg scale-105'
                                        : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <IdeaGrid
                ideas={ideas}
                loading={loading}
                onEdit={(idea) => {
                    setEditingIdea(idea)
                    setIsDialogOpen(true)
                }}
                onDelete={handleDelete}
                onAnalyze={handleAnalyze}
                analyzingIds={analyzingIds}
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] border-white/10 bg-black/95 backdrop-blur-3xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
                    <div className="p-8 pb-4">
                        <DialogHeader className="space-y-2">
                            <DialogTitle className="text-3xl font-black tracking-tighter text-foreground">
                                {editingIdea ? 'Refine Pitch' : 'Enter The Arena'}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground text-base font-medium">
                                {editingIdea ? 'Update your thesis based on feedback.' : 'Warning: This process is designed to hurt your feelings to save your wallet.'}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="px-8 pb-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <IdeaForm
                            initialData={editingIdea || {}}
                            onSubmit={handleCreateOrUpdate}
                            onCancel={() => setIsDialogOpen(false)}
                            isLoading={formLoading}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
