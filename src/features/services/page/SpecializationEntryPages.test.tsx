import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { SpecializationPage } = vi.hoisted(() => ({
  SpecializationPage: vi.fn(() => null),
}))

vi.mock('@features/services/page/SpecializationPage', () => ({
  SpecializationPage,
}))

import CosmetologyPage from '@features/cosmetology/page/CosmetologyPage'
import EyeStylingPage from '@features/eye-styling/page/EyeStylingPage'
import TrichologyPage from '@features/trichology/page/TrichologyPage'

describe('specialization entry pages', () => {
  beforeEach(() => SpecializationPage.mockClear())

  it.each([
    [CosmetologyPage, 'cosmetology'],
    [EyeStylingPage, 'eye-styling'],
    [TrichologyPage, 'trichology'],
  ] as const)(
    'selects the expected specialization',
    (EntryPage, specializationId) => {
      render(<EntryPage />)

      expect(SpecializationPage).toHaveBeenCalledWith(
        { specializationId },
        undefined,
      )
    },
  )
})
