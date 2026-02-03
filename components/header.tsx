'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Settings, Sparkles } from 'lucide-react'

interface HeaderProps {
  title: string
  user?: {
    name?: string
    email?: string
    avatar?: string
  }
}

export function Header({ title, user }: HeaderProps) {
  return (
    <header className="border-b border-amber-600/20 bg-gradient-to-r from-slate-950 to-slate-900 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between px-8">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 bg-clip-text text-transparent">{title}</h2>
          <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase mt-1">Innovation Platform</p>
        </div>
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-amber-500/10 hover:text-amber-400 transition-colors text-slate-400"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-amber-500/10 hover:text-amber-400 transition-colors text-slate-400"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer">
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-amber-500/10 transition-colors">
                <Avatar className="h-9 w-9 ring-2 ring-amber-500/30">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white font-bold">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-200">{user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs text-slate-400">Premium Member</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-amber-600/20">
              <DropdownMenuLabel className="text-amber-400">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none text-slate-100">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-slate-400">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-amber-500/10" />
              <DropdownMenuItem className="text-slate-300 focus:bg-amber-500/20 focus:text-amber-300 cursor-pointer">Profile</DropdownMenuItem>
              <DropdownMenuItem className="text-slate-300 focus:bg-amber-500/20 focus:text-amber-300 cursor-pointer">Settings</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-amber-500/10" />
              <DropdownMenuItem className="text-red-400 focus:bg-red-500/20 cursor-pointer">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
