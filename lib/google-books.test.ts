import { describe, it, expect } from 'vitest'
import { parseGoogleBooksItem } from './google-books'

describe('parseGoogleBooksItem', () => {
  const item = {
    id: 'abc123',
    volumeInfo: {
      title: 'Dune',
      authors: ['Frank Herbert'],
      imageLinks: { thumbnail: 'http://example.com/cover.jpg' },
      description: 'A sci-fi epic.',
      publishedDate: '1965-08-01',
    },
  }

  it('extracts id and title', () => {
    const result = parseGoogleBooksItem(item)
    expect(result.id).toBe('abc123')
    expect(result.title).toBe('Dune')
  })

  it('upgrades http cover URLs to https', () => {
    const result = parseGoogleBooksItem(item)
    expect(result.coverUrl).toBe('https://example.com/cover.jpg')
  })

  it('extracts published year from date string', () => {
    const result = parseGoogleBooksItem(item)
    expect(result.publishedYear).toBe(1965)
  })

  it('returns null coverUrl when no imageLinks', () => {
    const noImage = { ...item, volumeInfo: { ...item.volumeInfo, imageLinks: undefined } }
    expect(parseGoogleBooksItem(noImage).coverUrl).toBeNull()
  })

  it('defaults authors to empty array when missing', () => {
    const noAuthors = { ...item, volumeInfo: { ...item.volumeInfo, authors: undefined } }
    expect(parseGoogleBooksItem(noAuthors).authors).toEqual([])
  })
})
