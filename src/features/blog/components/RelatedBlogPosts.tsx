import type { PublishedBlogPost } from '@app-types/blog'
import { Link } from '@tanstack/react-router'

export function RelatedBlogPosts({
  posts,
}: {
  posts: readonly PublishedBlogPost[]
}) {
  if (posts.length === 0) return null

  return (
    <section
      className="mt-16 border-t border-border-default pt-10"
      aria-labelledby="related-posts-heading"
    >
      <h2
        id="related-posts-heading"
        className="font-display text-2xl text-text-primary md:text-3xl"
      >
        Powiązane artykuły
      </h2>
      <ul className="mt-6 space-y-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="text-lg text-action underline-offset-2 hover:underline"
            >
              {post.title}
            </Link>
            <p className="mt-1 text-sm text-text-secondary">{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
