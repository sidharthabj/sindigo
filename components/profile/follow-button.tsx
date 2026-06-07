'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { followUser, unfollowUser } from '@/lib/actions/follows'

interface FollowButtonProps {
  followerId: string
  followingId: string
  initialIsFollowing: boolean
  username: string
}

export function FollowButton({ followerId, followingId, initialIsFollowing, username }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      if (isFollowing) {
        await unfollowUser(followingId, username)
        setIsFollowing(false)
      } else {
        await followUser(followingId, username)
        setIsFollowing(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      onClick={toggle}
      disabled={loading}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  )
}
