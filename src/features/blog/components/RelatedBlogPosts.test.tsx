import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RelatedBlogPosts } from './RelatedBlogPosts'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    params,
  }: {
    children: React.ReactNode
    to: string
    params?: { slug: string }
  }) => <a href={`/blog/${params?.slug}`}>{children}</a>,
}))

describe('RelatedBlogPosts', () => {
  it('renders nothing without posts and lists related titles when present', () => {
    const { container, rerender } = render(<RelatedBlogPosts posts={[]} />)
    expect(container).toBeEmptyDOMElement()

    rerender(
      <RelatedBlogPosts
        posts={[
          {
            slug: 'alpha',
            title: 'Alpha',
            excerpt: 'Opis',
            publishedAt: '2026-02-01',
            status: 'published',
            isPublic: true,
            category: { slug: 'c', label: 'C' },
            tags: [],
          },
        ]}
      />,
    )
    expect(
      screen.getByRole('heading', { name: 'Powiązane artykuły' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Alpha' })).toHaveAttribute(
      'href',
      '/blog/alpha',
    )
  })
})
