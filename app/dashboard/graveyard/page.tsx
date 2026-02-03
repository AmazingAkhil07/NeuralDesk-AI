'use client'

import { useState, useEffect } from 'react'
import { GraveyardGrid } from '@/components/ideas/GraveyardGrid'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, SkullIcon, Zap, X, Wand2, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function GraveyardPage() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editData, setEditData] = useState<any>(null)
    const [editLoading, setEditLoading] = useState(false)
    const [allTags, setAllTags] = useState<string[]>([])
    const [migratingKilled, setMigratingKilled] = useState(false)
    const [killedCount, setKilledCount] = useState(0)
    const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
    const [isClearing, setIsClearing] = useState(false)

    const fetchItems = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.append('search', search)
            if (selectedTag) params.append('tag', selectedTag)

            const response = await fetch(`/api/graveyard?${params.toString()}`)
            if (!response.ok) throw new Error('Failed to fetch')
            const data = await response.json()
            setItems(data)

            // Collect all tags
            const tags = new Set<string>()
            data.forEach((item: any) => {
                item.learnings_tags?.forEach((tag: string) => tags.add(tag))
            })
            setAllTags(Array.from(tags).sort())

            // Check for killed ideas to migrate
            const statusResponse = await fetch('/api/ideas/migrate-killed')
            if (statusResponse.ok) {
                const status = await statusResponse.json()
                setKilledCount(status.readyToMigrate)
            }
        } catch (error) {
            toast.error('Failed to load graveyard')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchItems()
    }, [search, selectedTag])

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to permanently delete this entry?')) return

        try {
            const response = await fetch(`/api/graveyard/${id}`, { method: 'DELETE' })
            if (!response.ok) throw new Error('Failed to delete')
            toast.success('Entry deleted')
            fetchItems()
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    const handleMigrateKilledIdeas = async () => {
        if (killedCount === 0) {
            toast.info('No killed ideas to migrate')
            return
        }

        setMigratingKilled(true)
        try {
            const response = await fetch('/api/ideas/migrate-killed', { method: 'POST' })
            if (!response.ok) throw new Error('Migration failed')
            
            const result = await response.json()
            toast.success(`🎯 AI Analysis Complete! Migrated ${result.count} ideas with insights`)
            setKilledCount(0)
            fetchItems()
        } catch (error: any) {
            toast.error(error.message || 'Failed to migrate killed ideas')
        } finally {
            setMigratingKilled(false)
        }
    }

    const handleEdit = (id: string) => {
        const item = items.find(i => i.id === id)
        if (item) {
            setEditData(item)
            setEditingId(id)
            setIsEditDialogOpen(true)
        }
    }

    const handleSaveEdit = async () => {
        if (!editingId || !editData) return

        setEditLoading(true)
        try {
            const response = await fetch(`/api/graveyard/${editingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessons_learned: editData.lessons_learned,
                    future_pivots: editData.future_pivots,
                    why_failed: editData.why_failed,
                    learnings_tags: editData.learnings_tags,
                }),
            })

            if (!response.ok) throw new Error('Failed to update')
            toast.success('Entry updated')
            setIsEditDialogOpen(false)
            setEditingId(null)
            setEditData(null)
            fetchItems()
        } catch (error) {
            toast.error('Failed to update')
        } finally {
            setEditLoading(false)
        }
    }

    const handleClearGraveyard = async () => {
        setIsClearing(true)
        try {
            const response = await fetch('/api/graveyard/clear', { method: 'POST' })
            if (!response.ok) throw new Error('Failed to clear graveyard')
            
            const result = await response.json()
            toast.success(`🪦 Graveyard cleared! Removed ${result.deletedCount} entries.`)
            setIsClearDialogOpen(false)
            fetchItems()
        } catch (error: any) {
            toast.error(error.message || 'Failed to clear graveyard')
        } finally {
            setIsClearing(false)
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative">
                <div className="absolute -left-12 -top-12 h-64 w-64 bg-red-500/5 rounded-full blur-[100px] -z-10" />

                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                        <SkullIcon className="h-3 w-3" />
                        Archive Active
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter text-foreground leading-tight">
                            Idea <span className="text-red-500 italic">Graveyard.</span>
                        </h1>
                        <p className="text-muted-foreground text-base font-medium tracking-tight max-w-lg">
                            Where failed ideas rest. Extract learnings, spot patterns, and discover future pivots.
                        </p>
                    </div>
                </div>

                <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <SkullIcon className="h-8 w-8 text-red-500/60" />
                </div>

                {killedCount > 0 && (
                    <Button
                        onClick={handleMigrateKilledIdeas}
                        disabled={migratingKilled}
                        className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg flex items-center gap-2"
                    >
                        {migratingKilled ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Wand2 className="h-4 w-4" />
                                AI Analyze {killedCount} Ideas
                            </>
                        )}
                    </Button>
                )}

                {items.length > 0 && (
                    <Button
                        onClick={() => setIsClearDialogOpen(true)}
                        disabled={isClearing}
                        variant="destructive"
                        className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center gap-2"
                    >
                        {isClearing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Clearing...
                            </>
                        ) : (
                            <>
                                <X className="h-4 w-4" />
                                Clear All
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Search & Filters */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search ideas, learnings, pivots..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-11 bg-card/50 border-border/40"
                    />
                </div>

                {/* Tag Filter */}
                {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filters:</span>
                        {allTags.map((tag) => (
                            <Badge
                                key={tag}
                                variant={selectedTag === tag ? 'default' : 'outline'}
                                className={cn(
                                    'cursor-pointer text-[10px] font-semibold uppercase tracking-wider transition-all',
                                    selectedTag === tag
                                        ? 'bg-red-500/20 text-red-500 border-red-500/40'
                                        : 'hover:border-red-500/40 hover:text-red-500/70'
                                )}
                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            >
                                {tag}
                            </Badge>
                        ))}
                        {selectedTag && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTag(null)}
                                className="h-6 px-2 text-[10px] font-semibold"
                            >
                                <X className="h-3 w-3 mr-1" /> Clear
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border/40 rounded-xl p-4">
                    <div className="text-3xl font-black text-red-500">{items.length}</div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                        Ideas Archived
                    </div>
                </div>
                <div className="bg-card border border-border/40 rounded-xl p-4">
                    <div className="text-3xl font-black text-blue-500">
                        {items.filter(i => i.lessons_learned).length}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                        With Learnings
                    </div>
                </div>
                <div className="bg-card border border-border/40 rounded-xl p-4">
                    <div className="text-3xl font-black text-purple-500">
                        {allTags.length}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                        Learning Patterns
                    </div>
                </div>
            </div>

            {/* Grid */}
            <GraveyardGrid
                items={items}
                isLoading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Learnings</DialogTitle>
                    </DialogHeader>

                    {editData && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-xs font-bold uppercase tracking-wider">Why It Failed</Label>
                                <Textarea
                                    value={editData.why_failed}
                                    onChange={(e) => setEditData({ ...editData, why_failed: e.target.value })}
                                    placeholder="What went wrong with this idea?"
                                    className="mt-2 h-24"
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-bold uppercase tracking-wider">Key Learnings</Label>
                                <Textarea
                                    value={editData.lessons_learned || ''}
                                    onChange={(e) => setEditData({ ...editData, lessons_learned: e.target.value })}
                                    placeholder="What did you learn from this experience?"
                                    className="mt-2 h-24"
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-bold uppercase tracking-wider">Future Pivots</Label>
                                <Textarea
                                    value={editData.future_pivots || ''}
                                    onChange={(e) => setEditData({ ...editData, future_pivots: e.target.value })}
                                    placeholder="How could this idea pivot in the future?"
                                    className="mt-2 h-24"
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-bold uppercase tracking-wider mb-2 block">Learning Tags</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['market-gap', 'timing', 'differentiation', 'monetization', 'tech-gap', 'competition'].map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant={editData.learnings_tags?.includes(tag) ? 'default' : 'outline'}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                const tags = editData.learnings_tags || []
                                                if (tags.includes(tag)) {
                                                    setEditData({
                                                        ...editData,
                                                        learnings_tags: tags.filter((t: string) => t !== tag),
                                                    })
                                                } else {
                                                    setEditData({
                                                        ...editData,
                                                        learnings_tags: [...tags, tag],
                                                    })
                                                }
                                            }}
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveEdit} disabled={editLoading}>
                                    {editLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Clear Graveyard Confirmation Dialog */}
            <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-500">Clear Entire Graveyard?</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            This will permanently delete <span className="font-bold text-foreground">{items.length} ideas</span> from your graveyard. This action cannot be undone.
                        </p>
                        
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">⚠️ Warning</p>
                            <p className="text-sm text-red-500/80">
                                All learnings, tags, and notes associated with these ideas will be lost forever.
                            </p>
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsClearDialogOpen(false)}
                                disabled={isClearing}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive"
                                onClick={handleClearGraveyard} 
                                disabled={isClearing}
                            >
                                {isClearing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Clearing...
                                    </>
                                ) : (
                                    'Clear All'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
