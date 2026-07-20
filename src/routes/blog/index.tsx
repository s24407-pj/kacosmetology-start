import type { BlogSearchFilters } from '@app-types/blog'
import { filterPublicBlogPosts } from '@data/blogPosts'
import { BlogIndexPage } from '@features/blog/page/BlogIndexPage'
import { createRouteHead } from '@libs/routeMetadata'
import { createFileRoute } from '@tanstack/react-router'

const parseSearch = (search: Record<string, unknown>): BlogSearchFilters => {
  const filters: BlogSearchFilters = {}
  if (typeof search.category === 'string' && search.category.length > 0) {
    filters.category = search.category
  }
  if (typeof search.tag === 'string' && search.tag.length > 0) {
    filters.tag = search.tag
  }
  return filters
}

export const Route = createFileRoute('/blog/')({
  validateSearch: (search: Record<string, unknown>): BlogSearchFilters =>
    parseSearch(search),
  loaderDeps: ({ search }) => ({
    category: search.category,
    tag: search.tag,
  }),
  loader: ({ deps }) => {
    const filters = parseSearch(deps)
    return {
      filters,
      posts: filterPublicBlogPosts(filters),
    }
  },
  head: () =>
    createRouteHead({
      path: '/blog',
      title: 'Blog',
      description:
        'Artykuły o pielęgnacji skóry, zabiegach i świadomej rutynie kosmetologicznej w Ka.Cosmetology.',
    }),
  component: BlogIndexRoute,
})

function BlogIndexRoute() {
  const { posts, filters } = Route.useLoaderData()
  return <BlogIndexPage posts={posts} filters={filters} />
}
