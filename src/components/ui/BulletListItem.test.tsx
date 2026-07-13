import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BulletListItem } from './BulletListItem'

describe('BulletListItem', () => {
  it('uses the primary bullet color by default', () => {
    render(
      <ul>
        <BulletListItem>Feature A</BulletListItem>
      </ul>,
    )

    const item = screen.getByText('Feature A').closest('li')
    expect(item).toHaveClass('flex', 'items-start')
    const bullet = item?.querySelector('div')
    expect(bullet).toHaveClass('bg-brand')
  })

  it('applies the selected bullet color', () => {
    render(
      <ul>
        <BulletListItem color="red">Feature B</BulletListItem>
      </ul>,
    )

    const bullet = screen
      .getByText('Feature B')
      .closest('li')
      ?.querySelector('div')
    expect(bullet).toHaveClass('bg-red-500')
  })
})
