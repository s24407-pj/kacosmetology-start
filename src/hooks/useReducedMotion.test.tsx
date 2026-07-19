import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { prefersReducedMotion, useReducedMotion } from './useReducedMotion'

function Preference() {
  return <output>{String(useReducedMotion())}</output>
}

describe('useReducedMotion', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('uses the initial system preference and updates when it changes', () => {
    let listener: (() => void) | undefined
    const media = {
      matches: true,
      addEventListener: vi.fn((_event: string, callback: () => void) => {
        listener = callback
      }),
      removeEventListener: vi.fn(),
    }
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => media),
    )

    render(<Preference />)
    expect(screen.getByText('true')).toBeInTheDocument()

    act(() => {
      media.matches = false
      listener?.()
    })
    expect(screen.getByText('false')).toBeInTheDocument()
  })

  it('safely returns false without a browser window', () => {
    vi.stubGlobal('window', undefined)

    expect(prefersReducedMotion()).toBe(false)
  })
})
