import type { BlogSearchFilters } from '@app-types/blog'
import { getBlogCategories, getBlogTags } from '@data/blogPosts'
import { Link } from '@tanstack/react-router'

export function BlogFilters({ filters }: { filters: BlogSearchFilters }) {
  const categories = getBlogCategories()
  const tags = getBlogTags()
  const hasActiveFilters = Boolean(filters.category || filters.tag)

  return (
    <div className="space-y-6">
      <nav aria-label="Filtrowanie kategorii">
        <p className="text-sm font-medium text-text-primary">Kategorie</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {categories.map((category) => {
            const selected = filters.category === category.slug
            return (
              <li key={category.slug}>
                <Link
                  to="/blog"
                  search={{
                    ...(selected ? {} : { category: category.slug }),
                    ...(filters.tag ? { tag: filters.tag } : {}),
                  }}
                  aria-current={selected ? 'true' : undefined}
                  className={
                    selected
                      ? 'inline-flex min-h-10 items-center rounded-md bg-action px-3 text-sm text-white'
                      : 'inline-flex min-h-10 items-center rounded-md border border-border-default px-3 text-sm text-text-secondary hover:border-action hover:text-action'
                  }
                >
                  {category.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <nav aria-label="Filtrowanie tagów">
        <p className="text-sm font-medium text-text-primary">Tagi</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => {
            const selected = filters.tag === tag.slug
            return (
              <li key={tag.slug}>
                <Link
                  to="/blog"
                  search={{
                    ...(filters.category ? { category: filters.category } : {}),
                    ...(selected ? {} : { tag: tag.slug }),
                  }}
                  aria-current={selected ? 'true' : undefined}
                  className={
                    selected
                      ? 'inline-flex min-h-10 items-center rounded-md bg-action px-3 text-sm text-white'
                      : 'inline-flex min-h-10 items-center rounded-md border border-border-default px-3 text-sm text-text-secondary hover:border-action hover:text-action'
                  }
                >
                  {tag.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {hasActiveFilters ? (
        <p>
          <Link
            to="/blog"
            search={{}}
            className="text-sm text-action underline-offset-2 hover:underline"
          >
            Wyczyść filtry
          </Link>
        </p>
      ) : null}
    </div>
  )
}
