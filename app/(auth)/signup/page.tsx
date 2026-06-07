'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    if (data.session) {
      router.push('/feed')
      router.refresh()
    } else {
      setCheckEmail(true)
    }
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  if (checkEmail) {
    return (
      <div className="max-w-sm mx-auto mt-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Check your email</h1>
        <p className="text-muted-foreground">
          We sent a confirmation link to <strong>{email}</strong>. Click it to finish creating your account.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto mt-16 px-4">
      <h1 className="text-2xl font-bold mb-6">Create account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </Button>
      </form>
      <div className="my-4 text-center text-sm text-muted-foreground">or</div>
      <Button variant="outline" className="w-full" onClick={handleGoogle}>
        Continue with Google
      </Button>
      <p className="mt-4 text-sm text-center">
        Have an account? <Link href="/login" className="underline">Log in</Link>
      </p>
    </div>
  )
}
