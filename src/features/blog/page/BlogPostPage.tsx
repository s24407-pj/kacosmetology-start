import type { PublishedBlogPost } from '@app-types/blog'
import {
  actionLinkStyles,
  Breadcrumbs,
  PageHero,
  Section,
} from '@components/ui'
import { getRelatedBlogPosts } from '@data/blogPosts'
import { brand } from '@data/business'
import { BlogPostContent } from '@features/blog/components/BlogPostContent'
import { BlogPostMeta } from '@features/blog/components/BlogPostMeta'
import { RelatedBlogPosts } from '@features/blog/components/RelatedBlogPosts'
import {
  toBlogPostingJsonLd,
  toBreadcrumbListJsonLd,
} from '@libs/businessMetadata'
import { Link } from '@tanstack/react-router'

export function BlogPostPage({ post }: { post: PublishedBlogPost }) {
  const path = `/blog/${post.slug}`
  const related = getRelatedBlogPosts(post)
  const structuredData = [
    toBlogPostingJsonLd({ brand, post, path }),
    toBreadcrumbListJsonLd({
      brand,
      items: [
        { name: 'Strona główna', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: post.title, path },
      ],
    }),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from validated, repository-controlled blog metadata.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageHero
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Strona główna', to: '/' },
              { label: 'Blog', to: '/blog' },
              { label: post.title },
            ]}
          />
        }
        eyebrow={post.category.label}
        title={post.title}
        description={post.excerpt}
        meta={<BlogPostMeta post={post} />}
        actions={
          <Link
            to="/blog"
            className={actionLinkStyles({ variant: 'secondary' })}
          >
            Wróć do bloga
          </Link>
        }
      />
      <Section>
        <article className="mx-auto max-w-3xl">
          <BlogPostContent slug={post.slug} />
          <RelatedBlogPosts posts={related} />
        </article>
      </Section>
    </>
  )
}
