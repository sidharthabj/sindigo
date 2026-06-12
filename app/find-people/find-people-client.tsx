'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FollowButton } from '@/components/profile/follow-button'
import { searchUsersAction, type UserSearchResult } from '@/lib/actions/search'
import Link from 'next/link'

export function FindPeopleClient() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserSearchResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const users = await searchUsersAction(query.trim())
      setResults(users)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Find people</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          placeholder="Search by name or username…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </form>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {results !== null && results.length === 0 && !error && (
        <p className="text-muted-foreground text-sm">No users found for "{query}".</p>
      )}

      <ul className="space-y-3">
        {(results ?? []).map(user => (
          <li key={user.id} className="flex items-center justify-between gap-4 py-3 border-b last:border-0">
            <div className="flex items-center gap-3 min-w-0">
              <Link href={`/${user.username}`} className="shrink-0">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar_url ?? undefined} />
                  <AvatarFallback>{user.display_name[0]}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0">
                <Link href={`/${user.username}`} className="font-medium hover:underline truncate block">
                  {user.display_name}
                </Link>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                {user.bio && (
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">{user.bio}</p>
                )}
              </div>
            </div>
            <FollowButton
              followingId={user.id}
              initialIsFollowing={user.is_following}
              username={user.username}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
