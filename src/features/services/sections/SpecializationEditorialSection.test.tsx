import '@testing-library/jest-dom/vitest'
import { getServiceById } from '@data/services'
import { cleanup, render, screen, within } from '@testing-library/react'
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

import {
  resolveEditorialServices,
  SpecializationEditorialSection,
} from './SpecializationEditorialSection'

describe('SpecializationEditorialSection', () => {
  afterEach(cleanup)

  it.each([
    [
      'cosmetology',
      'Od potrzeby skóry do przemyślanego planu',
      ['Rozpoznajemy potrzeby', 'Dobieramy właściwy kierunek'],
    ],
    [
      'trichology',
      'Konsultacja, zanim wybierzesz zabieg',
      ['Szczegółowy wywiad', 'Badanie skóry głowy'],
    ],
  ] as const)(
    'renders the guided editorial path for %s',
    (specializationId, title, steps) => {
      render(
        <SpecializationEditorialSection specializationId={specializationId} />,
      )

      expect(
        screen.getByRole('heading', { level: 2, name: title }),
      ).toBeVisible()
      for (const step of steps) {
        expect(
          screen.getByRole('heading', { level: 3, name: step }),
        ).toBeVisible()
      }
      expect(
        screen.queryByRole('heading', { level: 1 }),
      ).not.toBeInTheDocument()
    },
  )

  it('links eye styling effects to published service detail pages', () => {
    render(<SpecializationEditorialSection specializationId="eye-styling" />)

    const section = screen
      .getByRole('heading', {
        level: 2,
        name: 'Zacznij od efektu, nie od nazwy zabiegu',
      })
      .closest('section')
    expect(section).not.toBeNull()

    const links = within(section as HTMLElement).getAllByRole('link')
    expect(links).toHaveLength(6)
    expect(
      within(section as HTMLElement).getByRole('link', {
        name: 'Regulacja brwi',
      }),
    ).toHaveAttribute('href', '/oprawa-oka/regulacja-brwi')
    expect(
      within(section as HTMLElement).getByRole('link', {
        name: 'Lifting rzęs + farbka',
      }),
    ).toHaveAttribute('href', '/oprawa-oka/lifting-rzes-farbka')
  })

  it('omits unavailable, unpublished and non-routable service suggestions', () => {
    const service = getServiceById('service-regulacja-brwi')
    expect(service).toBeDefined()
    if (!service) return

    expect(resolveEditorialServices([service.id], () => undefined)).toEqual([])
    expect(
      resolveEditorialServices([service.id], () => ({
        ...service,
        isPublished: false,
      })),
    ).toEqual([])
    expect(
      resolveEditorialServices(
        [service.id],
        () => service,
        () => undefined,
      ),
    ).toEqual([])
  })
})
