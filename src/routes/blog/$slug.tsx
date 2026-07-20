import { getPublicBlogPostBySlug } from '@data/blogPosts'
import { brand } from '@data/business'
import { getBlogMdxPromise } from '@features/blog/model/blogMdxRegistry'
import { BlogPostPage } from '@features/blog/page/BlogPostPage'
import { createRouteHead } from '@libs/routeMetadata'
import { createFileRoute, notFound } from '@tanstack/react-router'

export const Route = createFileRoute('/blog/$slug')({
  codeSplitGroupings: [['loader'], ['component']],
  loader: async ({ params }) => {
    const post = getPublicBlogPostBySlug(params.slug)
    if (!post) throw notFound()
    const module = await getBlogMdxPromise(post.slug)
    if (!module) throw notFound()
    return { post }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const { post } = loaderData
    const title = post.seo?.title ?? post.title
    const description = post.seo?.description ?? post.excerpt
    return createRouteHead({
      path: `/blog/${post.slug}`,
      title,
      description,
      ogType: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      section: post.category.label,
      tags: post.tags.map((tag) => tag.label),
      image: post.coverImage
        ? {
            url: new URL(post.coverImage.src, brand.siteUrl).href,
            alt: post.coverImage.alt,
          }
        : undefined,
    })
  },
  component: BlogPostRoute,
})

function BlogPostRoute() {
  return <BlogPostPage post={Route.useLoaderData().post} />
}
