import type {
  BlogCategory,
  BlogCoverImage,
  BlogPostMetadata,
  BlogPostSeo,
  BlogPostStatus,
  BlogTag,
} from '@app-types/blog'
import { compile } from '@mdx-js/mdx'
import matter from 'gray-matter'
import remarkFrontmatter from 'remark-frontmatter'
import { blogMdxPolicy } from './blogMdxPolicy'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type BlogSourceFile = {
  fileName: string
  source: string
}

export type BlogManifestPayload = {
  contentGeneratedAt: string
  posts: BlogPostMetadata[]
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const requireString = (
  value: unknown,
  field: string,
  errors: string[],
): string | undefined => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`Missing or empty "${field}"`)
    return undefined
  }
  return value.trim()
}

const parseIsoDate = (value: string, field: string, errors: string[]) => {
  if (!ISO_DATE.test(value)) {
    errors.push(`Invalid ISO date for "${field}": ${value}`)
    return undefined
  }
  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) {
    errors.push(`Invalid calendar date for "${field}": ${value}`)
    return undefined
  }
  return value
}

const parseTaxonomy = (
  value: unknown,
  field: string,
  errors: string[],
): BlogCategory | undefined => {
  if (!isPlainObject(value)) {
    errors.push(`"${field}" must be an object with slug and label`)
    return undefined
  }
  const slug = requireString(value.slug, `${field}.slug`, errors)
  const label = requireString(value.label, `${field}.label`, errors)
  if (!slug || !label) return undefined
  if (!SLUG.test(slug)) {
    errors.push(`Invalid "${field}.slug": ${slug}`)
    return undefined
  }
  return { slug, label }
}

const parseTags = (value: unknown, errors: string[]): BlogTag[] => {
  if (value === undefined) {
    errors.push('Missing "tags" (use an empty list when none apply)')
    return []
  }
  if (!Array.isArray(value)) {
    errors.push('"tags" must be an array')
    return []
  }
  const tags: BlogTag[] = []
  const seen = new Set<string>()
  for (const [index, entry] of value.entries()) {
    const tag = parseTaxonomy(entry, `tags[${index}]`, errors)
    if (!tag) continue
    if (seen.has(tag.slug)) {
      errors.push(`Duplicate tag slug "${tag.slug}"`)
      continue
    }
    seen.add(tag.slug)
    tags.push(tag)
  }
  return tags
}

const parseCoverImage = (
  value: unknown,
  slug: string,
  errors: string[],
): BlogCoverImage | undefined => {
  if (value === undefined) return undefined
  if (!isPlainObject(value)) {
    errors.push('"coverImage" must be an object with src and alt')
    return undefined
  }
  const src = requireString(value.src, 'coverImage.src', errors)
  const alt = requireString(value.alt, 'coverImage.alt', errors)
  if (!src || !alt) return undefined
  if (/^https?:\/\//i.test(src) || src.includes('://')) {
    errors.push(`Remote coverImage.src is not allowed: ${src}`)
    return undefined
  }
  if (src.includes('..') || src.includes('\\')) {
    errors.push(`Unsafe coverImage.src path: ${src}`)
    return undefined
  }
  const expectedPrefix = `/images/blog/${slug}/`
  if (!src.startsWith(expectedPrefix)) {
    errors.push(
      `coverImage.src must start with "${expectedPrefix}" (received ${src})`,
    )
    return undefined
  }
  return { src, alt }
}

const parseSeo = (
  value: unknown,
  errors: string[],
): BlogPostSeo | undefined => {
  if (value === undefined) return undefined
  if (!isPlainObject(value)) {
    errors.push('"seo" must be an object')
    return undefined
  }
  const seo: BlogPostSeo = {}
  if (value.title !== undefined) {
    const title = requireString(value.title, 'seo.title', errors)
    if (title) seo.title = title
  }
  if (value.description !== undefined) {
    const description = requireString(
      value.description,
      'seo.description',
      errors,
    )
    if (description) seo.description = description
  }
  return seo
}

const parseStatus = (
  value: unknown,
  errors: string[],
): BlogPostStatus | undefined => {
  if (value !== 'draft' && value !== 'published') {
    errors.push('Invalid "status" (expected "draft" or "published")')
    return undefined
  }
  return value
}

const toUtcDay = (isoDate: string) => isoDate

export const isPublicAtGeneration = ({
  status,
  publishedAt,
  contentGeneratedAt,
}: {
  status: BlogPostStatus
  publishedAt: string
  contentGeneratedAt: string
}) => {
  if (status !== 'published') return false
  const generatedDay = contentGeneratedAt.slice(0, 10)
  return toUtcDay(publishedAt) <= generatedDay
}

export async function validateBlogMdxBody(source: string, fileName: string) {
  try {
    await compile(source, {
      remarkPlugins: [remarkFrontmatter, blogMdxPolicy],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${fileName}: ${message}`)
  }
}

export async function parseBlogSourceFile(
  file: BlogSourceFile,
  contentGeneratedAt: string,
): Promise<{ post?: BlogPostMetadata; errors: string[] }> {
  const errors: string[] = []
  if (!file.fileName.endsWith('.mdx')) {
    return { errors: [`${file.fileName}: expected .mdx extension`] }
  }
  const slug = file.fileName.replace(/\.mdx$/, '')
  if (!SLUG.test(slug)) {
    return { errors: [`${file.fileName}: invalid slug derived from filename`] }
  }

  let data: Record<string, unknown>
  try {
    const parsed = matter(file.source)
    if (!isPlainObject(parsed.data)) {
      return { errors: [`${file.fileName}: frontmatter must be a YAML object`] }
    }
    data = parsed.data
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      errors: [`${file.fileName}: failed to parse frontmatter (${message})`],
    }
  }

  if ('slug' in data) {
    errors.push(
      `${file.fileName}: do not set "slug" in frontmatter (filename is canonical)`,
    )
  }

  const title = requireString(data.title, 'title', errors)
  const excerpt = requireString(data.excerpt, 'excerpt', errors)
  const publishedAtRaw = requireString(data.publishedAt, 'publishedAt', errors)
  const publishedAt = publishedAtRaw
    ? parseIsoDate(publishedAtRaw, 'publishedAt', errors)
    : undefined
  const status = parseStatus(data.status, errors)
  const category = parseTaxonomy(data.category, 'category', errors)
  const tags = parseTags(data.tags, errors)

  let updatedAt: string | undefined
  if (data.updatedAt !== undefined) {
    const updatedAtRaw = requireString(data.updatedAt, 'updatedAt', errors)
    updatedAt = updatedAtRaw
      ? parseIsoDate(updatedAtRaw, 'updatedAt', errors)
      : undefined
  }

  if (publishedAt && updatedAt && updatedAt < publishedAt) {
    errors.push(
      `"updatedAt" (${updatedAt}) must be greater than or equal to "publishedAt" (${publishedAt})`,
    )
  }

  const coverImage = parseCoverImage(data.coverImage, slug, errors)
  const seo = parseSeo(data.seo, errors)

  try {
    await validateBlogMdxBody(file.source, file.fileName)
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
  }

  if (
    errors.length > 0 ||
    !title ||
    !excerpt ||
    !publishedAt ||
    !status ||
    !category
  ) {
    return {
      errors: errors.map((error) =>
        error.startsWith(file.fileName) ? error : `${file.fileName}: ${error}`,
      ),
    }
  }

  const post: BlogPostMetadata = {
    slug,
    title,
    excerpt,
    publishedAt,
    ...(updatedAt ? { updatedAt } : {}),
    status,
    isPublic: isPublicAtGeneration({
      status,
      publishedAt,
      contentGeneratedAt,
    }),
    category,
    tags,
    ...(coverImage ? { coverImage } : {}),
    ...(seo ? { seo } : {}),
  }

  return { post, errors: [] }
}

export function validateBlogPostCollection(posts: BlogPostMetadata[]) {
  const errors: string[] = []
  const slugCounts = new Map<string, number>()
  const categoryLabels = new Map<string, string>()
  const tagLabels = new Map<string, string>()

  for (const post of posts) {
    slugCounts.set(post.slug, (slugCounts.get(post.slug) ?? 0) + 1)

    const existingCategory = categoryLabels.get(post.category.slug)
    if (existingCategory && existingCategory !== post.category.label) {
      errors.push(
        `Conflicting category label for slug "${post.category.slug}": "${existingCategory}" vs "${post.category.label}"`,
      )
    } else {
      categoryLabels.set(post.category.slug, post.category.label)
    }

    for (const tag of post.tags) {
      const existingTag = tagLabels.get(tag.slug)
      if (existingTag && existingTag !== tag.label) {
        errors.push(
          `Conflicting tag label for slug "${tag.slug}": "${existingTag}" vs "${tag.label}"`,
        )
      } else {
        tagLabels.set(tag.slug, tag.label)
      }
    }
  }

  for (const [slug, count] of slugCounts) {
    if (count > 1) errors.push(`Duplicate article slug "${slug}"`)
  }

  return errors
}

export function sortBlogPostsDeterministically(
  posts: readonly BlogPostMetadata[],
): BlogPostMetadata[] {
  return [...posts].sort((left, right) => {
    if (left.publishedAt !== right.publishedAt) {
      return right.publishedAt.localeCompare(left.publishedAt)
    }
    return left.slug.localeCompare(right.slug)
  })
}

const escapeSingleQuoted = (value: string) =>
  value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")

const renderString = (value: string) => `'${escapeSingleQuoted(value)}'`

const renderValue = (value: unknown, indent: number): string => {
  const pad = '  '.repeat(indent)
  const next = '  '.repeat(indent + 1)
  if (typeof value === 'string') return renderString(value)
  if (typeof value === 'boolean' || typeof value === 'number')
    return String(value)
  if (value === null || value === undefined) return 'undefined'
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value
      .map((entry) => `${next}${renderValue(entry, indent + 1)},`)
      .join('\n')
    return `[\n${items}\n${pad}]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, entry]) => entry !== undefined,
    )
    if (entries.length === 0) return '{}'
    const fields = entries
      .map(
        ([key, entry]) => `${next}${key}: ${renderValue(entry, indent + 1)},`,
      )
      .join('\n')
    return `{\n${fields}\n${pad}}`
  }
  throw new Error(`Unsupported manifest value: ${typeof value}`)
}

export function renderBlogPostsGeneratedModule(
  payload: BlogManifestPayload,
): string {
  return `/* AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
 * Source: src/content/blog/*.mdx
 * Regenerate: pnpm generate-blog-content
 */
import type { BlogPostMetadata } from '@app-types/blog'

export const blogContentGeneratedAt = ${renderString(payload.contentGeneratedAt)} as const

export const blogPostRecords = ${renderValue(payload.posts, 0)} as readonly BlogPostMetadata[]
`
}

export async function buildBlogManifest({
  files,
  contentGeneratedAt = new Date().toISOString(),
}: {
  files: readonly BlogSourceFile[]
  contentGeneratedAt?: string
}): Promise<{ payload: BlogManifestPayload; errors: string[] }> {
  const posts: BlogPostMetadata[] = []
  const errors: string[] = []

  for (const file of files) {
    const result = await parseBlogSourceFile(file, contentGeneratedAt)
    errors.push(...result.errors)
    if (result.post) posts.push(result.post)
  }

  errors.push(...validateBlogPostCollection(posts))

  return {
    payload: {
      contentGeneratedAt,
      posts: sortBlogPostsDeterministically(posts),
    },
    errors,
  }
}
