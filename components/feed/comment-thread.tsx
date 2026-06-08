'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { addComment, deleteComment } from '@/lib/actions/comments'
import type { CommentWithProfile } from '@/lib/types'

interface CommentThreadProps {
  activityId: string
  comments: CommentWithProfile[]
  currentUserId: string | null
}

export function CommentThread({ activityId, comments, currentUserId }: CommentThreadProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    startTransition(async () => {
      await addComment(activityId, text)
      setText('')
      router.refresh()
    })
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      await deleteComment(commentId)
      router.refresh()
    })
  }

  return (
    <div className="space-y-2">
      {comments.length > 0 && (
        <button
          className="text-xs text-muted-foreground hover:underline cursor-pointer"
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? 'Hide' : 'Show'} {comments.length} comment{comments.length === 1 ? '' : 's'}
        </button>
      )}

      {expanded && (
        <div className="space-y-2">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2 items-start">
              <Avatar className="w-6 h-6">
                <AvatarImage src={c.profile.avatar_url ?? undefined} />
                <AvatarFallback>{c.profile.display_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-sm">
                <Link href={`/${c.profile.username}`} className="font-medium hover:underline">
                  {c.profile.display_name}
                </Link>
                <span className="ml-1">{c.content}</span>
              </div>
              {currentUserId === c.user_id && (
                <button
                  className="text-xs text-muted-foreground hover:text-red-500 hover:underline cursor-pointer"
                  onClick={() => handleDelete(c.id)}
                  disabled={isPending}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {currentUserId && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a comment…"
            className="h-8 text-sm"
            disabled={isPending}
          />
          {text.trim() && (
            <Button type="submit" size="sm" disabled={isPending}>Post</Button>
          )}
        </form>
      )}
    </div>
  )
}
