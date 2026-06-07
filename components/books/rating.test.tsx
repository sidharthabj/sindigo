import { render, screen } from '@testing-library/react'
import { Rating } from './rating'
import { describe, it, expect } from 'vitest'

describe('Rating', () => {
  it('renders 5 book icons', () => {
    render(<Rating value={3} />)
    expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(5)
  })

  it('marks the correct number as filled', () => {
    render(<Rating value={3} />)
    const filled = document.querySelectorAll('[data-filled="true"]')
    expect(filled).toHaveLength(3)
  })

  it('renders 0 filled when value is 0', () => {
    render(<Rating value={0} />)
    const filled = document.querySelectorAll('[data-filled="true"]')
    expect(filled).toHaveLength(0)
  })
})
