import { render, screen, within } from '@testing-library/react'
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

function getShelfLinks(title: string) {
  const heading = screen.getByRole('heading', { name: title })
  const section = heading.closest('section')!
  return within(section).getAllByRole('link')
}

function queryShelfLinks(title: string) {
  const heading = screen.getByRole('heading', { name: title })
  const section = heading.closest('section')!
  return within(section).queryAllByRole('link')
}

describe('ShelfSection', () => {
  it('renders nothing when entries is empty', () => {
    const { container } = render(<ShelfSection title="Read" entries={[]} username="alice" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows all entries when count is 5 or fewer', () => {
    render(<ShelfSection title="Read" entries={makeEntries(5)} username="alice" />)
    expect(getShelfLinks('Read')).toHaveLength(5)
  })

  it('shows only 5 entries by default when count exceeds 5', () => {
    render(<ShelfSection title="Read" entries={makeEntries(10)} username="alice" />)
    expect(getShelfLinks('Read')).toHaveLength(5)
  })

  it('does not render a toggle button when entries are 5 or fewer', () => {
    render(<ShelfSection title="Read" entries={makeEntries(5)} username="alice" />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders "Show X more" button when entries exceed 5', () => {
    render(<ShelfSection title="Read" entries={makeEntries(10)} username="alice" />)
    expect(screen.getByRole('button', { name: 'Show 5 more' })).toBeInTheDocument()
  })

  it('expands to show all entries when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<ShelfSection title="Read" entries={makeEntries(10)} username="alice" />)
    await user.click(screen.getByRole('button', { name: 'Show 5 more' }))
    expect(getShelfLinks('Read')).toHaveLength(10)
  })

  it('changes button label to "Show fewer" when expanded', async () => {
    const user = userEvent.setup()
    render(<ShelfSection title="Read" entries={makeEntries(10)} username="alice" />)
    await user.click(screen.getByRole('button', { name: 'Show 5 more' }))
    expect(screen.getByRole('button', { name: 'Show fewer' })).toBeInTheDocument()
  })

  it('collapses back to 5 when "Show fewer" is clicked', async () => {
    const user = userEvent.setup()
    render(<ShelfSection title="Read" entries={makeEntries(10)} username="alice" />)
    await user.click(screen.getByRole('button', { name: 'Show 5 more' }))
    await user.click(screen.getByRole('button', { name: 'Show fewer' }))
    expect(getShelfLinks('Read')).toHaveLength(5)
  })

  it('shows all entries without truncation in horizontal mode', () => {
    render(
      <ShelfSection title="Currently Reading" entries={makeEntries(10)} username="alice" horizontal />
    )
    expect(getShelfLinks('Currently Reading')).toHaveLength(10)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('link count is resilient to extra links outside the shelf grid', () => {
    render(
      <>
        <ShelfSection title="Read" entries={makeEntries(5)} username="alice" />
        <a href="/extra">Extra link outside shelf</a>
      </>
    )
    expect(getShelfLinks('Read')).toHaveLength(5)
  })

  it('shows correct count when two ShelfSections are rendered together', () => {
    render(
      <>
        <ShelfSection title="Read" entries={makeEntries(3)} username="alice" />
        <ShelfSection title="Wishlist" entries={makeEntries(7)} username="alice" />
      </>
    )
    expect(getShelfLinks('Read')).toHaveLength(3)
    expect(getShelfLinks('Wishlist')).toHaveLength(5)
  })
})
