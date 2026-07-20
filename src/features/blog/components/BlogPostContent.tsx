import { getBlogMdxPromise } from '@features/blog/model/blogMdxRegistry'
import { blogMdxComponents } from '@features/blog/model/mdxComponents'
import { Suspense, use } from 'react'

function BlogPostBody({ slug }: { slug: string }) {
  const module = use(getBlogMdxPromise(slug))
  if (!module) {
    return (
      <p className="text-red-700">Nie udało się wczytać treści artykułu.</p>
    )
  }
  const Content = module.default
  return <Content components={blogMdxComponents} />
}

export function BlogPostContent({ slug }: { slug: string }) {
  return (
    <Suspense
      fallback={<p className="text-text-muted">Ładowanie treści artykułu…</p>}
    >
      <div className="blog-post-content">
        <BlogPostBody slug={slug} />
      </div>
    </Suspense>
  )
}
