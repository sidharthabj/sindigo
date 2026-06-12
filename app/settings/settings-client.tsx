'use client'

import { createClient } from '@/lib/supabase/client'
import { updateProfile, updateAvatarUrl } from '@/lib/actions/profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  initialDisplayName: string
  initialUsername: string
  initialBio: string
  initialAvatarUrl: string | null
  userId: string
}

export function SettingsClient({ initialDisplayName, initialUsername, initialBio, initialAvatarUrl, userId }: Props) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [username, setUsername] = useState(initialUsername)
  const [bio, setBio] = useState(initialBio)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const originalUsername = useRef(initialUsername)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Photo must be under 2 MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const dotIndex = file.name.lastIndexOf('.')
    if (dotIndex === -1) {
      setErrorMessage('Cannot determine file type. Please upload a file with a .jpg, .png, .gif, or .webp extension.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    const ext = file.name.slice(dotIndex + 1).toLowerCase()
    // Include timestamp in the filename so every upload produces a unique URL,
    // busting the CDN cache for all consumers (profile page, feed, etc.)
    const path = `${userId}/avatar_${Date.now()}.${ext}`

    setUploadingAvatar(true)
    setErrorMessage(null)
    try {
      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: false })

      if (uploadError) throw new Error(uploadError.message)

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      await updateAvatarUrl(publicUrl)
      setAvatarUrl(publicUrl)
    } catch (err: any) {
      setErrorMessage(err.message)
    } finally {
      setUploadingAvatar(false)
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccessMessage(null)
    setErrorMessage(null)
    try {
      await updateProfile({ displayName, username, bio })
      const usernameChanged = username !== originalUsername.current
      originalUsername.current = username
      if (usernameChanged) {
        router.push(`/${username}`)
      } else {
        setSuccessMessage('Saved!')
        router.refresh()
      }
    } catch (err: any) {
      setErrorMessage(err.message)
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

      <div className="mb-6">
        <Label className="mb-2 block">Profile picture</Label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="relative group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Change profile picture"
          >
            <Avatar className="w-20 h-20">
              <AvatarImage src={avatarUrl ?? undefined} />
              <AvatarFallback>{displayName ? displayName[0].toUpperCase() : '?'}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
              <span className="text-white text-xs font-medium">
                {uploadingAvatar ? 'Uploading…' : 'Change'}
              </span>
            </div>
          </button>
          <div className="text-sm text-muted-foreground">
            <p>Click the avatar to upload a new photo.</p>
            <p>JPG, PNG, GIF, or WebP. Max 2 MB.</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Display name</Label>
          <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required pattern="[a-z0-9_]+" />
          <p className="text-xs text-muted-foreground">Lowercase letters, numbers, underscores only</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} />
        </div>
        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
          {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
        </div>
      </form>
      <div className="mt-6 border-t pt-6">
        <Button variant="destructive" onClick={handleSignOut}>Sign out</Button>
      </div>
    </div>
  )
}
