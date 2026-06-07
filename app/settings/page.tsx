'use client'

import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/lib/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const originalUsername = useRef('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setDisplayName(data.display_name)
        setUsername(data.username)
        setBio(data.bio ?? '')
        originalUsername.current = data.username
      }
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await updateProfile({ displayName, username, bio })
      const usernameChanged = username !== originalUsername.current
      originalUsername.current = username
      if (usernameChanged) {
        router.push(`/${username}`)
      } else {
        setMessage('Saved!')
        router.refresh()
      }
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <Label htmlFor="displayName">Display name</Label>
          <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required pattern="[a-z0-9_]+" />
          <p className="text-xs text-muted-foreground mt-1">Lowercase letters, numbers, underscores only</p>
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} />
        </div>
        {message && <p className="text-sm text-green-600">{message}</p>}
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
      </form>
      <div className="mt-8 border-t pt-6">
        <Button variant="destructive" onClick={handleSignOut}>Sign out</Button>
      </div>
    </div>
  )
}
