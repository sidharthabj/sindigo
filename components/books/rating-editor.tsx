'use client'

import { useState, useTransition } from 'react'
import { Rating } from './rating'
import { updateRating } from '@/lib/actions/books'

interface RatingEditorProps {
  shelfEntryId: string
  initialRating: number
}

export function RatingEditor({ shelfEntryId, initialRating }: RatingEditorProps) {
  const [rating, setRating] = useState(initialRating)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleChange(value: number) {
    const previous = rating
    setRating(value)
    setError(null)
    startTransition(async () => {
      try {
        await updateRating(shelfEntryId, value)
      } catch (err: any) {
        setRating(previous)
        setError(err.message)
      }
    })
  }

  return (
    <div>
      <Rating value={rating} onChange={isPending ? undefined : handleChange} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
