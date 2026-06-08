'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const RESERVED_SLUGS = new Set(['feed', 'search', 'settings', 'login', 'signup', 'find-people'])

const MAX_DISPLAY_NAME_LENGTH = 50
const MAX_BIO_LENGTH = 300

export async function updateProfile(data: {
  displayName: string
  username: string
  bio: string
}) {
  if (!data.displayName.trim()) throw new Error('Display name cannot be empty')
  if (data.displayName.length > MAX_DISPLAY_NAME_LENGTH) throw new Error(`Display name must be ${MAX_DISPLAY_NAME_LENGTH} characters or fewer`)
  if (data.bio.length > MAX_BIO_LENGTH) throw new Error(`Bio must be ${MAX_BIO_LENGTH} characters or fewer`)
  if (RESERVED_SLUGS.has(data.username)) {
    throw new Error(`"${data.username}" is reserved and cannot be used as a username`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: data.displayName, username: data.username, bio: data.bio })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  if (current?.username) revalidatePath(`/${current.username}`)
  if (data.username !== current?.username) revalidatePath(`/${data.username}`)

  return { previousUsername: current?.username ?? null }
}

export async function updateAvatarUrl(avatarUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (profile?.username) revalidatePath(`/${profile.username}`)
}
