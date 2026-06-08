'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { GoogleBook } from '@/lib/google-books'
import { searchBooksAction } from '@/lib/actions/search'
import { addBookToShelf, addBookManually } from '@/lib/actions/books'
import type { ShelfStatus } from '@/lib/types'

const STATUS_LABELS: Record<ShelfStatus, string> = {
  wishlist: 'Wishlist',
  reading: 'Currently Reading',
  read: 'Read',
}

interface BookSearchModalProps {
  trigger?: React.ReactElement
  defaultStatus?: ShelfStatus
}

export function BookSearchModal({ trigger, defaultStatus = 'wishlist' }: BookSearchModalProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GoogleBook[]>([])
  const [searching, setSearching] = useState(false)
  const [status, setStatus] = useState<ShelfStatus>(defaultStatus)
  const [showManual, setShowManual] = useState(false)
  const [manualTitle, setManualTitle] = useState('')
  const [manualAuthor, setManualAuthor] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setError(null)
    try {
      const books = await searchBooksAction(query)
      setResults(books)
      if (books.length === 0) setShowManual(true)
    } catch {
      setResults([])
      setError('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  function handleAdd(googleBooksId: string) {
    startTransition(async () => {
      try {
        await addBookToShelf(googleBooksId, status)
        setOpen(false)
        resetState()
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  function handleManualAdd(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        await addBookManually({ title: manualTitle, authors: [manualAuthor] }, status)
        setOpen(false)
        resetState()
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  function resetState() {
    setQuery('')
    setResults([])
    setShowManual(false)
    setManualTitle('')
    setManualAuthor('')
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) resetState() }}>
      <DialogTrigger render={trigger ?? <Button>Add book</Button>} />
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a book</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 flex-wrap">
          {(Object.keys(STATUS_LABELS) as ShelfStatus[]).map(s => (
            <Button
              key={s}
              variant={status === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatus(s)}
            >
              {STATUS_LABELS[s]}
            </Button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search by title or author…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <Button type="submit" disabled={searching}>
            {searching ? 'Searching…' : 'Search'}
          </Button>
        </form>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {results.length > 0 && (
          <ul className="space-y-3">
            {results.map(book => (
              <li key={book.id} className="flex gap-3 items-start">
                {book.coverUrl && (
                  <Image
                    src={book.coverUrl}
                    alt={book.title}
                    width={40}
                    height={60}
                    className="rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.authors.join(', ')}</p>
                  {book.publishedYear && (
                    <p className="text-xs text-muted-foreground">{book.publishedYear}</p>
                  )}
                </div>
                <Button size="sm" onClick={() => handleAdd(book.id)} disabled={isPending}>
                  Add
                </Button>
              </li>
            ))}
          </ul>
        )}

        {showManual && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Can't find your book? Add it manually.
            </p>
            <form onSubmit={handleManualAdd} className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input value={manualTitle} onChange={e => setManualTitle(e.target.value)} required />
              </div>
              <div>
                <Label>Author</Label>
                <Input value={manualAuthor} onChange={e => setManualAuthor(e.target.value)} required />
              </div>
              <Button type="submit" disabled={isPending}>Add manually</Button>
            </form>
          </div>
        )}

        {results.length > 0 && !showManual && (
          <button
            className="text-xs text-muted-foreground underline text-center"
            onClick={() => setShowManual(true)}
          >
            Can't find your book? Add it manually
          </button>
        )}
      </DialogContent>
    </Dialog>
  )
}
