import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
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

  it('hydrates with the server value, then applies the system preference', async () => {
    const media = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => media),
    )

    const serverHtml = renderToString(<Preference />)
    expect(serverHtml).toBe('<output>false</output>')

    const container = document.createElement('div')
    container.innerHTML = serverHtml
    document.body.appendChild(container)
    const onRecoverableError = vi.fn()

    await act(async () => {
      hydrateRoot(container, <Preference />, { onRecoverableError })
    })

    expect(onRecoverableError).not.toHaveBeenCalled()
    expect(container).toHaveTextContent('true')
    container.remove()
  })

  it('safely returns false without a browser window', () => {
    vi.stubGlobal('window', undefined)

    expect(prefersReducedMotion()).toBe(false)
  })
})
