'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, ExternalLink, Trash2, Newspaper, Sparkles } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { toast } from 'sonner'

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
        toast.success(`✨ Fetched ${result.inserted || 0} new articles`, {
          id: loadingToast,
          description: `Total: ${result.fetched || 0} items processed`
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
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Header with Glassmorphism */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Newspaper className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI News Hub
                </h1>
              </div>
              <p className="text-slate-600 ml-14">
                {news.length} articles from 17 sources • Updated with AI summaries
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="bg-white/80 border-white/20 hover:bg-white shadow-lg"
                size="lg"
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Refresh News
                  </>
                )}
              </Button>
              <Button
                onClick={handleClearAll}
                variant="outline"
                className="bg-white/80 border-white/20 hover:bg-white shadow-lg"
                size="lg"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Tag Filters Card with Glassmorphism */}
        <div className="mb-8 p-6 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/20 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">Filter by Topic</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedTag === tag
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white/80 text-slate-700 hover:bg-white border border-white/20 shadow-md hover:shadow-lg'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        {news.length === 0 ? (
          <div className="rounded-2xl backdrop-blur-xl bg-white/60 border border-white/20 shadow-xl p-12 text-center">
            <Newspaper className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 text-lg">No news articles found. Click Refresh to fetch latest news.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <Card 
                key={item.id} 
                className="group hover:shadow-2xl transition-all duration-300 border-white/20 backdrop-blur-sm bg-white/80 hover:-translate-y-1"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold leading-snug line-clamp-2 text-slate-900">
                      {item.title}
                    </CardTitle>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <span className="font-semibold">{item.source}</span>
                    <span>•</span>
                    <span>{formatDate(item.published_at)}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {item.summary && item.summary.trim().length > 0 && item.summary !== 'Summary generation failed.' && (
                    <p className="mb-3 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-blue-200/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                  >
                    Read Full Article
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5 text-blue-600" />
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
