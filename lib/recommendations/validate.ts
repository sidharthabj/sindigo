export interface InputBookRaw {
  title: string
  author: string
}

export function validateBooks(books: unknown): books is InputBookRaw[] {
  if (!Array.isArray(books)) return false
  if (books.length < 2 || books.length > 5) return false
  return books.every(b => {
    if (typeof b !== 'object' || b === null) return false
    const { title, author } = b as any
    return (
      typeof title === 'string' && title.length > 0 && title.length <= 100 &&
      typeof author === 'string' && author.length > 0 && author.length <= 100
    )
  })
}
