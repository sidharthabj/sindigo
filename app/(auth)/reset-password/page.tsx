'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })

    // Handle race: PASSWORD_RECOVERY may have fired before this listener
    // registered (singleton initializes early). If a session is already in
    // storage, the exchange already succeeded.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    const timeout = setTimeout(() => setExpired(true), 10_000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/feed')
    router.refresh()
  }

  if (!ready && expired) {
    return (
      <div className="max-w-sm mx-auto mt-20 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Link expired or invalid</h1>
        <p className="text-muted-foreground mb-6">
          This password reset link has expired or already been used.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm underline underline-offset-4 hover:text-foreground/80"
        >
          Request a new reset link
        </Link>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="max-w-sm mx-auto mt-20 px-4 text-center text-muted-foreground">
        Verifying reset link…
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto mt-20 px-4">
      <h1 className="text-2xl font-bold mb-8">Choose a new password</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </div>
  )
}
