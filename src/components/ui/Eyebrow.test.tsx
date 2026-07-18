import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Eyebrow } from './Eyebrow'

describe('Eyebrow', () => {
  it('uses the shared accent treatment by default', () => {
    render(<Eyebrow>Context</Eyebrow>)

    expect(screen.getByText('Context')).toHaveClass(
      'text-xs',
      'font-semibold',
      'uppercase',
      'text-action',
    )
  })

  it('supports inverse contexts', () => {
    render(<Eyebrow tone="inverse">Inverse context</Eyebrow>)

    expect(screen.getByText('Inverse context')).toHaveClass('text-white/80')
  })
})
