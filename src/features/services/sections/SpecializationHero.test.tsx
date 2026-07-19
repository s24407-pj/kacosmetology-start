import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { SpecializationHero } from './SpecializationHero'

describe('SpecializationHero', () => {
  afterEach(cleanup)

  it('renders inverse copy and a full-bleed eager image', () => {
    render(
      <SpecializationHero
        specializationId="cosmetology"
        eyebrow="Świadoma opieka nad skórą"
        title="Kosmetologia"
        description="Każda terapia rozpoczyna się od poznania potrzeb skóry."
        image={{
          src: '/images/specializations/cosmetology.webp',
          alt: 'Zabieg pielęgnacyjny twarzy z aplikacją maski w gabinecie',
        }}
        actions={
          <a href="https://kacosmetology.booksy.com">Umów konsultację</a>
        }
      />,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Kosmetologia' }),
    ).toBeVisible()
    expect(screen.getByText('Świadoma opieka nad skórą')).toBeVisible()
    expect(
      screen.getByText(
        'Każda terapia rozpoczyna się od poznania potrzeb skóry.',
      ),
    ).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'Umów konsultację' }),
    ).toHaveAttribute('href', 'https://kacosmetology.booksy.com')

    const image = screen.getByRole('img', {
      name: 'Zabieg pielęgnacyjny twarzy z aplikacją maski w gabinecie',
    })
    expect(image).toHaveAttribute(
      'src',
      '/images/specializations/cosmetology-720.webp',
    )
    expect(image).toHaveAttribute('loading', 'eager')
    expect(image).toHaveAttribute('sizes', '100vw')
    expect(image.className).toContain('absolute')
    expect(image.className).toContain('object-cover')
    expect(image.className).not.toContain('rounded')
    expect(image.className).not.toContain('shadow')
  })
})
