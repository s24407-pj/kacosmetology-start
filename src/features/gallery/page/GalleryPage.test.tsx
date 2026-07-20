import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { isValidElement, type ReactElement, type ReactNode } from 'react'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const galleryModules = vi.hoisted(() => {
  let resolve: () => void = () => undefined
  const ready = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise
  })
  return {
    ready,
    resolve,
    throwEffects: false,
  }
})

vi.mock('@features/home/sections/EffectsGallerySection', async () => {
  await galleryModules.ready
  return {
    default: () => {
      if (galleryModules.throwEffects) throw new Error('effects failed')
      return <p>Załadowane efekty</p>
    },
  }
})

vi.mock('@features/home/sections/GallerySection', async () => {
  await galleryModules.ready
  return { default: () => <p>Załadowany gabinet</p> }
})

import GalleryPage from './GalleryPage'

describe('GalleryPage', () => {
  const consoleError = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined)

  beforeAll(() => {
    consoleError.mockClear()
  })

  afterEach(() => {
    cleanup()
    galleryModules.throwEffects = false
  })

  afterAll(() => {
    consoleError.mockRestore()
  })

  it('composes the hero, loading fallback and stable lazy section boundaries', () => {
    const page = GalleryPage() as ReactElement<{ children: ReactNode[] }>
    const [hero, suspense] = page.props.children
    expect(isValidElement(hero)).toBe(true)
    render(hero)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Galeria' }),
    ).toBeVisible()

    expect(isValidElement(suspense)).toBe(true)
    if (
      !isValidElement<{ fallback: ReactNode; children: ReactNode[] }>(suspense)
    ) {
      throw new Error('Missing gallery suspense boundary')
    }
    expect(suspense.props.fallback).toMatchObject({
      props: {
        role: 'status',
        'aria-live': 'polite',
      },
    })
    const boundaries = suspense.props.children.filter(isValidElement)
    expect(boundaries.map((boundary) => boundary.props)).toMatchObject([
      {
        sectionId: 'efekty',
        sectionLabel: 'Efekty zabiegów',
        background: 'gray',
      },
      {
        sectionId: 'gabinet',
        sectionLabel: 'Gabinet',
        background: 'white',
      },
    ])
  })

  it('contains a failure locally without removing the other gallery section', async () => {
    galleryModules.throwEffects = true
    await act(async () => galleryModules.resolve())
    render(<GalleryPage />)

    expect(
      await screen.findByText(
        'Nie udało się wczytać sekcji „Efekty zabiegów”.',
      ),
    ).toBeVisible()
    expect(screen.getByText('Załadowany gabinet')).toBeVisible()
    expect(document.querySelector('section#efekty')).not.toBeNull()
  })
})
