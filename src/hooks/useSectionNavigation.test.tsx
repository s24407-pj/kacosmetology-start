import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { navigate } = vi.hoisted(() => ({
  navigate: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
}))

import { useSectionNavigation } from './useSectionNavigation'

describe('useSectionNavigation', () => {
  beforeEach(() => {
    navigate.mockClear()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('replaces the hash through TanStack Router', async () => {
    const section = document.createElement('section')
    section.id = 'zabiegi'
    document.body.appendChild(section)
    const { result } = renderHook(() => useSectionNavigation())

    await act(() => result.current('zabiegi'))

    expect(navigate).toHaveBeenCalledWith({
      to: '/',
      hash: 'zabiegi',
      replace: true,
      resetScroll: false,
      hashScrollIntoView: { behavior: 'smooth', block: 'start' },
    })
  })

  it('scrolls when a deferred target is mounted', async () => {
    const { result } = renderHook(() => useSectionNavigation())

    await act(() => result.current('kontakt'))

    const section = document.createElement('section')
    section.id = 'kontakt'
    const scrollIntoView = vi.fn()
    Object.defineProperty(section, 'scrollIntoView', {
      value: scrollIntoView,
    })
    document.body.appendChild(section)

    await vi.waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      })
    })
  })
})
