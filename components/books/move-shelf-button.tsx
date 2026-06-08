'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Rating } from './rating'
import { moveToShelf } from '@/lib/actions/books'
import { useRouter } from 'next/navigation'
import type { ShelfStatus } from '@/lib/types'

const OPTIONS: { status: ShelfStatus; label: string }[] = [
  { status: 'wishlist', label: 'Move to Wishlist' },
  { status: 'reading', label: 'Mark as Currently Reading' },
  { status: 'read', label: 'Mark as Read' },
]

interface MoveShelfButtonProps {
  shelfEntryId: string
  currentStatus: ShelfStatus
  currentRating?: number
  username: string
}

export function MoveShelfButton({ shelfEntryId, currentStatus, currentRating, username }: MoveShelfButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(currentRating ?? 0)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleMove(status: ShelfStatus) {
    setError(null)
    startTransition(async () => {
      try {
        await moveToShelf(shelfEntryId, status, status === 'read' ? rating : undefined)
        setOpen(false)
        router.refresh()
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm">Update Status</Button>} />
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
        </DialogHeader>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="space-y-3">
          {OPTIONS.filter(o => o.status !== currentStatus).map(option => (
            <div key={option.status}>
              {option.status === 'read' && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground mb-1">Rating</p>
                  <Rating value={rating} onChange={setRating} />
                </div>
              )}
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleMove(option.status)}
                disabled={isPending || (option.status === 'read' && rating === 0)}
              >
                {option.label}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
