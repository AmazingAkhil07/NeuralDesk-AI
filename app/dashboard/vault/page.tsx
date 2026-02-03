'use client'

import { useState, useEffect } from 'react'
import { VaultGrid } from '@/components/vault/VaultGrid'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Bookmark, Zap, X, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface VaultItem {
    id: string
    title: string
    url?: string
    content_excerpt?: string
    source_type: string
    personal_notes?: string
    tags?: string[]
    rating?: number
    created_at: string
}

export default function VaultPage() {
    const [items, setItems] = useState<VaultItem[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [selectedSource, setSelectedSource] = useState<string>('all')
    const [showArchived, setShowArchived] = useState(false)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [newItem, setNewItem] = useState<Partial<VaultItem>>({
        source_type: 'external',
        tags: [],
    })
    const [addLoading, setAddLoading] = useState(false)
    const [allTags, setAllTags] = useState<string[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editData, setEditData] = useState<any>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editLoading, setEditLoading] = useState(false)

    const fetchItems = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.append('search', search)
            if (selectedTag) params.append('tag', selectedTag)
            if (selectedSource !== 'all') params.append('source_type', selectedSource)
            if (showArchived) params.append('archived', 'true')

            const response = await fetch(`/api/vault?${params.toString()}`)
            if (!response.ok) throw new Error('Failed to fetch')
            const data = await response.json()
            setItems(data)

            // Collect all tags
            const tags = new Set<string>()
            data.forEach((item: VaultItem) => {
                item.tags?.forEach((tag: string) => tags.add(tag))
            })
            setAllTags(Array.from(tags).sort())
        } catch (error) {
            toast.error('Failed to load vault')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchItems()
    }, [search, selectedTag, selectedSource, showArchived])

    const handleAddItem = async () => {
        if (!newItem.title) {
            toast.error('Title is required')
            return
        }

        setAddLoading(true)
        try {
            const response = await fetch('/api/vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem),
            })

            if (!response.ok) throw new Error('Failed to add')
            toast.success('Item saved to vault')
            setIsAddDialogOpen(false)
            setNewItem({ source_type: 'external', tags: [] })
            fetchItems()
        } catch (error) {
            toast.error('Failed to add item')
        } finally {
            setAddLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this?')) return

        try {
            const response = await fetch(`/api/vault/${id}`, { method: 'DELETE' })
            if (!response.ok) throw new Error('Failed to delete')
            toast.success('Item deleted')
            fetchItems()
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    const handleArchive = async (id: string) => {
        try {
            const response = await fetch(`/api/vault/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_archived: true }),
            })

            if (!response.ok) throw new Error('Failed to archive')
            toast.success('Item archived')
            fetchItems()
        } catch (error) {
            toast.error('Failed to archive')
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
            const response = await fetch(`/api/vault/${editingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personal_notes: editData.personal_notes,
                    tags: editData.tags,
                    rating: editData.rating,
                }),
            })

            if (!response.ok) throw new Error('Failed to update')
            toast.success('Item updated')
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

    const sourceOptions = [
        { value: 'all', label: 'All Sources' },
        { value: 'news', label: '📰 News' },
        { value: 'model', label: '🤖 Model' },
        { value: 'tool', label: '🛠️ Tool' },
        { value: 'idea', label: '💡 Idea' },
        { value: 'research', label: '📚 Research' },
        { value: 'external', label: '🔗 External' },
    ]

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative">
                <div className="absolute -left-12 -top-12 h-64 w-64 bg-primary/5 rounded-full blur-[100px] -z-10" />

                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
                        <Bookmark className="h-3 w-3 fill-current" />
                        Knowledge Base Active
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter text-foreground leading-tight">
                            Knowledge <span className="text-primary italic">Vault.</span>
                        </h1>
                        <p className="text-muted-foreground text-base font-medium tracking-tight max-w-lg">
                            Your personal knowledge base. Bookmark, annotate, and search everything that matters.
                        </p>
                    </div>
                </div>

                <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="group border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary font-black h-10 px-4 rounded-xl transition-all duration-300"
                >
                    <Plus className="h-4 w-4 mr-2" /> ADD TO VAULT
                </Button>
            </div>

            {/* Search & Filters */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search bookmarks, notes, tags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-11 bg-card/50 border-border/40"
                    />
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    <Select value={selectedSource} onValueChange={setSelectedSource}>
                        <SelectTrigger className="w-fit h-9 text-xs font-semibold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {sourceOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Tag Filter */}
                    {allTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center">
                            {allTags.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant={selectedTag === tag ? 'default' : 'outline'}
                                    className={cn(
                                        'cursor-pointer text-[10px] font-semibold uppercase tracking-wider transition-all',
                                        selectedTag === tag
                                            ? 'bg-primary/20 text-primary border-primary/40'
                                            : 'hover:border-primary/40 hover:text-primary/70'
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

                    <Button
                        variant={showArchived ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShowArchived(!showArchived)}
                        className="text-[10px] font-semibold uppercase tracking-wider"
                    >
                        {showArchived ? 'Showing Archived' : 'Show Active'}
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border/40 rounded-xl p-4">
                    <div className="text-3xl font-black text-blue-500">{items.length}</div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                        {showArchived ? 'Archived' : 'Active'} Items
                    </div>
                </div>
                <div className="bg-card border border-border/40 rounded-xl p-4">
                    <div className="text-3xl font-black text-green-500">
                        {items.filter(i => i.personal_notes).length}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                        Annotated
                    </div>
                </div>
                <div className="bg-card border border-border/40 rounded-xl p-4">
                    <div className="text-3xl font-black text-yellow-500">
                        {items.filter(i => i.rating && i.rating >= 4).length}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                        5-Star Items
                    </div>
                </div>
                <div className="bg-card border border-border/40 rounded-xl p-4">
                    <div className="text-3xl font-black text-purple-500">{allTags.length}</div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                        Custom Tags
                    </div>
                </div>
            </div>

            {/* Grid */}
            <VaultGrid
                items={items}
                isLoading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onArchive={handleArchive}
            />

            {/* Add Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Save to Knowledge Vault</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label className="text-xs font-bold uppercase tracking-wider">Title *</Label>
                            <Input
                                value={newItem.title || ''}
                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                placeholder="What to call this item?"
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-bold uppercase tracking-wider">Type</Label>
                            <Select value={newItem.source_type || 'external'} onValueChange={(val) => setNewItem({ ...newItem, source_type: val as any })}>
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sourceOptions.filter(o => o.value !== 'all').map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-xs font-bold uppercase tracking-wider">URL (Optional)</Label>
                            <Input
                                value={newItem.url || ''}
                                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                                placeholder="https://..."
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-bold uppercase tracking-wider">Excerpt or Summary</Label>
                            <Textarea
                                value={newItem.content_excerpt || ''}
                                onChange={(e) => setNewItem({ ...newItem, content_excerpt: e.target.value })}
                                placeholder="Brief excerpt or summary..."
                                className="mt-2 h-20"
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-bold uppercase tracking-wider">Your Notes</Label>
                            <Textarea
                                value={newItem.personal_notes || ''}
                                onChange={(e) => setNewItem({ ...newItem, personal_notes: e.target.value })}
                                placeholder="Personal thoughts and insights..."
                                className="mt-2 h-20"
                            />
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddItem} disabled={addLoading}>
                                {addLoading ? 'Saving...' : 'Save to Vault'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Vault Item</DialogTitle>
                    </DialogHeader>

                    {editData && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-xs font-bold uppercase tracking-wider">Your Notes</Label>
                                <Textarea
                                    value={editData.personal_notes || ''}
                                    onChange={(e) => setEditData({ ...editData, personal_notes: e.target.value })}
                                    placeholder="Personal thoughts and insights..."
                                    className="mt-2 h-24"
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-bold uppercase tracking-wider mb-2 block">Rating</Label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Button
                                            key={star}
                                            variant={editData.rating === star ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setEditData({ ...editData, rating: star })}
                                            className="flex-1"
                                        >
                                            {'⭐'.repeat(star)}
                                        </Button>
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
        </div>
    )
}
