import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LikeButton } from './like-button'
import { CommentThread } from './comment-thread'
import { Rating } from '@/components/books/rating'
import type { ActivityWithDetails } from '@/lib/types'

const EVENT_LABELS: Record<string, string> = {
  added_wishlist: 'wants to read',
  started_reading: 'started reading',
  finished_book: 'finished',
  wrote_review: 'reviewed',
}

interface ActivityCardProps {
  activity: ActivityWithDetails
  currentUserId: string | null
}

export function ActivityCard({ activity, currentUserId }: ActivityCardProps) {
  const { profile } = activity

  if (activity.activity_type === 'followed_user' && !activity.followed_user) return null

  if (activity.activity_type === 'followed_user' && activity.followed_user) {
    const followed = activity.followed_user
    return (
      <div className="border rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex gap-3">
              <Link href={`/${profile.username}`}>
                <Avatar className="w-9 h-9">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback>{profile.display_name[0]}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <Link href={`/${profile.username}`} className="font-semibold hover:underline">
                    {profile.display_name}
                  </Link>
                  {' '}started following{' '}
                  <Link href={`/${followed.username}`} className="font-semibold hover:underline">
                    {followed.display_name}
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : ''}
                </p>
              </div>
            </div>
            <div className="pl-12">
              <CommentThread
                activityId={activity.id}
                comments={activity.comments}
                currentUserId={currentUserId}
              />
            </div>
          </div>
          <div className="self-start">
            <LikeButton
              activityId={activity.id}
              initialCount={activity.like_count}
              initialLiked={activity.user_has_liked}
            />
          </div>
        </div>
      </div>
    )
  }

  if (!activity.shelf_entry) return null
  const entry = activity.shelf_entry
  const { book } = entry

  return (
    <div className="border rounded-lg p-4">
      <div className="flex gap-3">
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex gap-3">
            <Link href={`/${profile.username}`}>
              <Avatar className="w-9 h-9">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback>{profile.display_name[0]}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <Link href={`/${profile.username}`} className="font-semibold hover:underline">
                  {profile.display_name}
                </Link>
                {' '}{EVENT_LABELS[activity.activity_type]}{' '}
                <Link
                  href={`/${profile.username}/books/${book.id}`}
                  className="font-semibold hover:underline"
                >
                  {book.title}
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : ''}
              </p>
            </div>
          </div>

          {activity.activity_type === 'wrote_review' && (
            <div className="pl-12 space-y-2">
              {entry.rating && <Rating value={entry.rating} />}
              {entry.note && (
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {entry.note}
                </p>
              )}
            </div>
          )}

          <div className="pl-12">
            <CommentThread
              activityId={activity.id}
              comments={activity.comments}
              currentUserId={currentUserId}
            />
          </div>
        </div>

        <div className="self-start">
          <LikeButton
            activityId={activity.id}
            initialCount={activity.like_count}
            initialLiked={activity.user_has_liked}
          />
        </div>
      </div>
    </div>
  )
}
