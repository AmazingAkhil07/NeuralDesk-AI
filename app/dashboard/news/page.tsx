'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, ExternalLink, Trash2, Newspaper, Sparkles, Plus, Search, Filter, TrendingUp, Info } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface NewsItem {
  id: string
  title: string
  url: string
  source: string
  summary: string | null
  tags: string[]
  published_at: string
  created_at: string
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string>('all')

  const [manualNews, setManualNews] = useState({
    title: '',
    url: '',
    source: '',
    summary: '',
    tags: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Fetch news from API
  const fetchNews = async (tag: string = 'all') => {
    try {
      const url = tag === 'all' ? '/api/news' : `/api/news?tag=${tag}`
      console.log('Fetching news from:', url)
      const response = await fetch(url)
      const result = await response.json()

      console.log('News fetch response:', {
        status: response.status,
        ok: response.ok,
        data: result
      })

      if (response.ok) {
        setNews(result.data || [])
        console.log(`Loaded ${result.data?.length || 0} news items`)
      } else {
        console.error('Failed to fetch news:', result.error)
        if (response.status === 401) {
          toast.error('Please log in to view news')
        } else {
          toast.error('Failed to load news')
        }
      }
    } catch (error) {
      console.error('Error fetching news:', error)
      toast.error('Error loading news')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchNews(selectedTag)
  }, [selectedTag])

  const handleRefresh = async () => {
    setRefreshing(true)

    // Show loading toast
    const loadingToast = toast.loading('Refreshing news...')

    try {
      console.log('🔄 Starting news refresh...')

      // Step 1: Delete old news (older than 7 days)
      console.log('🗑️ Deleting old news...')
      const deleteResponse = await fetch('/api/news/cleanup', {
        method: 'POST'
      })

      if (deleteResponse.ok) {
        const deleteResult = await deleteResponse.json()
        console.log(`Deleted ${deleteResult.deleted} old news items`)
      }

      // Step 2: Trigger news aggregation
      const response = await fetch('/api/cron/news', {
        headers: {
          'Authorization': `Bearer neuraldesk_cron_secret_2026_secure_key_789xyz`
        }
      })

      const result = await response.json()
      console.log('📰 Aggregation result:', result)

      if (response.ok) {
        const stats = result.stats || {}
        const messages = []
        if (stats.newNews > 0) messages.push(`✨ ${stats.newNews} news added`)
        if (stats.updatedNews > 0) messages.push(`🔄 ${stats.updatedNews} updated`)
        if (stats.deletedOld > 0) messages.push(`🗑️ ${stats.deletedOld} cleared`)

        const summary = messages.length > 0 ? messages.join(' • ') : '✓ News is already up to date'

        toast.success(summary, {
          id: loadingToast,
          description: `Processed ${stats.fetched || 0} recent items`
        })

        // Wait for database to update
        await new Promise(resolve => setTimeout(resolve, 500))
        // Fetch updated news
        await fetchNews(selectedTag)
      } else {
        console.error('Failed to aggregate news:', result)
        toast.error(`Failed to fetch news`, {
          id: loadingToast,
          description: result.error || 'Unknown error'
        })
        await fetchNews(selectedTag)
      }
    } catch (error) {
      console.error('Error during refresh:', error)
      toast.error('Error refreshing news', { id: loadingToast })
      setRefreshing(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/news?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNews(news.filter((item) => item.id !== id))
      }
    } catch (error) {
      console.error('Error deleting news:', error)
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all news articles?')) {
      return
    }

    try {
      const response = await fetch('/api/news?all=true', {
        method: 'DELETE',
      })

      if (response.ok) {
        setNews([])
        alert('All news articles deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting all news:', error)
    }
  }

  // Extract all unique tags
  const allTags = ['all', ...new Set(news.flatMap((item) => item.tags))]

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualNews.title || !manualNews.url || !manualNews.source) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...manualNews,
          tags: manualNews.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
          published_at: new Date().toISOString()
        })
      })

      if (response.ok) {
        toast.success('AI Discovery added to tracker!')
        setManualNews({ title: '', url: '', source: '', summary: '', tags: '' })
        setIsDialogOpen(false)
        fetchNews(selectedTag)
      } else {
        const err = await response.json()
        toast.error(err.error || 'Failed to add news')
      }
    } catch (error) {
      toast.error('Connection error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading news...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="overflow-y-auto">
        {/* Header with Glassmorphism */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-card/60 border-b border-border/20 shadow-lg">
          <div className="container mx-auto px-6 py-6 border-l border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-2.5 bg-primary rounded-xl shadow-lg shadow-primary/20">
                    <Newspaper className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tighter">
                      News Hub
                    </h1>
                  </div>
                </div>
                <p className="text-muted-foreground ml-16 font-medium text-sm">
                  Daily intelligence on AI tools, funding rounds, and lab breakthroughs
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  variant="outline"
                  className="bg-card/50 border-border hover:bg-card hover:text-foreground text-muted-foreground transition-all px-6"
                  size="lg"
                >
                  {refreshing ? (
                    <RefreshCw className="h-5 w-5 mr-3 animate-spin text-primary" />
                  ) : (
                    <RefreshCw className="h-5 w-5 mr-3" />
                  )}
                  {refreshing ? 'Syncing...' : 'Sync News'}
                </Button>
                <Button
                  onClick={handleClearAll}
                  variant="ghost"
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive px-6"
                  size="lg"
                >
                  <Trash2 className="h-5 w-5 mr-3" />
                  Clear Hub
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Manual Add Card with Glassmorphism */}
          <div className="mb-8 p-6 rounded-3xl backdrop-blur-xl bg-card/40 border border-primary/20 shadow-xl flex items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
            <div className="flex items-center gap-6 relative">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary ring-1 ring-primary/25">
                <Plus className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">Manual Intelligence</h2>
                <p className="text-muted-foreground text-sm font-medium">Spotted a new tool or unicorn? Add it to the tracker.</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-8 py-6 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                  <Plus className="h-5 w-5 mr-3" />
                  Add Discovery
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] border-border/40 backdrop-blur-2xl bg-card/95">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">New AI Discovery</DialogTitle>
                  <DialogDescription className="font-medium">
                    Log a manual entry into the NeuralDesk intelligence network.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <form onSubmit={handleSubmitManual} className="grid gap-5">
                    <div className="grid gap-2">
                      <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title</Label>
                      <Input
                        id="title"
                        value={manualNews.title}
                        onChange={(e) => setManualNews({ ...manualNews, title: e.target.value })}
                        placeholder="e.g., Nano Banana: Google's New Image Engine"
                        className="bg-background/50 border-border h-12 rounded-xl focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Intelligence URL</Label>
                      <Input
                        id="url"
                        value={manualNews.url}
                        onChange={(e) => setManualNews({ ...manualNews, url: e.target.value })}
                        placeholder="https://..."
                        className="bg-background/50 border-border h-12 rounded-xl focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="source" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Primary Source</Label>
                      <Input
                        id="source"
                        value={manualNews.source}
                        onChange={(e) => setManualNews({ ...manualNews, source: e.target.value })}
                        placeholder="e.g., Google Research Blog"
                        className="bg-background/50 border-border h-12 rounded-xl focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="summary" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Strategic Summary</Label>
                      <Textarea
                        id="summary"
                        value={manualNews.summary}
                        onChange={(e) => setManualNews({ ...manualNews, summary: e.target.value })}
                        placeholder="Briefly describe the industry impact..."
                        className="bg-background/50 border-border min-h-[120px] rounded-xl focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tags" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Categories (CSV)</Label>
                      <Input
                        id="tags"
                        value={manualNews.tags}
                        onChange={(e) => setManualNews({ ...manualNews, tags: e.target.value })}
                        placeholder="tools, google, funding"
                        className="bg-background/50 border-border h-12 rounded-xl focus:ring-primary/20"
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground font-black w-full h-14 rounded-2xl shadow-xl shadow-primary/20 mt-4">
                        {isSubmitting ? 'Architecting...' : 'Dispatch to Tracker'}
                      </Button>
                    </DialogFooter>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filtering & Layout Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {/* Intel Filters */}
            <div className="md:col-span-2 p-8 rounded-3xl backdrop-blur-xl bg-card/40 border border-border/40 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-black tracking-tight">Intelligence Filters</h2>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {allTags.slice(0, 15).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-300 ${selectedTag === tag
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-primary/50'
                      : 'bg-background/60 text-muted-foreground hover:text-foreground border border-border/60 hover:border-primary/40'
                      }`}
                  >
                    {tag.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Hub Metrics */}
            <div className="p-8 rounded-3xl backdrop-blur-xl bg-card/60 border border-primary/20 shadow-xl relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-28 h-28 bg-primary/5 rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-black tracking-tight">Hub Metrics</h2>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Surface Sources</span>
                  <span className="font-black text-primary">24 Active</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Discovery Latency</span>
                  <span className="font-black text-primary">&lt; 12s</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Trending Signals</span>
                  <span className="font-black text-primary">30 Items</span>
                </div>
              </div>
            </div>
          </div>

          {/* News Grid */}
          {news.length === 0 ? (
            <div className="rounded-3xl backdrop-blur-xl bg-card/20 border border-border/40 shadow-xl p-24 text-center">
              <Newspaper className="h-20 w-20 mx-auto mb-6 text-muted-foreground/20" />
              <p className="text-muted-foreground text-xl font-bold italic tracking-tight">No signals detected. Refresh for latest intelligence.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {news.map((item, index) => (
                <Card
                  key={item.id}
                  className="group hover:shadow-2xl transition-all duration-500 border-border/40 backdrop-blur-xl bg-card hover:-translate-y-2 relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {index < 5 && (
                    <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-br-2xl shadow-lg z-10 flex items-center gap-2 tracking-[0.1em]">
                      <TrendingUp className="h-3 w-3" />
                      TRENDING
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5 z-10">
                    {item.tags.includes('tools') && (
                      <Badge className="bg-amber-400/10 text-amber-500 border-amber-400/20 text-[9px] font-black uppercase px-2 py-0.5">
                        Tool
                      </Badge>
                    )}
                    {item.tags.includes('funding') && (
                      <Badge className="bg-emerald-400/10 text-emerald-500 border-emerald-400/20 text-[9px] font-black uppercase px-2 py-0.5">
                        Capital
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="pb-4 pt-10">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg font-black leading-[1.3] text-foreground group-hover:text-primary transition-colors line-clamp-2 tracking-tight">
                        {item.title}
                      </CardTitle>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-4 font-black tracking-widest">
                      <span className="bg-muted/40 px-2 py-1 rounded text-foreground uppercase">{item.source}</span>
                      <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                      <span>{formatDate(item.published_at).toUpperCase()}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                    <div>
                      {item.summary && item.summary.trim().length > 0 && item.summary !== 'Summary generation failed.' && (
                        <p className="mb-6 text-[13px] text-muted-foreground leading-relaxed line-clamp-4 border-l-2 border-primary/10 pl-4 py-1">
                          {item.summary}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-8">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] border border-border/40 px-2 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-3.5 text-xs font-black text-primary-foreground hover:bg-primary/90 transition-all shadow-xl shadow-primary/10 group-hover:scale-[1.02]"
                    >
                      EXPLORE INTELLIGENCE
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
