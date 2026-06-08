'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getBookById } from '@/lib/google-books'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'
import type { ShelfStatus, ActivityType } from '@/lib/types'

const SHELF_ACTIVITY: Record<ShelfStatus, ActivityType> = {
  wishlist: 'added_wishlist',
  reading: 'started_reading',
  read: 'finished_book',
}

// Fix #5: centralised activity insert with error logging instead of silent swallow
async function emitActivity(
  supabase: SupabaseClient<Database>,
  userId: string,
  activityType: ActivityType,
  shelfEntryId: string
) {
  const { error } = await supabase.from('activities').insert({
    user_id: userId,
    activity_type: activityType,
    shelf_entry_id: shelfEntryId,
  })
  if (error) console.error('Activity insert failed:', activityType, error.message)
}

export async function addBookToShelf(googleBooksId: string, status: ShelfStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check DB first — skip the API call if this book was already added by any user
  let { data: book, error: bookError } = await supabase
    .from('books')
    .select()
    .eq('google_books_id', googleBooksId)
    .maybeSingle()

  if (!book) {
    let googleBook
    try {
      googleBook = await getBookById(googleBooksId)
    } catch {
      throw new Error('Unable to fetch book details — please try again.')
    }
    if (!googleBook) throw new Error('Book not found in Google Books')

    ;({ data: book, error: bookError } = await supabase
      .from('books')
      .upsert({
        google_books_id: googleBooksId,
        title: googleBook.title,
        authors: googleBook.authors,
        cover_url: googleBook.coverUrl,
        description: googleBook.description,
        published_year: googleBook.publishedYear,
      }, { onConflict: 'google_books_id' })
      .select()
      .single())
  }

  if (bookError) throw bookError
  if (!book) throw new Error('Book not found')

  const { data: entry, error: entryError } = await supabase
    .from('shelf_entries')
    .insert({
      user_id: user.id,
      book_id: book.id,
      status,
      started_at: status === 'reading' ? new Date().toISOString() : undefined,
      finished_at: status === 'read' ? new Date().toISOString() : undefined,
    })
    .select()
    .single()

  if (entryError) {
    // Fix #2: friendly message instead of raw Postgres unique-violation
    if (entryError.code === '23505') throw new Error('This book is already on your shelf')
    throw entryError
  }

  await emitActivity(supabase, user.id, SHELF_ACTIVITY[status], entry.id)

  const { data: profile } = await supabase
    .from('profiles').select('username').eq('id', user.id).single()
  if (profile) revalidatePath(`/${profile.username}`)

  return entry
}

export async function addBookManually(
  data: { title: string; authors: string[]; coverUrl?: string },
  status: ShelfStatus
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const syntheticId = `manual_${crypto.randomUUID()}`

  const { data: book, error: bookError } = await supabase
    .from('books')
    .insert({
      google_books_id: syntheticId,
      title: data.title,
      authors: data.authors,
      cover_url: data.coverUrl ?? null,
    })
    .select()
    .single()

  if (bookError) throw bookError

  const { data: entry, error: entryError } = await supabase
    .from('shelf_entries')
    .insert({
      user_id: user.id,
      book_id: book.id,
      status,
      // Fix #6: set timestamps consistently with addBookToShelf
      started_at: status === 'reading' ? new Date().toISOString() : undefined,
      finished_at: status === 'read' ? new Date().toISOString() : undefined,
    })
    .select()
    .single()

  if (entryError) throw entryError

  await emitActivity(supabase, user.id, SHELF_ACTIVITY[status], entry.id)

  const { data: profile } = await supabase
    .from('profiles').select('username').eq('id', user.id).single()
  if (profile) revalidatePath(`/${profile.username}`)

  return entry
}

export async function moveToShelf(
  shelfEntryId: string,
  newStatus: ShelfStatus,
  rating?: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fix #1 + #3: fetch current entry to verify ownership and detect whether status changed
  const { data: existing, error: fetchError } = await supabase
    .from('shelf_entries')
    .select('status')
    .eq('id', shelfEntryId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) throw new Error('Shelf entry not found')

  const { error } = await supabase
    .from('shelf_entries')
    .update({
      status: newStatus,
      started_at: newStatus === 'reading' ? new Date().toISOString() : (newStatus === 'wishlist' ? null : undefined),
      finished_at: newStatus === 'read' ? new Date().toISOString() : null,
      rating: newStatus === 'read' ? (rating ?? null) : (newStatus === 'wishlist' ? null : undefined),
    })
    .eq('id', shelfEntryId)
    .eq('user_id', user.id)

  if (error) throw error

  // Fix #3: skip activity emission when status hasn't changed (e.g. rating-only update)
  if (existing.status !== newStatus) {
    await emitActivity(supabase, user.id, SHELF_ACTIVITY[newStatus], shelfEntryId)
  }

  const { data: profile } = await supabase
    .from('profiles').select('username').eq('id', user.id).single()
  if (profile) revalidatePath(`/${profile.username}`)
}

const MAX_NOTE_LENGTH = 5000

export async function updateNote(shelfEntryId: string, note: string) {
  if (note.length > MAX_NOTE_LENGTH) throw new Error(`Note must be ${MAX_NOTE_LENGTH} characters or fewer`)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: existing, error: fetchError } = await supabase
    .from('shelf_entries')
    .select('status, book_id')
    .eq('id', shelfEntryId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) throw new Error('Shelf entry not found')

  const { error } = await supabase
    .from('shelf_entries')
    .update({ note })
    .eq('id', shelfEntryId)
    .eq('user_id', user.id)

  if (error) throw error

  if (existing.status === 'read' && note.trim()) {
    // Per spec: only emit wrote_review if neither finished_book nor wrote_review
    // has already been emitted for this entry (finished_book supersedes wrote_review)
    const { data: priorActivity } = await supabase
      .from('activities')
      .select('id')
      .eq('shelf_entry_id', shelfEntryId)
      .in('activity_type', ['finished_book', 'wrote_review'])
      .maybeSingle()

    if (!priorActivity) {
      await emitActivity(supabase, user.id, 'wrote_review', shelfEntryId)
    }
  }

  const { data: profile } = await supabase
    .from('profiles').select('username').eq('id', user.id).single()
  if (profile) {
    revalidatePath(`/${profile.username}`)
    revalidatePath(`/${profile.username}/books/${existing.book_id}`)
  }
}

export async function addBookToWishlist(bookId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: entry, error } = await supabase
    .from('shelf_entries')
    .insert({ user_id: user.id, book_id: bookId, status: 'wishlist' as ShelfStatus })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('This book is already on your shelf')
    throw error
  }

  await emitActivity(supabase, user.id, 'added_wishlist', entry.id)

  const { data: profile } = await supabase
    .from('profiles').select('username').eq('id', user.id).single()
  if (profile) revalidatePath(`/${profile.username}`)

  return entry
}

export async function updateRating(shelfEntryId: string, rating: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: existing, error: fetchError } = await supabase
    .from('shelf_entries')
    .select('book_id')
    .eq('id', shelfEntryId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !existing) throw new Error('Shelf entry not found')

  const { error } = await supabase
    .from('shelf_entries')
    .update({ rating })
    .eq('id', shelfEntryId)
    .eq('user_id', user.id)

  if (error) throw error

  const { data: profile } = await supabase
    .from('profiles').select('username').eq('id', user.id).single()
  if (profile) {
    revalidatePath(`/${profile.username}`)
    revalidatePath(`/${profile.username}/books/${existing.book_id}`)
  }
}
