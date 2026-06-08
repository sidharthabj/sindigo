'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Rating } from './rating'
import { WishlistButton } from './wishlist-button'
import type { ShelfEntryWithBook } from '@/lib/types'

interface BookCardProps {
  entry: ShelfEntryWithBook
  username: string
  isOwner?: boolean
  isOnViewerShelf?: boolean
}

export function BookCard({ entry, username, isOwner, isOnViewerShelf }: BookCardProps) {
  const { book, rating } = entry
  const showWishlistButton = !isOwner && isOnViewerShelf !== undefined

  return (
    <Link href={`/${username}/books/${book.id}`} className="group flex flex-col gap-2">
      <motion.div
        layoutId={`book-${book.id}`}
        className="relative aspect-[2/3] w-full overflow-hidden rounded-md shadow-sm transition-shadow group-hover:shadow-lg bg-muted"
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 20vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground px-2 text-center">
            {book.title}
          </div>
        )}
        {showWishlistButton && (
          <WishlistButton bookId={book.id} initialIsOnShelf={isOnViewerShelf!} />
        )}
      </motion.div>
      <div>
        <p className="text-sm font-medium line-clamp-1">{book.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{book.authors.join(', ')}</p>
        {rating && <Rating value={rating} className="mt-1" />}
      </div>
    </Link>
  )
}
