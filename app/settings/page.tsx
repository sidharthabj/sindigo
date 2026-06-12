import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, bio, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <SettingsClient
      initialDisplayName={profile.display_name}
      initialUsername={profile.username}
      initialBio={profile.bio ?? ''}
      initialAvatarUrl={profile.avatar_url}
      userId={user.id}
    />
  )
}
