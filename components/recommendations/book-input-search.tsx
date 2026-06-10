'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import type { GoogleBook } from '@/lib/google-books'
import type { InputBook } from '@/lib/types'

interface BookInputSearchProps {
  onAdd: (book: InputBook) => void
  selectedIds: string[]
  disabled?: boolean
  placeholder?: string
}

export function BookInputSearch({
  onAdd,
  selectedIds,
  disabled,
  placeholder = 'Search for a book…',
}: BookInputSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GoogleBook[]>([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedSet = new Set(selectedIds)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = query.trim()
    if (trimmed.length < 2) { setResults([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(trimmed)}`)
        const data = await res.json()
        const books: GoogleBook[] = data.items ?? []
        setResults(books.slice(0, 6))
        setOpen(books.length > 0)
      } catch {
        setResults([])
        setOpen(false)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  function handleSelect(book: GoogleBook) {
    if (selectedSet.has(book.id)) return
    onAdd({ id: book.id, title: book.title, author: book.authors[0] ?? '', coverUrl: book.coverUrl })
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-xl border bg-background px-4 py-3 text-base shadow-sm outline-none focus:ring-2 focus:ring-ring transition disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {searching && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            Searching…
          </span>
        )}
      </div>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full rounded-xl border bg-background shadow-lg overflow-hidden"
          >
            {results.map((book, i) => {
              const already = selectedSet.has(book.id)
              return (
                <motion.li
                  key={book.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(book)}
                    disabled={already}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent transition disabled:opacity-50 disabled:cursor-default"
                  >
                    {book.coverUrl ? (
                      <Image src={book.coverUrl} alt={book.title} width={28} height={42} className="rounded object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-7 h-[42px] rounded bg-muted flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{book.authors.join(', ')}</p>
                    </div>
                    {already && <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">Added</span>}
                  </button>
                </motion.li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
