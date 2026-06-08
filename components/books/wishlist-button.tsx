'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { addBookToWishlist } from '@/lib/actions/books'

interface WishlistButtonProps {
  bookId: string
  initialIsOnShelf: boolean
}

export function WishlistButton({ bookId, initialIsOnShelf }: WishlistButtonProps) {
  const [isOnShelf, setIsOnShelf] = useState(initialIsOnShelf)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (isOnShelf || loading) return
    setLoading(true)
    try {
      await addBookToWishlist(bookId)
      setIsOnShelf(true)
    } catch {
      setIsOnShelf(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading || isOnShelf}
      variant={isOnShelf ? 'outline' : 'default'}
    >
      {loading ? 'Adding…' : isOnShelf ? '✓ On your wishlist' : '+ Add to wishlist'}
    </Button>
  )
}
