import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ShelfSection } from '@/components/books/shelf-section'
import type { ShelfEntryWithBook } from '@/lib/types'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const isOwner = user?.id === profile.id

  const [
    { data: entries },
    { count: followerCount },
    { count: followingCount },
    { data: followRow },
    { data: viewerEntries },
  ] = await Promise.all([
    supabase
      .from('shelf_entries')
      .select('*, book:books(*)')
      .eq('user_id', profile.id)
      .order('updated_at', { ascending: false }),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    user
      ? supabase.from('follows').select('follower_id').eq('follower_id', user.id).eq('following_id', profile.id).maybeSingle()
      : Promise.resolve({ data: null }),
    user && !isOwner
      ? supabase.from('shelf_entries').select('book_id').eq('user_id', user.id)
      : Promise.resolve({ data: null }),
  ])

  const allEntries = (entries ?? []) as ShelfEntryWithBook[]
  const reading = allEntries.filter(e => e.status === 'reading')
  const read = allEntries.filter(e => e.status === 'read')
  const wishlist = allEntries.filter(e => e.status === 'wishlist')

  const viewerBookIds = viewerEntries
    ? new Set(viewerEntries.map(e => e.book_id))
    : undefined

  return (
    <div className="max-w-3xl mx-auto px-4">
      <ProfileHeader
        profile={profile}
        followerCount={followerCount ?? 0}
        followingCount={followingCount ?? 0}
        isFollowing={!!followRow}
        isOwner={isOwner}
        currentUserId={user?.id ?? null}
      />
      <div className="space-y-6 pb-10">
        <ShelfSection title="Currently Reading" entries={reading} username={username} horizontal isOwner={isOwner} viewerBookIds={viewerBookIds} />
        <ShelfSection title="Read" entries={read} username={username} isOwner={isOwner} viewerBookIds={viewerBookIds} />
        <ShelfSection title="Wishlist" entries={wishlist} username={username} isOwner={isOwner} viewerBookIds={viewerBookIds} />
      </div>
    </div>
  )
}
