'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function FeedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold mb-2">Could not load feed</h1>
      <p className="text-muted-foreground mb-6">
        There was a problem loading your feed. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
