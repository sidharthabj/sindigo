'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleLike(activityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Delete the like if it exists; if 0 rows affected, no like was present
  const { data: deleted, error: deleteError } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', user.id)
    .eq('activity_id', activityId)
    .select('id')

  if (deleteError) throw deleteError

  if (deleted && deleted.length > 0) {
    revalidatePath('/feed')
    return false
  }

  const { error: insertError } = await supabase
    .from('likes')
    .insert({ user_id: user.id, activity_id: activityId })

  if (insertError) throw insertError

  revalidatePath('/feed')
  return true
}
