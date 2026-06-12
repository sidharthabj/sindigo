import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FindPeopleClient } from './find-people-client'

export default async function FindPeoplePage() {
  const user = await getUser()
  if (!user) redirect('/login')

  return <FindPeopleClient />
}
