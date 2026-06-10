import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RecommendationClient, type ShelfBook } from '@/components/recommendations/recommendation-client'

export default async function RecommendationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: readEntries }, { data: allEntries }] = await Promise.all([
    supabase
      .from('shelf_entries')
      .select('book:books(id, google_books_id, title, authors, cover_url)')
      .eq('user_id', user.id)
      .eq('status', 'read')
      .order('updated_at', { ascending: false })
      .limit(20),
    supabase
      .from('shelf_entries')
      .select('book:books(google_books_id)')
      .eq('user_id', user.id),
  ])

  const shelfBooks: ShelfBook[] = (readEntries ?? [])
    .map((e: any) => e.book)
    .filter((b: any) => b?.google_books_id)
    .map((b: any) => ({
      id: b.google_books_id as string,
      bookId: b.id as string,
      title: b.title as string,
      author: (b.authors as string[])?.[0] ?? '',
      coverUrl: b.cover_url as string | null,
    }))

  const existingGoogleBooksIds: string[] = (allEntries ?? [])
    .map((e: any) => e.book?.google_books_id)
    .filter(Boolean) as string[]

  return (
    <RecommendationClient
      shelfBooks={shelfBooks}
      existingGoogleBooksIds={existingGoogleBooksIds}
    />
  )
}
