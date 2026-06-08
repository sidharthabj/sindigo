'use client'

import { useEffect } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function ProfileError({
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
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold mb-2">Could not load profile</h1>
      <p className="text-muted-foreground mb-6">
        There was a problem loading this profile. Please try again.
      </p>
      <div className="flex gap-3 justify-center">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>Go home</Link>
      </div>
    </div>
  )
}
