'use server'

import { createClient } from '@/lib/supabase/server'
import { searchBooks, type GoogleBook } from '@/lib/google-books'

export async function searchBooksAction(query: string): Promise<GoogleBook[]> {
  return searchBooks(query)
}

export type UserSearchResult = {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  is_following: boolean
}

const MAX_SEARCH_QUERY_LENGTH = 100

export async function searchUsersAction(query: string): Promise<UserSearchResult[]> {
  if (query.length > MAX_SEARCH_QUERY_LENGTH) throw new Error('Search query too long')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Whitelist-sanitize to word chars + spaces only; avoid raw PostgREST filter-string embedding
  const sanitized = query.replace(/[^\w\s]/g, '').trim()
  if (!sanitized) return []

  const pattern = `%${sanitized}%`
  const [usernameRes, displayNameRes] = await Promise.all([
    supabase.from('profiles').select('id, username, display_name, avatar_url, bio')
      .ilike('username', pattern).neq('id', user.id).limit(20),
    supabase.from('profiles').select('id, username, display_name, avatar_url, bio')
      .ilike('display_name', pattern).neq('id', user.id).limit(20),
  ])

  // Merge results, deduplicating by id, up to 20 total
  const seen = new Set<string>()
  const profiles: NonNullable<typeof usernameRes.data> = []
  for (const p of [...(usernameRes.data ?? []), ...(displayNameRes.data ?? [])]) {
    if (!seen.has(p.id) && profiles.length < 20) {
      seen.add(p.id)
      profiles.push(p)
    }
  }

  if (!profiles || profiles.length === 0) return []

  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)
    .in('following_id', profiles.map(p => p.id))

  const followingIds = new Set((follows ?? []).map(f => f.following_id))

  return profiles.map(p => ({
    ...p,
    is_following: followingIds.has(p.id),
  }))
}
