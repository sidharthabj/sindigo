'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookCard } from './book-card'
import type { ShelfEntryWithBook } from '@/lib/types'

const SHELF_INITIAL_COUNT = 6

interface ShelfSectionProps {
  title: string
  entries: ShelfEntryWithBook[]
  username: string
  horizontal?: boolean
}

export function ShelfSection({ title, entries, username, horizontal }: ShelfSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (entries.length === 0) return null

  const visibleEntries = horizontal || isExpanded ? entries : entries.slice(0, SHELF_INITIAL_COUNT)
  const showToggle = !horizontal && entries.length > SHELF_INITIAL_COUNT

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div
        className={
          horizontal
            ? 'flex gap-4 overflow-x-auto pb-2'
            : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
        }
      >
        <AnimatePresence initial={false}>
          {visibleEntries.map(entry => (
            <motion.div
              key={entry.id}
              className={horizontal ? 'flex-shrink-0 w-28' : ''}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <BookCard entry={entry} username={username} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {showToggle && (
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded(prev => !prev)}
          className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
        >
          {isExpanded ? 'Show fewer' : `Show all ${entries.length} books`}
        </button>
      )}
    </section>
  )
}
