import type { BlogSearchFilters, PublishedBlogPost } from '@app-types/blog'
import { Breadcrumbs, PageHero, Section, SectionHeader } from '@components/ui'
import { BlogCard } from '@features/blog/components/BlogCard'
import { BlogEmptyState } from '@features/blog/components/BlogEmptyState'
import { BlogFilters } from '@features/blog/components/BlogFilters'

export function BlogIndexPage({
  posts,
  filters,
}: {
  posts: readonly PublishedBlogPost[]
  filters: BlogSearchFilters
}) {
  const hasTaxonomy =
    posts.length > 0 || Boolean(filters.category || filters.tag)

  return (
    <>
      <PageHero
        breadcrumbs={
          <Breadcrumbs
            items={[{ label: 'Strona główna', to: '/' }, { label: 'Blog' }]}
          />
        }
        eyebrow="Blog"
        title="Blog"
        description="Artykuły o pielęgnacji skóry, zabiegach i świadomej rutynie kosmetologicznej."
      />
      <Section>
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[16rem_minmax(0,1fr)]">
          {hasTaxonomy ? <BlogFilters filters={filters} /> : <div />}
          <div>
            <SectionHeader
              eyebrow="Wpisy"
              title={
                filters.category || filters.tag
                  ? 'Wyniki filtrowania'
                  : 'Najnowsze artykuły'
              }
              subtitle={
                filters.category || filters.tag
                  ? 'Lista uwzględnia aktywne filtry kategorii i tagów.'
                  : 'Publikacje pojawią się tutaj po zatwierdzeniu treści.'
              }
              align="left"
            />
            {posts.length === 0 ? (
              <div className="mt-10">
                <BlogEmptyState />
              </div>
            ) : (
              <div className="mt-10">
                {posts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}
