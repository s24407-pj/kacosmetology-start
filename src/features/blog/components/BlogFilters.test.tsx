import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BlogFilters } from './BlogFilters'

afterEach(() => {
  cleanup()
})

vi.mock('@data/blogPosts', () => ({
  getBlogCategories: () => [
    { slug: 'pielegnacja-skory', label: 'Pielęgnacja skóry' },
  ],
  getBlogTags: () => [{ slug: 'bariera', label: 'Bariera' }],
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    search,
    ...rest
  }: {
    children: React.ReactNode
    to: string
    search?: Record<string, string>
    'aria-current'?: 'true' | 'false' | 'page'
  }) => {
    const query =
      search && Object.keys(search).length > 0
        ? `?${new URLSearchParams(search).toString()}`
        : ''
    return (
      <a href={`${to}${query}`} aria-current={rest['aria-current']}>
        {children}
      </a>
    )
  },
}))

describe('BlogFilters', () => {
  it('marks selected category and tag and offers reset', () => {
    render(
      <BlogFilters
        filters={{ category: 'pielegnacja-skory', tag: 'bariera' }}
      />,
    )
    expect(
      screen.getByRole('link', { name: 'Pielęgnacja skóry' }),
    ).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: 'Bariera' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(
      screen.getByRole('link', { name: 'Wyczyść filtry' }),
    ).toHaveAttribute('href', '/blog')
  })
})
