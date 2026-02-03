import Link from 'next/link'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Newspaper, Brain, Wrench, Lightbulb, Vault, TrendingUp, ArrowRight, Zap, Users } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch real counts from database
  let newsCount = 0
  let modelsCount = 0
  let toolsCount = 0
  let ideasCount = 0
  let vaultCount = 0

  try {
    const [newsRes, modelsRes, toolsRes, ideasRes, vaultRes] = await Promise.all([
      supabase.from('news').select('id', { count: 'exact', head: true }),
      supabase.from('models').select('id', { count: 'exact', head: true }),
      supabase.from('tools').select('id', { count: 'exact', head: true }),
      supabase.from('ideas').select('id', { count: 'exact', head: true }),
      supabase.from('vault').select('id', { count: 'exact', head: true }),
    ])

    newsCount = newsRes.count || 0
    modelsCount = modelsRes.count || 0
    toolsCount = toolsRes.count || 0
    ideasCount = ideasRes.count || 0
    vaultCount = vaultRes.count || 0
  } catch (error) {
    console.error('Error fetching counts:', error)
  }

  const stats = [
    {
      title: 'AI News',
      value: newsCount.toString(),
      description: 'Saved articles',
      icon: Newspaper,
      href: '/dashboard/news',
      gradient: 'from-amber-500/20 to-amber-600/10',
      accent: 'text-amber-400',
    },
    {
      title: 'AI Models',
      value: modelsCount.toString(),
      description: 'Tracked models',
      icon: Brain,
      href: '/dashboard/models',
      gradient: 'from-yellow-500/20 to-yellow-600/10',
      accent: 'text-yellow-400',
    },
    {
      title: 'AI Tools',
      value: toolsCount.toString(),
      description: 'Saved tools',
      icon: Wrench,
      href: '/dashboard/tools',
      gradient: 'from-amber-500/20 to-amber-600/10',
      accent: 'text-amber-400',
    },
    {
      title: 'Ideas',
      value: ideasCount.toString(),
      description: 'Active ideas',
      icon: Lightbulb,
      href: '/dashboard/ideas',
      gradient: 'from-amber-500/20 to-amber-600/10',
      accent: 'text-amber-400',
    },
    {
      title: 'Vault Items',
      value: vaultCount.toString(),
      description: 'Prompts & templates',
      icon: Vault,
      href: '/dashboard/vault',
      gradient: 'from-yellow-500/20 to-yellow-600/10',
      accent: 'text-yellow-400',
    },
  ]

  return (
    <div>
      <Header title="Dashboard" user={{ email: user?.email }} />
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Welcome Section - Minimal Premium Design */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900/60 to-slate-900/40 border border-amber-600/30 p-12 backdrop-blur-2xl">
            <div className="absolute -right-40 -top-40 h-80 w-80 bg-amber-600/5 rounded-full blur-[120px]" />
            <div className="absolute -left-20 -bottom-20 h-60 w-60 bg-slate-800/10 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">
                {user?.email?.split('@')[0] || 'Welcome'} • Dashboard
              </h2>
              <p className="text-slate-400 max-w-2xl font-normal text-lg leading-relaxed">
                Your unified command center for AI intelligence, startup validation, and market research. Track models, analyze ideas, and discover opportunities in real-time.
              </p>
            </div>
          </div>

          {/* Stats Grid - Premium Minimal Cards */}
          <div>
            <h3 className="text-sm font-bold text-slate-300 mb-6 uppercase tracking-widest opacity-70">Intelligence Metrics</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Link key={stat.title} href={stat.href} className="group">
                    <Card className={`bg-gradient-to-br ${stat.gradient} border-amber-600/30 hover:border-amber-500/50 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-amber-900/30 h-full hover:-translate-y-1`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-widest">{stat.title}</CardTitle>
                          <Icon className={`h-5 w-5 ${stat.accent} opacity-80`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                        <p className="text-xs text-slate-500 font-medium">{stat.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Quick Navigation & Features - Two Column */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Navigation Menu */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900/60 to-slate-900/40 border border-amber-600/30 p-8 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-8 opacity-70">Quick Access</h3>
              <div className="space-y-3">
                <Link href="/dashboard/ideas" className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 hover:bg-amber-600/20 border border-transparent hover:border-amber-500/30 transition-all duration-300 group">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400 group-hover:bg-amber-300" />
                  <span className="text-sm text-slate-300 font-medium">Startup Ideas</span>
                  <ArrowRight className="h-4 w-4 text-slate-600 ml-auto group-hover:text-amber-400 transition-colors" />
                </Link>
                <Link href="/dashboard/models" className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 hover:bg-yellow-600/20 border border-transparent hover:border-yellow-500/30 transition-all duration-300 group">
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400 group-hover:bg-yellow-300" />
                  <span className="text-sm text-slate-300 font-medium">AI Models</span>
                  <ArrowRight className="h-4 w-4 text-slate-600 ml-auto group-hover:text-yellow-400 transition-colors" />
                </Link>
                <Link href="/dashboard/tools" className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 hover:bg-amber-600/20 border border-transparent hover:border-amber-500/30 transition-all duration-300 group">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400 group-hover:bg-amber-300" />
                  <span className="text-sm text-slate-300 font-medium">AI Tools</span>
                  <ArrowRight className="h-4 w-4 text-slate-600 ml-auto group-hover:text-amber-400 transition-colors" />
                </Link>
                <Link href="/dashboard/news" className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 hover:bg-yellow-600/20 border border-transparent hover:border-yellow-500/30 transition-all duration-300 group">
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400 group-hover:bg-yellow-300" />
                  <span className="text-sm text-slate-300 font-medium">AI News</span>
                  <ArrowRight className="h-4 w-4 text-slate-600 ml-auto group-hover:text-yellow-400 transition-colors" />
                </Link>
                <Link href="/dashboard/vault" className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 hover:bg-amber-600/20 border border-transparent hover:border-amber-500/30 transition-all duration-300 group">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400 group-hover:bg-amber-300" />
                  <span className="text-sm text-slate-300 font-medium">Knowledge Vault</span>
                  <ArrowRight className="h-4 w-4 text-slate-600 ml-auto group-hover:text-amber-400 transition-colors" />
                </Link>
              </div>
            </div>

            {/* Platform Overview */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900/60 to-slate-900/40 border border-amber-600/30 p-8 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-8 opacity-70">About NeuralDesk</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-amber-600/30 bg-slate-800/20 hover:border-amber-500/50 hover:bg-slate-800/40 transition-all">
                  <p className="font-semibold text-slate-200 text-sm">📊 Live Analytics Dashboard</p>
                  <p className="text-xs text-slate-400 mt-2">Real-time metrics tracking ideas, models, tools, and market insights with instant updates.</p>
                </div>
                <div className="p-4 rounded-xl border border-amber-600/30 bg-slate-800/20 hover:border-amber-500/50 hover:bg-slate-800/40 transition-all">
                  <p className="font-semibold text-slate-200 text-sm">🤖 AI Evaluation Engine</p>
                  <p className="text-xs text-slate-400 mt-2">Advanced scoring system analyzing startup viability, market demand, and competitive positioning.</p>
                </div>
                <div className="p-4 rounded-xl border border-amber-600/30 bg-slate-800/20 hover:border-amber-500/50 hover:bg-slate-800/40 transition-all">
                  <p className="font-semibold text-slate-200 text-sm">💡 Unified Intelligence Hub</p>
                  <p className="text-xs text-slate-400 mt-2">Centralized access to AI models, tools, news, ideas, and your personal vault—all in one platform.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
