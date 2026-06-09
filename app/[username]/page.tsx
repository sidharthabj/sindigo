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

  const [
    { data: entries },
    { count: followerCount },
    { count: followingCount },
    { data: followRow },
  ] = await Promise.all([
    supabase
      .from('shelf_entries')
      .select('*, book:books(*)')
      .eq('user_id', profile.id)
      .order('updated_at', { ascending: false })
      .limit(200),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    user
      ? supabase.from('follows').select('follower_id').eq('follower_id', user.id).eq('following_id', profile.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const allEntries = (entries ?? []) as ShelfEntryWithBook[]
  const reading = allEntries.filter(e => e.status === 'reading')
  const read = allEntries.filter(e => e.status === 'read')
  const wishlist = allEntries.filter(e => e.status === 'wishlist')

  return (
    <div className="max-w-3xl mx-auto px-4">
      <ProfileHeader
        profile={profile}
        followerCount={followerCount ?? 0}
        followingCount={followingCount ?? 0}
        isFollowing={!!followRow}
        isOwner={user?.id === profile.id}
        currentUserId={user?.id ?? null}
      />
      <div className="space-y-6 pb-10">
        <ShelfSection key={`${username}-reading`} title="Currently Reading" entries={reading} username={username} horizontal />
        <ShelfSection key={`${username}-read`} title="Read" entries={read} username={username} />
        <ShelfSection key={`${username}-wishlist`} title="Wishlist" entries={wishlist} username={username} />
      </div>
    </div>
  )
}
