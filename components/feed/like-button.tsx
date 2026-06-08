'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
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
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        'flex flex-col items-center justify-center px-2.5 pt-1.5 pb-1 rounded-lg border transition-all',
        'w-10 shrink-0 select-none cursor-pointer',
        'hover:scale-105 active:scale-95',
        liked
          ? 'border-rose-400 text-rose-500 bg-rose-50 dark:bg-rose-950/30'
          : 'border-border text-muted-foreground hover:border-rose-300 hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20',
        isPending && 'opacity-60 cursor-not-allowed',
      )}
    >
      <Heart
        className={cn('w-5 h-5 transition-transform', liked && 'fill-current scale-110')}
        strokeWidth={liked ? 0 : 2}
      />
      <span className="text-[11px] font-semibold leading-tight tabular-nums mt-0.5">
        {count > 0 ? count : ''}
      </span>
    </button>
  )
}
