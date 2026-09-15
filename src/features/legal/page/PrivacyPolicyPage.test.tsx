import '@testing-library/jest-dom/vitest'
import { brand, legalEntity, primarySalonLocation } from '@data/business'
import { PRIVACY_POLICY_EFFECTIVE_DATE } from '@features/legal/content/privacyPolicyContent'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

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

import PrivacyPolicyPage from './PrivacyPolicyPage'

describe('PrivacyPolicyPage', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the full privacy policy content', () => {
    render(<PrivacyPolicyPage />)

    expect(
      screen.getByRole('heading', { name: 'Polityka prywatności' }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/jest w przygotowaniu/i)).not.toBeInTheDocument()
    expect(
      screen.getAllByText(new RegExp(PRIVACY_POLICY_EFFECTIVE_DATE)).length,
    ).toBeGreaterThan(0)

    expect(
      screen.getByText(new RegExp(legalEntity.legalName.replace(/\./g, '\\.'))),
    ).toBeInTheDocument()
    expect(
      screen.getByText(new RegExp(`NIP ${legalEntity.nip}`)),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Cookies i podobne technologie' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Twoje prawa' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'Zautomatyzowane podejmowanie decyzji',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Data Privacy Framework/i)).toBeInTheDocument()
    expect(
      screen.queryByText(
        /oraz, w zakresie wymaganych zgód, art\. 6 ust\. 1 lit\. a/i,
      ),
    ).not.toBeInTheDocument()
    expect(screen.getAllByText(/Booksy/i).length).toBeGreaterThan(0)

    expect(
      screen.getAllByRole('link', { name: brand.email }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('link', { name: brand.email })[0],
    ).toHaveAttribute('href', `mailto:${brand.email}`)
    expect(
      screen.getAllByRole('link', { name: primarySalonLocation.bookingUrl })[0],
    ).toHaveAttribute('href', primarySalonLocation.bookingUrl)
    expect(
      screen.getByRole('link', { name: 'Wróć na stronę główną' }),
    ).toHaveAttribute('href', '/')
  })
})
