export async function fetchCoverAndId(
  title: string,
  author: string
): Promise<{ coverUrl: string | null; googleBooksId: string | null }> {
  try {
    const url = new URL('https://www.googleapis.com/books/v1/volumes')
    url.searchParams.set('q', `intitle:${title} inauthor:${author}`)
    url.searchParams.set('maxResults', '1')
    url.searchParams.set('printType', 'books')
    if (process.env.GOOGLE_BOOKS_API_KEY) {
      url.searchParams.set('key', process.env.GOOGLE_BOOKS_API_KEY)
    }
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
    if (!res.ok) return { coverUrl: null, googleBooksId: null }
    const data = await res.json()
    const item = data.items?.[0]
    if (!item) return { coverUrl: null, googleBooksId: null }
    const thumbnail = item.volumeInfo?.imageLinks?.thumbnail
    return {
      coverUrl: thumbnail ? (thumbnail as string).replace('http:', 'https:') : null,
      googleBooksId: (item.id as string) ?? null,
    }
  } catch {
    return { coverUrl: null, googleBooksId: null }
  }
}
