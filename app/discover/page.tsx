'use client'

import { useState, useEffect } from 'react'
import { FloatingBooksBg } from '@/components/recommendations/floating-books-bg'
import { BookInputSearch } from '@/components/recommendations/book-input-search'
import { SelectedBooksList } from '@/components/recommendations/selected-books-list'
import { RecommendationResults } from '@/components/recommendations/recommendation-results'
import { Button } from '@/components/ui/button'
import type { InputBook, Recommendation } from '@/lib/types'

const LOADING_MESSAGES = ['Analysing your taste…', 'Finding patterns…', 'Almost there…']
const MAX_BOOKS = 5

export default function DiscoverPage() {
  const [selectedBooks, setSelectedBooks] = useState<InputBook[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FloatingBooksBg />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16">
        {recommendations.length === 0 ? (
          <>
            <div className="text-center mb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-4">
                AI-Powered · Free · No login required
              </p>
              <h1 className="font-serif text-[clamp(2rem,6vw,3.5rem)] font-normal leading-tight tracking-tight mb-4">
                Find your next<br />favourite read
              </h1>
              <p className="text-muted-foreground text-[1.0625rem]">
                Tell us a few books you've loved — we'll find your next obsession.
              </p>
            </div>
            <div className="space-y-4">
              <BookInputSearch
                onAdd={handleAdd}
                selectedIds={selectedBooks.map(b => b.id)}
                disabled={selectedBooks.length >= MAX_BOOKS || loading}
                placeholder="Search for a book you love…"
              />
              <SelectedBooksList books={selectedBooks} onRemove={id => setSelectedBooks(prev => prev.filter(b => b.id !== id))} />
              {selectedBooks.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedBooks.length} of {MAX_BOOKS} books selected
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
            <RecommendationResults recommendations={recommendations} />
            <div className="mt-8 text-center">
              <button type="button" onClick={() => { setSelectedBooks([]); setRecommendations([]); setError(null) }} className="text-sm text-muted-foreground hover:underline cursor-pointer">
                Start over
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
