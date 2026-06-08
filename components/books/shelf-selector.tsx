'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Rating } from './rating'
import { moveToShelf, removeFromShelf } from '@/lib/actions/books'
import type { ShelfStatus } from '@/lib/types'

const SEGMENTS: { status: ShelfStatus; label: string }[] = [
  { status: 'wishlist', label: 'Wishlist' },
  { status: 'reading', label: 'Reading' },
  { status: 'read', label: 'Read' },
]

interface ShelfSelectorProps {
  shelfEntryId: string
  currentStatus: ShelfStatus
  currentRating?: number
}

export function ShelfSelector({ shelfEntryId, currentStatus, currentRating }: ShelfSelectorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingRead, setPendingRead] = useState(false)
  const [rating, setRating] = useState(currentRating ?? 0)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSegmentClick(status: ShelfStatus) {
    if (status === currentStatus) return
    setError(null)
    setConfirmRemove(false)

    if (status === 'read') {
      setPendingRead(true)
      return
    }

    setPendingRead(false)
    startTransition(async () => {
      try {
        await moveToShelf(shelfEntryId, status)
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  function handleSaveRead() {
    setError(null)
    startTransition(async () => {
      try {
        await moveToShelf(shelfEntryId, 'read', rating || undefined)
        setPendingRead(false)
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  function handleRemove() {
    setError(null)
    startTransition(async () => {
      try {
        await removeFromShelf(shelfEntryId)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-lg border divide-x overflow-hidden">
        {SEGMENTS.map(({ status, label }) => {
          const isActive = status === currentStatus
          return (
            <button
              key={status}
              type="button"
              onClick={() => handleSegmentClick(status)}
              disabled={isPending}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-foreground text-background cursor-default'
                  : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer',
                isPending && 'opacity-60'
              )}
            >
              {label}
            </button>
          )
        })}
      </div>

      {pendingRead && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Rate it (optional)</p>
          <Rating value={rating} onChange={setRating} />
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={handleSaveRead}
              disabled={isPending}
              className="font-medium hover:underline disabled:opacity-60"
            >
              {isPending ? 'Saving…' : 'Mark as Read'}
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              type="button"
              onClick={() => setPendingRead(false)}
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="text-sm">
        {confirmRemove ? (
          <span className="text-muted-foreground">
            Remove this book from your shelf?{' '}
            <button
              type="button"
              onClick={handleRemove}
              disabled={isPending}
              className="text-red-500 hover:underline font-medium disabled:opacity-60"
            >
              {isPending ? 'Removing…' : 'Yes, remove'}
            </button>
            {' · '}
            <button
              type="button"
              onClick={() => setConfirmRemove(false)}
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmRemove(true)}
            className="text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
          >
            Remove from shelf
          </button>
        )}
      </div>
    </div>
  )
}
