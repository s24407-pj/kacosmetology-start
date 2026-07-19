import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const setIsMenuOpen = vi.fn()
let isMenuOpen = false
let location = { pathname: '/', hash: '' }

vi.mock('@context/UIContext', () => ({
  useUI: () => ({ scrolled: false, isMenuOpen, setIsMenuOpen }),
}))
vi.mock('@widgets/actions/PromotionBanner', () => ({ default: () => null }))
vi.mock('@libs/analytics', () => ({ trackPlausibleEvent: vi.fn() }))
vi.mock('@libs/utils', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
  scrollToTop: vi.fn(),
}))
vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
    select({ location }),
  Link: ({
    to,
    hash,
    activeOptions: _activeOptions,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    to: string
    hash?: string
    activeOptions?: { includeHash?: boolean }
    children: ReactNode
  }) => (
    <a href={`${to}${hash ? `#${hash}` : ''}`} {...props}>
      {children}
    </a>
  ),
}))

import { scrollToTop } from '@libs/utils'
import NavBar from './NavBar'

describe('NavBar', () => {
  beforeEach(() => {
    isMenuOpen = false
    location = { pathname: '/', hash: '' }
    vi.clearAllMocks()
  })
  afterEach(cleanup)

  it('renders route-oriented desktop navigation', () => {
    render(<NavBar />)
    expect(
      screen.getAllByRole('link', { name: 'Kosmetologia' })[0],
    ).toHaveAttribute('href', '/kosmetologia')
    expect(
      screen.getAllByRole('link', { name: 'Trychologia' })[0],
    ).toHaveAttribute('href', '/trychologia')
    expect(
      screen.getAllByRole('link', { name: 'Oprawa oka' })[0],
    ).toHaveAttribute('href', '/oprawa-oka')
    expect(screen.getAllByRole('link', { name: 'Opinie' })[0]).toHaveAttribute(
      'href',
      '/#opinie',
    )
    expect(screen.getAllByRole('link', { name: 'Kontakt' })[0]).toHaveAttribute(
      'href',
      '/#kontakt',
    )
    expect(
      screen.getByRole('link', { name: /Umów wizytę w Booksy/ }),
    ).toHaveAttribute('href', 'https://kacosmetology.booksy.com')
  })

  it('animates a desktop link underline and keeps it visible for the active item', () => {
    location = { pathname: '/kosmetologia', hash: '' }
    render(<NavBar />)

    const link = screen.getAllByRole('link', { name: 'Kosmetologia' })[0]
    const underline = link.querySelector('span[aria-hidden="true"]')

    expect(link).toHaveAttribute('aria-current', 'page')
    expect(link).toHaveClass('group', 'relative')
    expect(underline).toHaveClass(
      'origin-left',
      'scale-x-0',
      'transition-transform',
      'duration-200',
      'group-hover:scale-x-100',
      'group-aria-[current=page]:scale-x-100',
      'motion-reduce:transition-none',
    )
  })

  it('scrolls to the top when the logo is clicked on the home page', async () => {
    const user = userEvent.setup()
    render(<NavBar />)

    await user.click(
      screen.getByRole('link', { name: 'Ka.Cosmetology — strona główna' }),
    )

    expect(scrollToTop).toHaveBeenCalledOnce()
  })

  it('opens the accessible mobile menu', async () => {
    const user = userEvent.setup()
    render(<NavBar />)
    const button = screen.getByRole('button', { name: 'Otwórz menu' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    await user.click(button)
    expect(setIsMenuOpen).toHaveBeenCalledWith(true)
  })

  it('closes an open menu with Escape and restores focus', async () => {
    isMenuOpen = true
    const user = userEvent.setup()
    render(<NavBar />)
    await user.keyboard('{Escape}')
    expect(setIsMenuOpen).toHaveBeenCalledWith(false)
    expect(screen.getByRole('button', { name: 'Zamknij menu' })).toHaveFocus()
  })
})
