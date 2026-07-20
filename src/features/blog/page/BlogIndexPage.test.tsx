import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { BlogIndexPage } from './BlogIndexPage'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    search,
    params,
  }: {
    children: React.ReactNode
    to: string
    search?: Record<string, string>
    params?: Record<string, string>
  }) => {
    const query = search ? `?${new URLSearchParams(search).toString()}` : ''
    const path =
      typeof to === 'string' && params?.slug
        ? to.replace('$slug', params.slug)
        : to
    return <a href={`${path}${query}`}>{children}</a>
  },
}))

const fixturePosts = [
  {
    slug: 'alpha',
    title: 'Alpha',
    excerpt: 'Opis alpha',
    publishedAt: '2026-02-01',
    status: 'published' as const,
    isPublic: true as const,
    category: { slug: 'pielegnacja-skory', label: 'Pielęgnacja skóry' },
    tags: [{ slug: 'bariera', label: 'Bariera' }],
  },
]

describe('BlogIndexPage', () => {
  it('renders fixture posts and empty state', () => {
    const { rerender } = render(
      <BlogIndexPage posts={fixturePosts} filters={{}} />,
    )
    expect(screen.getByRole('heading', { name: 'Alpha' })).toBeInTheDocument()

    rerender(<BlogIndexPage posts={[]} filters={{ category: 'brak' }} />)
    expect(
      screen.getByText('Brak artykułów do wyświetlenia'),
    ).toBeInTheDocument()
  })
})
