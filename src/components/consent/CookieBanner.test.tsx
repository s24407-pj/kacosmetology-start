import '@testing-library/jest-dom/vitest'
import { ConsentProvider } from '@libs/consent'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CookieBanner } from './CookieBanner'

const updateConsent = vi.fn()

vi.mock('@libs/analytics', () => ({
  analytics: {
    updateConsent: (...args: unknown[]) => updateConsent(...args),
  },
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

describe('CookieBanner', () => {
  beforeEach(() => {
    localStorage.clear()
    updateConsent.mockReset()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('shows equal-weight accept before reject after hydration', async () => {
    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Zaakceptuj wszystkie' }),
      ).toBeInTheDocument()
    })

    const accept = screen.getByRole('button', { name: 'Zaakceptuj wszystkie' })
    const reject = screen.getByRole('button', { name: 'Odrzuć opcjonalne' })

    expect(accept.className).toEqual(reject.className)
    expect(accept.compareDocumentPosition(reject)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(
      screen.getByRole('link', { name: 'Polityce prywatności' }),
    ).toHaveAttribute('href', '/polityka-prywatnosci')

    const banner = screen.getByRole('region', {
      name: 'Zarządzanie zgodami na pliki cookies',
    })
    const cookieIcon = banner.querySelector('svg.lucide-cookie')
    expect(cookieIcon).toBeInTheDocument()
    expect(cookieIcon).toHaveAttribute('aria-hidden', 'true')
    expect(cookieIcon).toHaveClass('text-action')
  })

  it('keeps the first-layer banner non-blocking so content stays browsable', async () => {
    render(
      <ConsentProvider>
        <main>
          <a href="/oferta">Oferta zabiegów</a>
        </main>
        <CookieBanner />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('region', {
          name: 'Zarządzanie zgodami na pliki cookies',
        }),
      ).toBeInTheDocument()
    })

    const banner = screen.getByRole('region', {
      name: 'Zarządzanie zgodami na pliki cookies',
    })

    expect(document.body.style.overflow).not.toBe('hidden')
    expect(banner.classList.contains('bottom-0')).toBe(true)
    expect(banner.classList.contains('inset-0')).toBe(false)
    expect(
      screen.queryByRole('button', { name: 'Zamknij tło ustawień cookies' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Oferta zabiegów' })).toBeVisible()
  })

  it('opens preferences with optional categories unchecked and necessary locked on', async () => {
    const user = userEvent.setup()

    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Dostosuj' }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Dostosuj' }))
    expect(
      screen.getByRole('dialog', { name: 'Ustawienia cookies' }),
    ).toBeInTheDocument()

    const necessary = screen.getByRole('switch', { name: 'Niezbędne' })
    const analytics = screen.getByRole('switch', { name: 'Analityczne' })
    const marketing = screen.getByRole('switch', { name: 'Marketingowe' })

    expect(necessary).toBeChecked()
    expect(necessary).toBeDisabled()
    expect(analytics).not.toBeChecked()
    expect(marketing).not.toBeChecked()
    expect(analytics).toBeEnabled()
    expect(marketing).toBeEnabled()
  })

  it('opens preferences and saves custom choices', async () => {
    const user = userEvent.setup()

    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Dostosuj' }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Dostosuj' }))
    expect(
      screen.getByRole('dialog', { name: 'Ustawienia cookies' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('switch', { name: 'Analityczne' }))
    await user.click(screen.getByRole('button', { name: 'Zapisz wybrane' }))

    expect(updateConsent).toHaveBeenCalledWith({
      analytics: true,
      marketing: false,
    })
  })

  it('exposes equal-weight accept and reject shortcuts in preferences', async () => {
    const user = userEvent.setup()

    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Dostosuj' }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Dostosuj' }))

    const dialog = screen.getByRole('dialog', { name: 'Ustawienia cookies' })
    const accept = screen.getByRole('button', { name: 'Zaakceptuj wszystkie' })
    const reject = screen.getByRole('button', { name: 'Odrzuć opcjonalne' })

    expect(dialog).toContainElement(accept)
    expect(dialog).toContainElement(reject)
    expect(accept.className).toEqual(reject.className)

    await user.click(accept)

    expect(updateConsent).toHaveBeenCalledWith({
      analytics: true,
      marketing: true,
    })
  })
})
