'use client'

import Image from 'next/image'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InputBook } from '@/lib/types'

export interface ShelfBook {
  id: string         // google_books_id
  bookId: string     // books.id UUID
  title: string
  author: string
  coverUrl: string | null
}

interface ShelfBookPickerProps {
  books: ShelfBook[]
  selectedIds: string[]
  onToggle: (book: InputBook) => void
}

export function ShelfBookPicker({ books, selectedIds, onToggle }: ShelfBookPickerProps) {
  const selectedSet = new Set(selectedIds)

  if (books.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">No books on your Read shelf yet.</p>
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {books.map(book => {
        const selected = selectedSet.has(book.id)
        return (
          <button
            key={book.bookId}
            type="button"
            onClick={() => onToggle({ id: book.id, title: book.title, author: book.author, coverUrl: book.coverUrl })}
            title={book.title}
            className={cn(
              'relative flex-shrink-0 rounded-md overflow-hidden transition cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected ? 'ring-2 ring-primary' : 'opacity-60 hover:opacity-100'
            )}
          >
            {book.coverUrl ? (
              <Image src={book.coverUrl} alt={book.title} width={52} height={78} className="object-cover block" />
            ) : (
              <div className="w-[52px] h-[78px] bg-muted flex items-center justify-center px-1">
                <span className="text-[9px] text-muted-foreground text-center leading-tight">{book.title}</span>
              </div>
            )}
            {selected && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary drop-shadow-sm" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
