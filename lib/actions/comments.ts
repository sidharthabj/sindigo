'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const MAX_COMMENT_LENGTH = 1000

export async function addComment(activityId: string, content: string) {
  const trimmed = content.trim()
  if (!trimmed) throw new Error('Comment cannot be empty')
  if (trimmed.length > MAX_COMMENT_LENGTH) throw new Error(`Comment must be ${MAX_COMMENT_LENGTH} characters or fewer`)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('comments')
    .insert({ user_id: user.id, activity_id: activityId, content: trimmed })

  if (error) throw error
  revalidatePath('/feed')
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/feed')
}
