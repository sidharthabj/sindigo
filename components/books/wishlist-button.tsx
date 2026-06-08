'use client'

import { useState } from 'react'
import { addBookToWishlist } from '@/lib/actions/books'

interface WishlistButtonProps {
  bookId: string
  initialIsOnShelf: boolean
}

export function WishlistButton({ bookId, initialIsOnShelf }: WishlistButtonProps) {
  const [isOnShelf, setIsOnShelf] = useState(initialIsOnShelf)
  const [loading, setLoading] = useState(false)

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (isOnShelf || loading) return
    setLoading(true)
    try {
      await addBookToWishlist(bookId)
      setIsOnShelf(true)
    } catch {
      // book may already be on shelf from a race — treat as success
      setIsOnShelf(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || isOnShelf}
      className={`
        absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap
        text-xs px-2.5 py-1 rounded-full font-medium
        opacity-0 group-hover:opacity-100 transition-opacity duration-150
        ${isOnShelf
          ? 'bg-emerald-600 text-white cursor-default'
          : 'bg-black/75 text-white hover:bg-black'
        }
      `}
    >
      {loading ? '…' : isOnShelf ? '✓ On wishlist' : '+ Wishlist'}
    </button>
  )
}
