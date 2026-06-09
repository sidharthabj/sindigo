import { BookCard } from './book-card'
import type { ShelfEntryWithBook } from '@/lib/types'

interface ShelfSectionProps {
  title: string
  entries: ShelfEntryWithBook[]
  username: string
  horizontal?: boolean
}

export function ShelfSection({ title, entries, username, horizontal }: ShelfSectionProps) {
  if (entries.length === 0) return null

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className={
        horizontal
          ? 'flex gap-4 overflow-x-auto pb-2'
          : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
      }>
        {entries.map(entry => (
          <div key={entry.id} className={horizontal ? 'flex-shrink-0 w-28' : ''}>
            <BookCard entry={entry} username={username} />
          </div>
        ))}
      </div>
    </section>
  )
}
