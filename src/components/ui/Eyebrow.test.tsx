import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Eyebrow } from './Eyebrow'

describe('Eyebrow', () => {
  it('renders eyebrow content as inline text', () => {
    render(<Eyebrow>Context</Eyebrow>)

    expect(screen.getByText('Context').tagName).toBe('SPAN')
  })

  it('supports the inverse tone', () => {
    render(<Eyebrow tone="inverse">Inverse context</Eyebrow>)

    expect(screen.getByText('Inverse context')).toHaveClass('text-white/80')
  })
})
