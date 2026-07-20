import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { BlogEmptyState } from './BlogEmptyState'
import { BlogPostMeta } from './BlogPostMeta'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    search,
  }: {
    children: React.ReactNode
    to: string
    search?: Record<string, string>
  }) => (
    <a
      href={`${to}${search ? `?${new URLSearchParams(search).toString()}` : ''}`}
    >
      {children}
    </a>
  ),
}))

describe('BlogEmptyState', () => {
  it('renders the Polish empty message', () => {
    render(<BlogEmptyState />)
    expect(
      screen.getByText('Brak artykułów do wyświetlenia'),
    ).toBeInTheDocument()
  })
})

describe('BlogPostMeta', () => {
  it('renders category, dates and tags', () => {
    render(
      <BlogPostMeta
        post={{
          slug: 'alpha',
          title: 'Alpha',
          excerpt: 'Opis',
          publishedAt: '2026-02-01',
          updatedAt: '2026-02-10',
          status: 'published',
          isPublic: true,
          category: { slug: 'pielegnacja-skory', label: 'Pielęgnacja skóry' },
          tags: [{ slug: 'bariera', label: 'Bariera' }],
        }}
      />,
    )
    expect(screen.getByText('Pielęgnacja skóry')).toBeInTheDocument()
    expect(screen.getByText('Bariera')).toBeInTheDocument()
    expect(document.querySelector('time[datetime="2026-02-01"]')).not.toBeNull()
    expect(document.querySelector('time[datetime="2026-02-10"]')).not.toBeNull()
  })
})
