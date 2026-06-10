import { describe, it, expect } from 'vitest'
import { validateBooks } from './validate'

describe('validateBooks', () => {
  const valid = [
    { title: 'Dune', author: 'Frank Herbert' },
    { title: 'Foundation', author: 'Isaac Asimov' },
  ]

  it('accepts 2 valid books', () => { expect(validateBooks(valid)).toBe(true) })
  it('accepts 5 valid books', () => {
    const five = Array.from({ length: 5 }, (_, i) => ({ title: `Book ${i}`, author: `Author ${i}` }))
    expect(validateBooks(five)).toBe(true)
  })
  it('rejects 1 book', () => {
    expect(validateBooks([{ title: 'Dune', author: 'Frank Herbert' }])).toBe(false)
  })
  it('rejects 6 books', () => {
    const six = Array.from({ length: 6 }, (_, i) => ({ title: `Book ${i}`, author: `Author ${i}` }))
    expect(validateBooks(six)).toBe(false)
  })
  it('rejects null', () => { expect(validateBooks(null)).toBe(false) })
  it('rejects non-array', () => {
    expect(validateBooks('books')).toBe(false)
    expect(validateBooks({})).toBe(false)
  })
  it('rejects book missing author', () => {
    expect(validateBooks([{ title: 'Dune' }, { title: 'Foundation', author: 'Asimov' }])).toBe(false)
  })
  it('rejects book missing title', () => {
    expect(validateBooks([{ author: 'Herbert' }, { title: 'Foundation', author: 'Asimov' }])).toBe(false)
  })
  it('rejects title over 100 chars', () => {
    expect(validateBooks([
      { title: 'a'.repeat(101), author: 'Author' },
      { title: 'Valid', author: 'Author 2' },
    ])).toBe(false)
  })
  it('rejects author over 100 chars', () => {
    expect(validateBooks([
      { title: 'Valid', author: 'a'.repeat(101) },
      { title: 'Valid 2', author: 'Author' },
    ])).toBe(false)
  })
  it('rejects empty title', () => {
    expect(validateBooks([
      { title: '', author: 'Author' },
      { title: 'Valid', author: 'Author' },
    ])).toBe(false)
  })
  it('rejects empty author', () => {
    expect(validateBooks([
      { title: 'Valid', author: '' },
      { title: 'Valid 2', author: 'Author' },
    ])).toBe(false)
  })
})
