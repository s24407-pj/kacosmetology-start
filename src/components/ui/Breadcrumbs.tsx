import { Link } from '@tanstack/react-router'

export interface BreadcrumbItem {
  label: string
  to?: '/' | '/kosmetologia' | '/oprawa-oka' | '/trychologia'
}

export function Breadcrumbs({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <nav aria-label="Okruszki" className="text-sm text-text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.to ? (
              <Link to={item.to} className="hover:text-action">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
