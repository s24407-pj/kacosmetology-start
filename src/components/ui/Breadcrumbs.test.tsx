import '@testing-library/jest-dom/vitest'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

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

import { Breadcrumbs } from './Breadcrumbs'

describe('Breadcrumbs', () => {
  it('links ancestors, separates items and marks the current page', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Strona główna', to: '/' },
          { label: 'Kosmetologia', to: '/kosmetologia' },
          { label: 'Oczyszczanie wodorowe' },
        ]}
      />,
    )

    const navigation = screen.getByRole('navigation', { name: 'Okruszki' })
    expect(
      within(navigation).getByRole('link', { name: 'Strona główna' }),
    ).toHaveAttribute('href', '/')
    expect(
      within(navigation).getByRole('link', { name: 'Kosmetologia' }),
    ).toHaveAttribute('href', '/kosmetologia')
    expect(within(navigation).getAllByText('/')).toHaveLength(2)
    expect(
      within(navigation).getByText('Oczyszczanie wodorowe'),
    ).toHaveAttribute('aria-current', 'page')
  })
})
