'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function followUser(followingId: string, username: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (user.id === followingId) throw new Error('Cannot follow yourself')

  const { error, data: newFollow } = await supabase
    .from('follows')
    .insert({ follower_id: user.id, following_id: followingId })
    .select()
    .maybeSingle()

  if (error && error.code !== '23505') throw error

  // Only emit activity when a new follow row was created, not on duplicate attempts
  if (newFollow) {
    const { error: activityError } = await supabase.from('activities').insert({
      user_id: user.id,
      activity_type: 'followed_user',
      followed_user_id: followingId,
    })
    if (activityError) console.error('Activity insert failed: followed_user', activityError.message)
  }

  revalidatePath('/feed')
  revalidatePath(`/${username}`)
}

export async function unfollowUser(followingId: string, username: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId)

  if (error) throw error
  revalidatePath(`/${username}`)
}
