'use client'

import { useState, useEffect } from 'react'
import { AI_Tool } from '@/types/tools'
import { CategoryFilter } from '@/components/tools/CategoryFilter'
import { ToolGrid } from '@/components/tools/ToolGrid'
import { ToolForm } from '@/components/tools/ToolForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Loader2, RefreshCw, Zap } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function ToolsPage() {
    const [tools, setTools] = useState<AI_Tool[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingTool, setEditingTool] = useState<AI_Tool | null>(null)
    const [formLoading, setFormLoading] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)

    const handleSync = async () => {
        setIsSyncing(true)
        try {
            const response = await fetch('/api/tools/sync', { method: 'POST' })
            const data = await response.json()
            if (data.error) throw new Error(data.error)

            if (data.seeded > 0 || data.added > 0) {
                const parts = []
                if (data.seeded > 0) parts.push(`${data.seeded} benchmark tools`)
                if (data.added > 0) parts.push(`${data.added} newly discovered tools`)
                toast.success(`Sync complete! Added ${parts.join(' and ')}.`)
            } else {
                toast.info('Radar is already up-to-date with latest ecosystem shifts.')
            }
            fetchTools()
        } catch (error: any) {
            toast.error(error.message || 'Sync failed')
        } finally {
            setIsSyncing(false)
        }
    }

    const fetchTools = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (category !== 'All') params.append('category', category)
            if (search) params.append('search', search)

            const response = await fetch(`/api/tools?${params.toString()}`)
            if (!response.ok) throw new Error('Failed to fetch tools')
            const data = await response.json()
            setTools(data)
        } catch (error) {
            toast.error('Failed to load tools')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTools()
    }, [category, search])

    const handleCreateOrUpdate = async (formData: any) => {
        setFormLoading(true)
        try {
            const url = editingTool ? `/api/tools/${editingTool.id}` : '/api/tools'
            const method = editingTool ? 'PATCH' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!response.ok) throw new Error('Failed to save tool')

            toast.success(editingTool ? 'Tool updated' : 'Tool added to radar')
            setIsDialogOpen(false)
            setEditingTool(null)
            fetchTools()
        } catch (error) {
            toast.error('Failed to save tool')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this tool?')) return

        try {
            const response = await fetch(`/api/tools/${id}`, { method: 'DELETE' })
            if (!response.ok) throw new Error('Failed to delete tool')
            toast.success('Tool removed')
            fetchTools()
        } catch (error) {
            toast.error('Failed to delete tool')
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative">
                <div className="absolute -left-12 -top-12 h-64 w-64 bg-amber-500/5 rounded-full blur-[100px] -z-10" />

                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                        <Zap className="h-3 w-3 fill-current" />
                        Live Radar Active
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter text-foreground leading-tight">
                            Tools <span className="text-amber-400 italic">Radar.</span>
                        </h1>
                        <p className="text-muted-foreground text-base font-medium tracking-tight max-w-lg">
                            Curation engine for the next decade of AI innovation. Track, benchmark, and deploy what matters.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="group border border-white/5 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground font-black h-10 px-4 rounded-xl transition-all duration-300"
                    >
                        {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />}
                        {isSyncing ? 'SCANNING...' : 'SYNC RADAR'}
                    </Button>
                    <Button
                        onClick={() => {
                            setEditingTool(null)
                            setIsDialogOpen(true)
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-black px-6 h-10 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] tracking-widest text-[10px]"
                    >
                        <Plus className="mr-2 h-4 w-4" /> ADD ENTRY
                    </Button>
                </div>
            </div>

            {/* Search & Filter "Tab" Section */}
            <div className="relative">
                <div className="absolute -top-6 left-8 px-4 py-1.5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-t-xl shadow-lg shadow-amber-500/20">
                    Search Intelligence
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-3xl bg-neutral-900 border border-white/5 shadow-2xl backdrop-blur-md relative z-10">
                    <div className="relative flex-1 group max-w-xl">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500/50 transition-colors group-focus-within:text-amber-500 animate-pulse" />
                        <Input
                            placeholder="SEARCH BY NAME, CAPABILITY, OR CATEGORY..."
                            className="pl-14 h-11 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-amber-500/20 focus-visible:ring-offset-0 font-black tracking-widest text-sm placeholder:text-muted-foreground/30 transition-all focus:bg-white/10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="h-10 w-[1px] bg-white/10 hidden lg:block" />
                    <div className="flex-1 lg:max-w-md">
                        <CategoryFilter selectedCategory={category} onCategoryChange={setCategory} />
                    </div>
                </div>
            </div>

            <ToolGrid
                tools={tools}
                loading={loading}
                onEdit={(tool) => {
                    setEditingTool(tool)
                    setIsDialogOpen(true)
                }}
                onDelete={handleDelete}
            />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] border-white/10 bg-black/95 backdrop-blur-3xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
                    <div className="p-8 pb-4">
                        <DialogHeader className="space-y-2">
                            <DialogTitle className="text-3xl font-black tracking-tighter text-foreground">
                                {editingTool ? 'Refine Entry' : 'New Expansion'}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground text-base font-medium">
                                {editingTool ? 'Update your performance benchmarks.' : 'Add a specialized tool to your radar.'}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="px-8 pb-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <ToolForm
                            initialData={editingTool || {}}
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
