export interface GoogleBook {
  id: string
  title: string
  authors: string[]
  coverUrl: string | null
  description: string | null
  publishedYear: number | null
}

export function parseGoogleBooksItem(item: any): GoogleBook {
  const info = item.volumeInfo ?? {}
  const rawYear = parseInt(info.publishedDate?.split('-')[0], 10)
  return {
    id: item.id,
    title: info.title ?? 'Unknown Title',
    authors: info.authors ?? [],
    coverUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') ?? null,
    description: info.description ?? null,
    publishedYear: Number.isFinite(rawYear) ? rawYear : null,
  }
}

export async function searchBooks(query: string): Promise<GoogleBook[]> {
  const url = new URL('https://www.googleapis.com/books/v1/volumes')
  url.searchParams.set('q', query)
  url.searchParams.set('maxResults', '12')
  url.searchParams.set('printType', 'books')
  if (process.env.GOOGLE_BOOKS_API_KEY) {
    url.searchParams.set('key', process.env.GOOGLE_BOOKS_API_KEY)
  }

  const res = await fetch(url.toString(), { next: { revalidate: 60 } } as RequestInit)
  if (!res.ok) throw new Error(`Google Books API error: ${res.status}`)

  const data = await res.json()
  if (!data.items) return []
  return data.items.filter((item: any) => item.id).map(parseGoogleBooksItem)
}

export async function getBookById(googleBooksId: string): Promise<GoogleBook | null> {
  const url = new URL(`https://www.googleapis.com/books/v1/volumes/${googleBooksId}`)
  if (process.env.GOOGLE_BOOKS_API_KEY) {
    url.searchParams.set('key', process.env.GOOGLE_BOOKS_API_KEY)
  }
  const res = await fetch(url.toString(), { next: { revalidate: 60 } } as RequestInit)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Google Books API error: ${res.status}`)
  return parseGoogleBooksItem(await res.json())
}
