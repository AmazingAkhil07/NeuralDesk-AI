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
        <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative">
                    <div className="absolute -left-12 -top-12 h-64 w-64 bg-yellow-500/5 rounded-full blur-[100px] -z-10" />

                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-yellow-500/25 to-yellow-500/15 border border-yellow-500/50 text-yellow-200 text-[11px] font-black uppercase tracking-[0.3em] animate-pulse shadow-lg shadow-yellow-500/25 backdrop-blur-sm">
                            <Sparkles className="h-4 w-4 fill-current text-yellow-300" />
                            <span>Power Test Active</span>
                            <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                                <span className="block bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-2xl">Startup</span>
                                <span className="block bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl italic mt-1">Arena</span>
                            </h1>
                            <p className="text-yellow-100/70 text-lg font-semibold tracking-tight max-w-2xl drop-shadow-lg leading-relaxed">
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
                            className="relative overflow-hidden bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-black px-8 h-14 rounded-2xl shadow-2xl shadow-yellow-500/40 transition-all hover:scale-[1.05] active:scale-[0.95] tracking-widest text-sm group"
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Plus className="mr-2 h-6 w-6 inline" /> CREATE IDEA
                        </Button>
                    </div>
                </div>

                {/* Search & Filter Section */}
                <div className="relative">
                    <div className="absolute -top-6 left-8 px-5 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-t-2xl shadow-xl shadow-yellow-500/30 backdrop-blur-sm">
                        ⚡ Filter Arena
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-br from-neutral-900/80 via-neutral-950/70 to-black border border-yellow-500/20 shadow-2xl backdrop-blur-xl relative z-10 overflow-hidden">
                        <div className="absolute -right-32 -top-32 h-64 w-64 bg-yellow-500/5 rounded-full blur-3xl -z-10" />
                        <div className="relative flex-1 group max-w-xl">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-yellow-400/60 transition-colors group-focus-within:text-yellow-300" />
                            <Input
                                placeholder="SEARCH IDEAS BY NAME, PROBLEM, OR USER..."
                                className="pl-14 h-12 bg-gradient-to-r from-white/10 to-white/5 border-yellow-500/20 rounded-2xl focus-visible:ring-yellow-500/60 focus-visible:ring-offset-0 focus-visible:border-yellow-500/40 font-bold tracking-wider text-sm placeholder:text-yellow-200/20 text-yellow-100 transition-all focus:bg-white/15 focus:border-yellow-500/50 shadow-lg shadow-yellow-500/10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="h-10 w-[1px] bg-gradient-to-b from-yellow-500/0 via-yellow-500/20 to-yellow-500/0 hidden lg:block" />
                        <div className="flex items-center gap-4 flex-wrap">
                            <span className="text-xs font-black text-yellow-300 uppercase tracking-[0.2em]">Verdict:</span>
                            {['All', 'Build', 'Iterate', 'Kill'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setRecommendationFilter(filter)}
                                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${recommendationFilter === filter
                                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-500/40 scale-110'
                                        : 'bg-white/10 text-yellow-200 hover:bg-white/20 hover:text-yellow-100 border border-yellow-500/20'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
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
                    <DialogContent className="sm:max-w-[750px] border-white/10 bg-black/95 backdrop-blur-3xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
                        <div className="p-8 pb-4">
                            <DialogHeader className="space-y-2">
                                <DialogTitle className="text-3xl font-black tracking-tighter text-foreground">
                                    {editingIdea ? '🔧 Refine Pitch' : '⚡ Enter The Arena'}
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground text-base font-medium">
                                    {editingIdea ? 'Update your thesis based on feedback.' : 'Upload a PRD/Markdown or fill in the form. Warning: This will hurt your feelings to save your wallet.'}
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="px-8 pb-8 max-h-[70vh] overflow-y-auto">
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
        </div>
    )
}
