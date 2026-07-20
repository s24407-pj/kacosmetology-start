import type { BlogPostMetadata } from '@app-types/blog'
import { Link } from '@tanstack/react-router'

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00.000Z`))

export function BlogPostMeta({ post }: { post: BlogPostMetadata }) {
  return (
    <div className="space-y-3 text-sm text-text-secondary">
      <p>
        <span className="text-text-muted">Kategoria: </span>
        <Link
          to="/blog"
          search={{ category: post.category.slug }}
          className="text-action underline-offset-2 hover:underline"
        >
          {post.category.label}
        </Link>
      </p>
      <p>
        <span className="text-text-muted">Opublikowano: </span>
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      </p>
      {post.updatedAt && post.updatedAt !== post.publishedAt ? (
        <p>
          <span className="text-text-muted">Zaktualizowano: </span>
          <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
        </p>
      ) : null}
      {post.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Tagi artykułu">
          {post.tags.map((tag) => (
            <li key={tag.slug}>
              <Link
                to="/blog"
                search={{ tag: tag.slug }}
                className="text-action underline-offset-2 hover:underline"
              >
                {tag.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
