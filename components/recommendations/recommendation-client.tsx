'use client'

import { useState, useEffect } from 'react'
import { FloatingBooksBg } from './floating-books-bg'
import { BookInputSearch } from './book-input-search'
import { SelectedBooksList } from './selected-books-list'
import { RecommendationResults } from './recommendation-results'
import { ShelfBookPicker, type ShelfBook } from './shelf-book-picker'
import { WishlistButton } from './wishlist-button'
import { Button } from '@/components/ui/button'
import type { InputBook, Recommendation } from '@/lib/types'

export { type ShelfBook }

const LOADING_MESSAGES = ['Analysing your taste…', 'Finding patterns…', 'Almost there…']
const MAX_BOOKS = 5

interface RecommendationClientProps {
  shelfBooks: ShelfBook[]
  existingGoogleBooksIds: string[]
}

export function RecommendationClient({ shelfBooks, existingGoogleBooksIds }: RecommendationClientProps) {
  const [selectedBooks, setSelectedBooks] = useState<InputBook[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const existingSet = new Set(existingGoogleBooksIds)

  useEffect(() => {
    if (!loading) return
    setLoadingMsgIdx(0)
    const interval = setInterval(() => setLoadingMsgIdx(i => (i + 1) % LOADING_MESSAGES.length), 1500)
    return () => clearInterval(interval)
  }, [loading])

  function handleAdd(book: InputBook) {
    if (selectedBooks.length >= MAX_BOOKS || selectedBooks.some(b => b.id === book.id)) return
    setSelectedBooks(prev => [...prev, book])
  }

  function handleToggle(book: InputBook) {
    if (selectedBooks.some(b => b.id === book.id)) {
      setSelectedBooks(prev => prev.filter(b => b.id !== book.id))
    } else {
      handleAdd(book)
    }
  }

  async function handleSubmit() {
    if (selectedBooks.length < 2) return
    setLoading(true)
    setError(null)
    setRecommendations([])
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ books: selectedBooks.map(b => ({ title: b.title, author: b.author })) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      setRecommendations(data.recommendations)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedIds = selectedBooks.map(b => b.id)

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <FloatingBooksBg />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {recommendations.length === 0 ? (
          <>
            <div className="mb-8">
              <h1 className="font-serif text-[clamp(1.75rem,5vw,2.75rem)] font-normal leading-tight tracking-tight mb-2">
                What should I read next?
              </h1>
              <p className="text-muted-foreground">
                Pick from your shelf or search any title — we&apos;ll find what fits your taste.
              </p>
            </div>
            <div className="space-y-6">
              {shelfBooks.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">From your Read shelf</p>
                  <ShelfBookPicker books={shelfBooks} selectedIds={selectedIds} onToggle={handleToggle} />
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-3">Or search any book</p>
                <BookInputSearch onAdd={handleAdd} selectedIds={selectedIds} disabled={selectedBooks.length >= MAX_BOOKS || loading} />
              </div>
              <SelectedBooksList books={selectedBooks} onRemove={id => setSelectedBooks(prev => prev.filter(b => b.id !== id))} />
              {selectedBooks.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedBooks.length} of {MAX_BOOKS} selected
                  {selectedBooks.length < 2 && ' — add at least one more to continue'}
                </p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button size="lg" className="w-full" onClick={handleSubmit} disabled={selectedBooks.length < 2 || loading}>
                {loading ? LOADING_MESSAGES[loadingMsgIdx] : 'Get recommendations →'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-serif text-2xl font-normal mb-6">Your next reads</h2>
            <RecommendationResults
              recommendations={recommendations}
              renderAction={rec => (
                <WishlistButton
                  recommendation={rec}
                  alreadyOnShelf={!!rec.googleBooksId && existingSet.has(rec.googleBooksId)}
                />
              )}
            />
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => { setSelectedBooks([]); setRecommendations([]); setError(null) }}
                className="text-sm text-muted-foreground hover:underline cursor-pointer"
              >
                Start over
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
