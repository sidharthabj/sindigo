'use client'

import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addBookToShelf, addBookManually } from '@/lib/actions/books'
import type { Recommendation } from '@/lib/types'

interface WishlistButtonProps {
  recommendation: Recommendation
  alreadyOnShelf: boolean
}

export function WishlistButton({ recommendation, alreadyOnShelf }: WishlistButtonProps) {
  const [added, setAdded] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (alreadyOnShelf) {
    return <span className="text-xs text-muted-foreground">Already on your shelf</span>
  }

  if (added) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <Check className="w-3 h-3" /> Added to Wishlist
      </span>
    )
  }

  function handleAdd() {
    startTransition(async () => {
      try {
        if (recommendation.googleBooksId) {
          await addBookToShelf(recommendation.googleBooksId, 'wishlist')
        } else {
          await addBookManually(
            { title: recommendation.title, authors: [recommendation.author], coverUrl: recommendation.coverUrl ?? undefined },
            'wishlist'
          )
        }
        setAdded(true)
      } catch {
        // silently fail — user can retry
      }
    })
  }

  return (
    <Button size="sm" variant="outline" onClick={handleAdd} disabled={isPending}>
      {isPending ? 'Adding…' : '+ Add to Wishlist'}
    </Button>
  )
}
