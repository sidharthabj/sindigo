import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookSearchModal } from '@/components/books/book-search-modal'
import { Button } from '@/components/ui/button'

export default async function SearchPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold mb-2">Add a book</h1>
      <p className="text-muted-foreground mb-6">
        Search for a book to add to one of your shelves.
      </p>
      <BookSearchModal trigger={<Button size="lg">Search for a book</Button>} defaultStatus="wishlist" />
    </div>
  )
}
