import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { useUIMock } = vi.hoisted(() => ({
  useUIMock: vi.fn(() => ({ isMenuOpen: false })),
}))

vi.mock('@context/UIContext', () => ({ useUI: useUIMock }))
vi.mock('@libs/analytics', () => ({ trackPlausibleEvent: vi.fn() }))
vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
    select({ location: { pathname: '/galeria', hash: '' } }),
  Link: ({
    to,
    hash,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    to: string
    hash?: string
    children: ReactNode
  }) => (
    <a href={`${to}${hash ? `#${hash}` : ''}`} {...props}>
      {children}
    </a>
  ),
}))

import BottomNav from './BottomNav'

describe('BottomNav', () => {
  afterEach(() => {
    cleanup()
    useUIMock.mockReturnValue({ isMenuOpen: false })
  })
  it('renders four route links and marks the current route', () => {
    render(<BottomNav />)
    expect(screen.getAllByRole('link')).toHaveLength(4)
    expect(screen.getByRole('link', { name: /Galeria/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: /Kontakt/ })).toHaveAttribute(
      'href',
      '/#kontakt',
    )
  })

  it('stays hidden while the full-screen menu is open', () => {
    useUIMock.mockReturnValue({ isMenuOpen: true })
    render(<BottomNav />)
    expect(
      screen.queryByRole('navigation', { name: 'Nawigacja mobilna' }),
    ).not.toBeInTheDocument()
  })
})
