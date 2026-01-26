'use client'

import { useState } from 'react'
import { AI_Tool, TOOL_CATEGORIES, ToolStatus, ToolPricingModel } from '@/types/tools'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Sparkles, Loader2, Globe, Check, Star } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ToolFormProps {
    initialData?: Partial<AI_Tool>
    onSubmit: (data: any) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

export function ToolForm({ initialData, onSubmit, onCancel, isLoading }: ToolFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        category: initialData?.category || 'Coding & Dev',
        url: initialData?.url || '',
        logo_url: initialData?.logo_url || '',
        pricing_model: initialData?.pricing_model || 'freemium',
        status: initialData?.status || 'Active',
        rating: initialData?.rating || 5,
        notes: initialData?.notes || '',
        features: initialData?.features?.join(', ') || '',
        pros: initialData?.pros?.join(', ') || '',
        cons: initialData?.cons?.join(', ') || '',
    })

    const [isScraping, setIsScraping] = useState(false)

    const handleSmartFill = async () => {
        if (!formData.url) {
            toast.error('Gimme a URL first, founder.')
            return
        }

        setIsScraping(true)
        try {
            const response = await fetch('/api/tools/smart-fill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: formData.url }),
            })

            if (!response.ok) throw new Error('Data extraction failed')

            const data = await response.json()
            setFormData(prev => ({
                ...prev,
                name: data.name || prev.name,
                description: data.description || prev.description,
                category: data.category || prev.category,
                logo_url: data.logo_url || prev.logo_url,
            }))
            toast.success('Extracted tool intelligence!')
        } catch (error) {
            toast.error('Extraction failed. Manual entry required.')
        } finally {
            setIsScraping(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const data = {
            ...formData,
            features: formData.features ? formData.features.split(',').map(s => s.trim()).filter(Boolean) : [],
            pros: formData.pros ? formData.pros.split(',').map(s => s.trim()).filter(Boolean) : [],
            cons: formData.cons ? formData.cons.split(',').map(s => s.trim()).filter(Boolean) : [],
        }
        onSubmit(data)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="url" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Universal Resource Locator</Label>
                    <div className="flex gap-3">
                        <div className="relative flex-1 group">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                            <Input
                                id="url"
                                placeholder="https://tool-deployment.ai"
                                className="pl-12 h-11 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 focus:border-primary/40 font-bold transition-all"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            className="px-6 h-11 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                            onClick={handleSmartFill}
                            disabled={isScraping}
                        >
                            {isScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-3" />}
                            Auto Fill
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tool Designation</Label>
                        <Input
                            id="name"
                            placeholder="e.g. NeuralPilot Pro"
                            className="h-11 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 font-bold"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Ecosystem Category</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                            <SelectTrigger className="h-11 bg-white/5 border-white/10 rounded-2xl font-bold">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 backdrop-blur-3xl border-white/10 rounded-2xl">
                                {TOOL_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat} className="font-bold py-3 rounded-xl">
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Capability Analysis</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="pros" className="text-[10px] font-bold uppercase tracking-tight text-emerald-500/70 ml-1">Pros (Advantages)</Label>
                            <Textarea
                                id="pros"
                                placeholder="Fast, Free, Local..."
                                className="bg-emerald-500/5 border-emerald-500/10 rounded-xl min-h-[80px] font-medium leading-relaxed focus:ring-emerald-500/20 text-sm"
                                value={formData.pros}
                                onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cons" className="text-[10px] font-bold uppercase tracking-tight text-rose-500/70 ml-1">Cons (Disadvantages)</Label>
                            <Textarea
                                id="cons"
                                placeholder="High Latency, Paid only..."
                                className="bg-rose-500/5 border-rose-500/10 rounded-xl min-h-[80px] font-medium leading-relaxed focus:ring-rose-500/20 text-sm"
                                value={formData.cons}
                                onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                            />
                        </div>
                    </div>
                    <Textarea
                        id="description"
                        placeholder="Briefly analyze the core utility and primary differentiators of this tool..."
                        className="bg-white/5 border-white/10 rounded-2xl min-h-[80px] font-medium leading-relaxed focus:ring-primary/20 text-base py-3 px-6 mt-2"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="features" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Key Features (Comma separated)</Label>
                    <Input
                        id="features"
                        placeholder="Real-time, Open Source, API Access..."
                        className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 font-bold"
                        value={formData.features}
                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="status" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Radar Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: ToolStatus) => setFormData({ ...formData, status: value })}
                        >
                            <SelectTrigger className="h-11 bg-white/5 border-white/10 rounded-2xl font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-white/10 rounded-2xl">
                                <SelectItem value="Active" className="font-bold py-3 text-emerald-500">Active</SelectItem>
                                <SelectItem value="Testing" className="font-bold py-3 text-amber-500">Testing</SelectItem>
                                <SelectItem value="Replaced" className="font-bold py-3 text-rose-500">Replaced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pricing" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Monetization</Label>
                        <Select
                            value={formData.pricing_model}
                            onValueChange={(value: ToolPricingModel) => setFormData({ ...formData, pricing_model: value })}
                        >
                            <SelectTrigger className="h-11 bg-white/5 border-white/10 rounded-2xl font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-white/10 rounded-2xl">
                                <SelectItem value="free" className="font-bold py-3">Free</SelectItem>
                                <SelectItem value="freemium" className="font-bold py-3">Freemium</SelectItem>
                                <SelectItem value="paid" className="font-bold py-3">One-time</SelectItem>
                                <SelectItem value="subscription" className="font-bold py-3">Subscription</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rating" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Performance (1-10)</Label>
                        <div className="relative">
                            <Star className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 fill-amber-500" />
                            <Input
                                id="rating"
                                type="number"
                                min="1"
                                max="10"
                                className="pl-12 h-11 bg-white/5 border-white/10 rounded-2xl font-black text-lg"
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="logo" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Asset Logo Link</Label>
                    <Input
                        id="logo"
                        placeholder="https://..."
                        className="h-11 bg-white/5 border-white/10 rounded-2xl font-bold"
                        value={formData.logo_url}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-8 border-t border-white/5">
                <Button type="button" variant="ghost" className="h-11 px-8 rounded-2xl font-black uppercase tracking-widest text-xs text-muted-foreground hover:text-foreground" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-11 px-10 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-[0.98]"
                >
                    {isLoading && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                    {initialData?.id ? 'COMMIT UPDATE' : 'DEPLOY ENTRY'}
                </Button>
            </div>
        </form>
    )
}
