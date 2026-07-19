import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BulletListItem } from './BulletListItem'

describe('BulletListItem', () => {
  it('renders a list item with its text content', () => {
    render(
      <ul>
        <BulletListItem>Feature A</BulletListItem>
      </ul>,
    )

    const item = screen.getByText('Feature A').closest('li')
    expect(item).toBeInTheDocument()
    expect(item?.querySelector('span')).toHaveTextContent('Feature A')
  })

  it('supports the selected bullet color', () => {
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
