import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ActivityCard } from '@/components/feed/activity-card'
import type { ActivityWithDetails } from '@/lib/types'

const PAGE_SIZE = 20

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: followRows, error: followsError } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  if (followsError) throw followsError

  const followingIds = (followRows ?? []).map(r => r.following_id)

  if (followingIds.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">
          You're not following anyone yet. Visit a profile to follow people.
        </p>
      </div>
    )
  }

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: rawActivities } = await supabase
    .from('activities')
    .select(`
      *,
      profile:profiles!user_id(username, display_name, avatar_url),
      shelf_entry:shelf_entries!shelf_entry_id(
        *,
        book:books(*)
      ),
      likes(id, user_id),
      comments(
        *,
        profile:profiles!user_id(username, display_name, avatar_url)
      )
    `)
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .range(from, to)

  const activities: ActivityWithDetails[] = (rawActivities ?? []).map(a => ({
    ...a,
    like_count: a.likes.length,
    user_has_liked: a.likes.some((l: any) => l.user_id === user.id),
    comments: a.comments,
  }))

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Feed</h1>
      {activities.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No activity yet.</p>
      ) : (
        <div className="space-y-4">
          {activities.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              currentUserId={user.id}
            />
          ))}
          {activities.length === PAGE_SIZE && (
            <div className="text-center pt-4">
              <Link
                href={`/feed?page=${page + 1}`}
                className="text-sm text-muted-foreground hover:underline"
                scroll={false}
              >
                Load more
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
