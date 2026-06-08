'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'
import { toggleLike } from '@/lib/actions/likes'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  activityId: string
  initialCount: number
  initialLiked: boolean
}

export function LikeButton({ activityId, initialCount, initialLiked }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      const nowLiked = await toggleLike(activityId)
      setLiked(nowLiked)
      setCount(c => nowLiked ? c + 1 : c - 1)
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className={cn('gap-1', liked && 'text-primary')}
    >
      <BookOpen className="w-4 h-4" />
      {count > 0 && <span className="text-xs">{count}</span>}
    </Button>
  )
}
