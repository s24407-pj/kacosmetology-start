import type { ComponentType, ReactNode } from 'react'

export type BlogPostStatus = 'draft' | 'published'

export type BlogCategory = {
  slug: string
  label: string
}

export type BlogTag = {
  slug: string
  label: string
}

export type BlogCoverImage = {
  src: string
  alt: string
}

export type BlogPostSeo = {
  title?: string
  description?: string
}

/**
 * Serializable article metadata from the generated manifest.
 * `isPublic` is computed at generation time (not against the live clock).
 */
export type BlogPostMetadata = {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  updatedAt?: string
  status: BlogPostStatus
  isPublic: boolean
  category: BlogCategory
  tags: readonly BlogTag[]
  coverImage?: BlogCoverImage
  seo?: BlogPostSeo
}

export type PublishedBlogPost = BlogPostMetadata & {
  status: 'published'
  isPublic: true
}

export type BlogSearchFilters = {
  category?: string
  tag?: string
}

export type BlogMdxComponents = Record<
  string,
  ComponentType<{ children?: ReactNode; [key: string]: unknown }>
>

export type BlogMdxModule = {
  default: ComponentType<{ components?: BlogMdxComponents }>
}
