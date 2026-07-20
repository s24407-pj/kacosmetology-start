import type { PublishedBlogPost } from '@app-types/blog'
import { Heading, Text } from '@components/ui'
import { Link } from '@tanstack/react-router'

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00.000Z`))

export function BlogCard({ post }: { post: PublishedBlogPost }) {
  return (
    <article className="border-t border-border-default py-8 first:border-t-0 first:pt-0">
      <p className="text-sm text-text-muted">
        <span>{post.category.label}</span>
        <span aria-hidden="true"> · </span>
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      </p>
      <Heading level={2} variant="content" className="mt-2">
        <Link
          to="/blog/$slug"
          params={{ slug: post.slug }}
          className="text-text-primary transition-colors hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40"
        >
          {post.title}
        </Link>
      </Heading>
      <Text className="mt-3 text-text-secondary">{post.excerpt}</Text>
      {post.tags.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tagi artykułu">
          {post.tags.map((tag) => (
            <li key={tag.slug}>
              <Link
                to="/blog"
                search={{ tag: tag.slug }}
                className="text-sm text-action underline-offset-2 hover:underline"
              >
                {tag.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
