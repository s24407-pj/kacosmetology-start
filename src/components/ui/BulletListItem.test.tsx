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

    expect(screen.getByRole('listitem')).toHaveTextContent('Feature A')
  })
})
