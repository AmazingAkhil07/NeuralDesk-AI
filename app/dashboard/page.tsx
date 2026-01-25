import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { Newspaper, Brain, Wrench, Lightbulb, Vault, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const stats = [
    {
      title: 'AI News',
      value: '0',
      description: 'Saved articles',
      icon: Newspaper,
      href: '/dashboard/news',
    },
    {
      title: 'AI Models',
      value: '0',
      description: 'Tracked models',
      icon: Brain,
      href: '/dashboard/models',
    },
    {
      title: 'AI Tools',
      value: '0',
      description: 'Saved tools',
      icon: Wrench,
      href: '/dashboard/tools',
    },
    {
      title: 'Ideas',
      value: '0',
      description: 'Active ideas',
      icon: Lightbulb,
      href: '/dashboard/ideas',
    },
    {
      title: 'Vault Items',
      value: '0',
      description: 'Prompts & templates',
      icon: Vault,
      href: '/dashboard/vault',
    },
  ]

  return (
    <div>
      <Header title="Dashboard" user={{ email: user?.email }} />
      <div className="p-8">
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900">
            Welcome back, {user?.email?.split('@')[0]}!
          </h3>
          <p className="text-sm text-gray-600">
            Here's what's happening with your AI hub today.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-gray-600">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with NeuralDesk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  • Add your first AI news article
                </p>
                <p className="text-sm text-gray-600">
                  • Track your favorite AI models
                </p>
                <p className="text-sm text-gray-600">
                  • Save useful AI tools
                </p>
                <p className="text-sm text-gray-600">
                  • Create a new idea
                </p>
                <p className="text-sm text-gray-600">
                  • Store prompts in the vault
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
