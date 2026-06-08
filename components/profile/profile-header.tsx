import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { Profile } from '@/lib/types'
import { FollowButton } from './follow-button'

interface ProfileHeaderProps {
  profile: Profile
  followerCount: number
  followingCount: number
  isFollowing: boolean
  isOwner: boolean
  currentUserId: string | null
}

export function ProfileHeader({
  profile, followerCount, followingCount, isFollowing, isOwner, currentUserId
}: ProfileHeaderProps) {
  return (
    <div className="flex items-start gap-4 py-4">
      <Avatar className="w-16 h-16">
        <AvatarImage src={profile.avatar_url ?? undefined} />
        <AvatarFallback>{profile.display_name[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h1 className="text-xl font-bold">{profile.display_name}</h1>
        <p className="text-sm text-muted-foreground">@{profile.username}</p>
        {profile.bio && <p className="mt-1 text-sm">{profile.bio}</p>}
        <div className="flex gap-4 mt-2 text-sm">
          <Link href={`/${profile.username}/followers`} className="hover:underline">
            <span className="font-semibold">{followerCount}</span> followers
          </Link>
          <Link href={`/${profile.username}/following`} className="hover:underline">
            <span className="font-semibold">{followingCount}</span> following
          </Link>
        </div>
      </div>
      <div>
        {isOwner ? (
          <Link href="/settings" className={cn(buttonVariants({ variant: 'outline' }))}>Edit profile</Link>
        ) : currentUserId ? (
          <FollowButton
            followingId={profile.id}
            initialIsFollowing={isFollowing}
            username={profile.username}
          />
        ) : null}
      </div>
    </div>
  )
}
