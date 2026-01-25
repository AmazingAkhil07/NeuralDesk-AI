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
    href: '/dashboard/news',
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
    <div className="flex h-full w-64 flex-col border-r bg-sidebar border-white/5 ring-1 ring-white/5">
      <div className="p-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-sidebar-foreground tracking-tighter">
            NeuralDesk
          </h1>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold ml-10">
          Intelligence Hub
        </p>
      </div>
      <div className="px-4 mb-4">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start h-10 px-4 transition-all duration-300 rounded-xl relative group/item',
                  isActive
                    ? 'bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-white/5'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                )}
                <Icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          )
        })}
      </nav>
      <div className="px-4 my-4">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />
      </div>
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-10 px-4 rounded-xl transition-all"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Terminate Session
        </Button>
      </div>
    </div>
  )
}
