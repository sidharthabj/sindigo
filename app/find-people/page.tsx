import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FindPeopleClient } from './find-people-client'

export default async function FindPeoplePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <FindPeopleClient />
}
