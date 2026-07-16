import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RenderTimeProvider, useRenderTime } from './RenderTimeProvider'

function RenderTimeValue() {
  return <time>{useRenderTime().toISOString()}</time>
}

describe('RenderTimeProvider', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('uses the serialized request timestamp during server rendering', () => {
    const initialTimestamp = '2026-07-12T09:30:00.000Z'

    const html = renderToString(
      <RenderTimeProvider
        snapshot={{ mode: 'live', timestamp: initialTimestamp }}
      >
        <RenderTimeValue />
      </RenderTimeProvider>,
    )

    expect(html).toContain(initialTimestamp)
  })

  it('refreshes the timestamp after mounting in the browser', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-12T10:00:00.000Z'))

    render(
      <RenderTimeProvider
        snapshot={{
          mode: 'live',
          timestamp: '2026-07-12T09:30:00.000Z',
        }}
      >
        <RenderTimeValue />
      </RenderTimeProvider>,
    )

    expect(screen.getByText('2026-07-12T10:00:00.000Z')).toBeInTheDocument()
  })

  it('hydrates from the server timestamp before refreshing the client time', async () => {
    const initialTimestamp = '2026-07-12T09:30:00.000Z'
    const container = document.createElement('div')
    container.innerHTML = renderToString(
      <RenderTimeProvider
        snapshot={{ mode: 'live', timestamp: initialTimestamp }}
      >
        <RenderTimeValue />
      </RenderTimeProvider>,
    )
    document.body.appendChild(container)

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-12T10:00:00.000Z'))
    const onRecoverableError = vi.fn()
    let root: ReturnType<typeof hydrateRoot>

    await act(async () => {
      root = hydrateRoot(
        container,
        <RenderTimeProvider
          snapshot={{ mode: 'live', timestamp: initialTimestamp }}
        >
          <RenderTimeValue />
        </RenderTimeProvider>,
        { onRecoverableError },
      )
    })

    expect(onRecoverableError).not.toHaveBeenCalled()
    expect(container).toHaveTextContent('2026-07-12T10:00:00.000Z')

    act(() => root.unmount())
    container.remove()
  })

  it('keeps a fixed snapshot through hydration', async () => {
    const fixedTimestamp = '2025-09-15T12:00:00.000Z'
    const snapshot = { mode: 'fixed', timestamp: fixedTimestamp } as const
    const container = document.createElement('div')
    container.innerHTML = renderToString(
      <RenderTimeProvider snapshot={snapshot}>
        <RenderTimeValue />
      </RenderTimeProvider>,
    )
    document.body.appendChild(container)

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-12T10:00:00.000Z'))
    const onRecoverableError = vi.fn()
    let root: ReturnType<typeof hydrateRoot>

    await act(async () => {
      root = hydrateRoot(
        container,
        <RenderTimeProvider snapshot={snapshot}>
          <RenderTimeValue />
        </RenderTimeProvider>,
        { onRecoverableError },
      )
    })

    expect(onRecoverableError).not.toHaveBeenCalled()
    expect(container).toHaveTextContent(fixedTimestamp)

    act(() => root.unmount())
    container.remove()
  })

  it('publishes client readiness only after effects mount', async () => {
    const snapshot = {
      mode: 'fixed',
      timestamp: '2025-09-15T12:00:00.000Z',
    } as const
    const container = document.createElement('div')
    container.innerHTML = renderToString(
      <RenderTimeProvider snapshot={snapshot}>
        <RenderTimeValue />
      </RenderTimeProvider>,
    )
    document.body.appendChild(container)

    expect(document.documentElement).not.toHaveAttribute(
      'data-react-client-ready',
    )

    let root: ReturnType<typeof hydrateRoot>
    await act(async () => {
      root = hydrateRoot(
        container,
        <RenderTimeProvider snapshot={snapshot}>
          <RenderTimeValue />
        </RenderTimeProvider>,
      )
    })

    expect(document.documentElement).toHaveAttribute(
      'data-react-client-ready',
      'true',
    )

    act(() => root.unmount())
    expect(document.documentElement).not.toHaveAttribute(
      'data-react-client-ready',
    )
    container.remove()
  })

  it('updates consumers when a fixed snapshot changes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-12T10:00:00.000Z'))

    const { rerender } = render(
      <RenderTimeProvider
        snapshot={{
          mode: 'fixed',
          timestamp: '2025-09-15T12:00:00.000Z',
        }}
      >
        <RenderTimeValue />
      </RenderTimeProvider>,
    )

    rerender(
      <RenderTimeProvider
        snapshot={{
          mode: 'fixed',
          timestamp: '2025-10-15T12:00:00.000Z',
        }}
      >
        <RenderTimeValue />
      </RenderTimeProvider>,
    )

    expect(screen.getByText('2025-10-15T12:00:00.000Z')).toBeInTheDocument()
    expect(
      screen.queryByText('2026-07-12T10:00:00.000Z'),
    ).not.toBeInTheDocument()
  })

  it('uses the current time when rendered outside the provider', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-12T11:00:00.000Z'))

    render(<RenderTimeValue />)

    expect(screen.getByText('2026-07-12T11:00:00.000Z')).toBeInTheDocument()
  })
})
