'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Newspaper,
  Brain,
  Wrench,
  Lightbulb,
  Vault,
  Home,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'AI News',
    href: '/news',
    icon: Newspaper,
  },
  {
    title: 'AI Models',
    href: '/dashboard/models',
    icon: Brain,
  },
  {
    title: 'AI Tools',
    href: '/dashboard/tools',
    icon: Wrench,
  },
  {
    title: 'Ideas Hub',
    href: '/dashboard/ideas',
    icon: Lightbulb,
  },
  {
    title: 'AI Vault',
    href: '/dashboard/vault',
    icon: Vault,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-gray-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">NeuralDesk</h1>
        <p className="text-sm text-gray-600">AI Hub Control</p>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-gray-200'
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          )
        })}
      </nav>
      <Separator />
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
