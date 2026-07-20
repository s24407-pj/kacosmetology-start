import type {
  BlogPostMetadata,
  BlogSearchFilters,
  PublishedBlogPost,
} from '@app-types/blog'
import { blogContentGeneratedAt, blogPostRecords } from './blogPosts.generated'

export { blogContentGeneratedAt, blogPostRecords }

const byPublishedAtThenSlug = (
  left: BlogPostMetadata,
  right: BlogPostMetadata,
) => {
  if (left.publishedAt !== right.publishedAt) {
    return right.publishedAt.localeCompare(left.publishedAt)
  }
  return left.slug.localeCompare(right.slug)
}

export const getAllBlogPosts = (): readonly BlogPostMetadata[] =>
  blogPostRecords

export const getPublicBlogPosts = (): readonly PublishedBlogPost[] =>
  blogPostRecords
    .filter((post): post is PublishedBlogPost => post.isPublic)
    .slice()
    .sort(byPublishedAtThenSlug)

export const getBlogPostBySlug = (slug: string): BlogPostMetadata | undefined =>
  blogPostRecords.find((post) => post.slug === slug)

export const getPublicBlogPostBySlug = (
  slug: string,
): PublishedBlogPost | undefined =>
  getPublicBlogPosts().find((post) => post.slug === slug)

export const getBlogCategories = () => {
  const bySlug = new Map<string, { slug: string; label: string }>()
  for (const post of getPublicBlogPosts()) {
    bySlug.set(post.category.slug, post.category)
  }
  return [...bySlug.values()].sort((left, right) =>
    left.label.localeCompare(right.label, 'pl'),
  )
}

export const getBlogTags = () => {
  const bySlug = new Map<string, { slug: string; label: string }>()
  for (const post of getPublicBlogPosts()) {
    for (const tag of post.tags) bySlug.set(tag.slug, tag)
  }
  return [...bySlug.values()].sort((left, right) =>
    left.label.localeCompare(right.label, 'pl'),
  )
}

export const filterPublicBlogPosts = (
  filters: BlogSearchFilters = {},
): readonly PublishedBlogPost[] => {
  const { category, tag } = filters
  return getPublicBlogPosts().filter((post) => {
    if (category && post.category.slug !== category) return false
    if (tag && !post.tags.some((entry) => entry.slug === tag)) return false
    return true
  })
}

export const getRelatedBlogPosts = (
  post: BlogPostMetadata,
  limit = 3,
): readonly PublishedBlogPost[] => {
  const scored = getPublicBlogPosts()
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

export const getPublicBlogPaths = () => [
  '/blog',
  ...getPublicBlogPosts().map((post) => `/blog/${post.slug}`),
]
