'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const RESERVED_SLUGS = new Set(['feed', 'search', 'settings', 'login', 'signup'])

export async function updateProfile(data: {
  displayName: string
  username: string
  bio: string
}) {
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
