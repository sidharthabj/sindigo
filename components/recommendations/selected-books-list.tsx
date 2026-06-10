'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X } from 'lucide-react'
import type { InputBook } from '@/lib/types'

interface SelectedBooksListProps {
  books: InputBook[]
  onRemove: (id: string) => void
}

export function SelectedBooksList({ books, onRemove }: SelectedBooksListProps) {
  if (books.length === 0) return null

  return (
    <motion.ul layout className="flex flex-wrap gap-2">
      <AnimatePresence mode="popLayout">
        {books.map(book => (
          <motion.li
            key={book.id}
            layout
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 shadow-sm"
          >
            {book.coverUrl ? (
              <Image src={book.coverUrl} alt={book.title} width={20} height={28} className="rounded object-cover flex-shrink-0" />
            ) : (
              <div className="w-5 h-7 rounded bg-muted flex-shrink-0" />
            )}
            <span className="max-w-[130px] truncate text-sm font-medium">{book.title}</span>
            <button
              type="button"
              onClick={() => onRemove(book.id)}
              className="ml-0.5 rounded-full p-0.5 hover:bg-accent transition flex-shrink-0 cursor-pointer"
              aria-label={`Remove ${book.title}`}
            >
              <X className="w-3 h-3" />
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  )
}
