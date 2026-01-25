'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth error:', error)
        router.push('/login')
        return
      }

      if (data.session) {
        // Ensure profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.session.user.id)
          .single()

        if (profileError || !profile) {
          // Create profile if it doesn't exist
          await (supabase.from('profiles') as any).insert({
            id: data.session.user.id,
            email: data.session.user.email!,
            full_name: data.session.user.user_metadata?.full_name || null,
            avatar_url: data.session.user.user_metadata?.avatar_url || null,
          })
        }

        router.push('/dashboard')
        router.refresh()
      } else {
        router.push('/login')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}
