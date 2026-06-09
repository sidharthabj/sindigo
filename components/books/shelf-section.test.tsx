// components/books/shelf-section.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ShelfSection } from './shelf-section'
import type { ShelfEntryWithBook } from '@/lib/types'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

function makeEntry(id: string): ShelfEntryWithBook {
  return {
    id,
    status: 'read',
    rating: null,
    note: null,
    created_at: null,
    updated_at: null,
    finished_at: null,
    started_at: null,
    user_id: 'user-1',
    book_id: id,
    book: {
      id,
      title: `Book ${id}`,
      authors: ['Author Name'],
      cover_url: null,
      google_books_id: id,
      created_at: null,
      description: null,
      published_year: null,
    },
  }
}

function makeEntries(count: number): ShelfEntryWithBook[] {
  return Array.from({ length: count }, (_, i) => makeEntry(String(i + 1)))
}

describe('ShelfSection', () => {
  it('renders nothing when entries is empty', () => {
    const { container } = render(<ShelfSection title="Read" entries={[]} username="alice" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows all entries when count is 6 or fewer', () => {
    render(<ShelfSection title="Read" entries={makeEntries(6)} username="alice" />)
    expect(screen.getAllByRole('link')).toHaveLength(6)
  })

  it('shows only 6 entries by default when count exceeds 6', () => {
    render(<ShelfSection title="Read" entries={makeEntries(10)} username="alice" />)
    expect(screen.getAllByRole('link')).toHaveLength(6)
  })

  it('does not render a toggle button when entries are 6 or fewer', () => {
    render(<ShelfSection title="Read" entries={makeEntries(6)} username="alice" />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders "Show all X books" button when entries exceed 6', () => {
    render(<ShelfSection title="Read" entries={makeEntries(10)} username="alice" />)
    expect(screen.getByRole('button', { name: 'Show all 10 books' })).toBeInTheDocument()
  })

  it('expands to show all entries when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<ShelfSection title="Read" entries={makeEntries(10)} username="alice" />)
    await user.click(screen.getByRole('button', { name: 'Show all 10 books' }))
    expect(screen.getAllByRole('link')).toHaveLength(10)
  })

  it('changes button label to "Show fewer" when expanded', async () => {
    const user = userEvent.setup()
    render(<ShelfSection title="Read" entries={makeEntries(10)} username="alice" />)
    await user.click(screen.getByRole('button', { name: 'Show all 10 books' }))
    expect(screen.getByRole('button', { name: 'Show fewer' })).toBeInTheDocument()
  })

  it('collapses back to 6 when "Show fewer" is clicked', async () => {
    const user = userEvent.setup()
    render(<ShelfSection title="Read" entries={makeEntries(10)} username="alice" />)
    await user.click(screen.getByRole('button', { name: 'Show all 10 books' }))
    await user.click(screen.getByRole('button', { name: 'Show fewer' }))
    expect(screen.getAllByRole('link')).toHaveLength(6)
  })

  it('shows all entries without truncation in horizontal mode', () => {
    render(
      <ShelfSection title="Currently Reading" entries={makeEntries(10)} username="alice" horizontal />
    )
    expect(screen.getAllByRole('link')).toHaveLength(10)
    expect(screen.queryByRole('button')).toBeNull()
  })
})
