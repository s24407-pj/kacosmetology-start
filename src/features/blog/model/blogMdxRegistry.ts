import type { BlogMdxModule } from '@app-types/blog'
import type { ComponentType } from 'react'

const blogModules = import.meta.glob<{
  default: BlogMdxModule['default']
}>('/src/content/blog/*.mdx')

const slugFromPath = (path: string) => {
  const fileName = path.split('/').pop() ?? ''
  return fileName.replace(/\.mdx$/, '')
}

export const blogMdxLoaders = Object.fromEntries(
  Object.entries(blogModules).map(([path, loader]) => [
    slugFromPath(path),
    loader,
  ]),
) as Record<string, () => Promise<BlogMdxModule>>

const mdxPromiseCache = new Map<string, Promise<BlogMdxModule | null>>()

export const loadBlogMdx = async (slug: string) => {
  const loader = blogMdxLoaders[slug]
  if (!loader) return null
  return loader()
}

/** Stable promise identity for React `use()` during SSR/hydration. */
export const getBlogMdxPromise = (slug: string) => {
  const cached = mdxPromiseCache.get(slug)
  if (cached) return cached
  const promise = loadBlogMdx(slug)
  mdxPromiseCache.set(slug, promise)
  return promise
}

export type BlogMdxContent = ComponentType<{
  components?: Record<string, unknown>
}>
