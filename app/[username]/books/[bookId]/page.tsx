import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { BookOpeningAnimation } from '@/components/books/book-opening-animation'
import { Rating } from '@/components/books/rating'
import { RatingEditor } from '@/components/books/rating-editor'
import { NoteEditor } from '@/components/books/note-editor'
import { ShelfSelector } from '@/components/books/shelf-selector'
import { WishlistButton } from '@/components/books/wishlist-button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { ShelfEntryWithBook } from '@/lib/types'

function decodeHtmlDescription(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

const STATUS_LABELS = {
  wishlist: 'Wishlist',
  reading: 'Currently Reading',
  read: 'Read',
}

const NOTE_LABELS = {
  wishlist: 'Why I want to read this',
  reading: 'My thoughts so far',
  read: 'My review',
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ username: string; bookId: string }>
}) {
  const { username, bookId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('username', username).single()
  if (!profile) notFound()

  const { data: entry } = await supabase
    .from('shelf_entries')
    .select('*, book:books(*)')
    .eq('user_id', profile.id)
    .eq('book_id', bookId)
    .single()

  if (!entry) notFound()

  const typedEntry = entry as ShelfEntryWithBook
  const { book } = typedEntry
  const isOwner = user?.id === profile.id

  const viewerEntry = user && !isOwner
    ? await supabase
        .from('shelf_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .maybeSingle()
        .then(r => r.data)
    : null

  const viewerAlreadyHasBook = !!viewerEntry

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href={`/${username}`} className="text-sm text-muted-foreground hover:underline mb-6 block">
        ← Back to @{username}
      </Link>
      <BookOpeningAnimation bookId={book.id}>
        <div className="flex gap-8 flex-col sm:flex-row">
          {/* Cover */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <div className="relative w-40 aspect-[2/3] rounded-lg overflow-hidden shadow-xl">
              {book.cover_url ? (
                <Image src={book.cover_url} alt={book.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-muted-foreground px-2 text-center">
                  {book.title}
                </div>
              )}
            </div>
            {user && !isOwner && (
              <WishlistButton bookId={book.id} initialIsOnShelf={viewerAlreadyHasBook} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold">{book.title}</h1>
              <p className="text-muted-foreground">{book.authors.join(', ')}</p>
              {book.published_year && (
                <p className="text-sm text-muted-foreground">{book.published_year}</p>
              )}
            </div>

            <Badge variant="secondary">{STATUS_LABELS[typedEntry.status]}</Badge>

            {typedEntry.status === 'read' && (
              isOwner
                ? <RatingEditor shelfEntryId={typedEntry.id} initialRating={typedEntry.rating ?? 0} />
                : typedEntry.rating
                  ? <Rating value={typedEntry.rating} />
                  : null
            )}

            <div>
              <p className="text-sm font-semibold mb-2">{NOTE_LABELS[typedEntry.status]}</p>
              <NoteEditor
                shelfEntryId={typedEntry.id}
                initialNote={typedEntry.note ?? ''}
                isOwner={isOwner}
                status={typedEntry.status}
              />
            </div>

            {isOwner && (
              <ShelfSelector
                shelfEntryId={typedEntry.id}
                currentStatus={typedEntry.status}
                currentRating={typedEntry.rating ?? undefined}
              />
            )}
          </div>
        </div>
      </BookOpeningAnimation>

      {book.description && (
        <div className="mt-8 border-t pt-6">
          <h2 className="font-semibold mb-2">About this book</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{decodeHtmlDescription(book.description)}</p>
        </div>
      )}
    </div>
  )
}
