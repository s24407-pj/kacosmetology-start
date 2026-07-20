import type { BlogPostMetadata, PublishedBlogPost } from '@app-types/blog'
import { describe, expect, it } from 'vitest'

const fixtures: BlogPostMetadata[] = [
  {
    slug: 'alpha',
    title: 'Alpha',
    excerpt: 'Opis alpha',
    publishedAt: '2026-02-01',
    status: 'published',
    isPublic: true,
    category: { slug: 'pielegnacja-skory', label: 'Pielęgnacja skóry' },
    tags: [
      { slug: 'bariera', label: 'Bariera' },
      { slug: 'nawilzenie', label: 'Nawilżenie' },
    ],
  },
  {
    slug: 'beta',
    title: 'Beta',
    excerpt: 'Opis beta',
    publishedAt: '2026-01-15',
    status: 'published',
    isPublic: true,
    category: { slug: 'trychologia', label: 'Trychologia' },
    tags: [{ slug: 'bariera', label: 'Bariera' }],
  },
  {
    slug: 'draft-gamma',
    title: 'Gamma',
    excerpt: 'Opis gamma',
    publishedAt: '2026-01-01',
    status: 'draft',
    isPublic: false,
    category: { slug: 'pielegnacja-skory', label: 'Pielęgnacja skóry' },
    tags: [],
  },
  {
    slug: 'scheduled-delta',
    title: 'Delta',
    excerpt: 'Opis delta',
    publishedAt: '2026-08-01',
    status: 'published',
    isPublic: false,
    category: { slug: 'pielegnacja-skory', label: 'Pielęgnacja skóry' },
    tags: [{ slug: 'bariera', label: 'Bariera' }],
  },
]

const byPublishedAtThenSlug = (
  left: BlogPostMetadata,
  right: BlogPostMetadata,
) => {
  if (left.publishedAt !== right.publishedAt) {
    return right.publishedAt.localeCompare(left.publishedAt)
  }
  return left.slug.localeCompare(right.slug)
}

const getPublic = () =>
  fixtures
    .filter((post): post is PublishedBlogPost => post.isPublic)
    .slice()
    .sort(byPublishedAtThenSlug)

const filterPublic = (filters: { category?: string; tag?: string }) =>
  getPublic().filter((post) => {
    if (filters.category && post.category.slug !== filters.category)
      return false
    if (filters.tag && !post.tags.some((tag) => tag.slug === filters.tag)) {
      return false
    }
    return true
  })

const getRelated = (post: BlogPostMetadata, limit = 3) => {
  const scored = getPublic()
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => {
      let score = 0
      if (candidate.category.slug === post.category.slug) score += 100
      for (const tag of post.tags) {
        if (candidate.tags.some((entry) => entry.slug === tag.slug)) score += 10
      }
      return { candidate, score }
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => {
      if (left.score !== right.score) return right.score - left.score
      return byPublishedAtThenSlug(left.candidate, right.candidate)
    })
  return scored.slice(0, limit).map(({ candidate }) => candidate)
}

describe('blog selectors (fixture-backed)', () => {
  it('returns only public posts in reverse chronological order', () => {
    expect(getPublic().map((post) => post.slug)).toEqual(['alpha', 'beta'])
  })

  it('filters by category, tag and both', () => {
    expect(
      filterPublic({ category: 'pielegnacja-skory' }).map((post) => post.slug),
    ).toEqual(['alpha'])
    expect(filterPublic({ tag: 'bariera' }).map((post) => post.slug)).toEqual([
      'alpha',
      'beta',
    ])
    expect(
      filterPublic({ category: 'trychologia', tag: 'bariera' }).map(
        (post) => post.slug,
      ),
    ).toEqual(['beta'])
  })

  it('ranks related posts by shared category then tags', () => {
    const related = getRelated(fixtures[0]!)
    expect(related.map((post) => post.slug)).toEqual(['beta'])
  })
})
