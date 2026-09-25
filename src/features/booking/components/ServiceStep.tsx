import { services } from '@data/services'
import type { PublicOffering } from '@libs/scheduler/types'
import { cn } from '@libs/utils'
import { Clock, Search, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'

interface ServiceStepProps {
  offerings: PublicOffering[]
  selectedOffering: PublicOffering | null
  onSelectOffering: (offering: PublicOffering) => void
  isLoading?: boolean
}

type CategoryTab =
  | 'all'
  | 'kosmetologia'
  | 'trychologia'
  | 'oprawa-oka'
  | 'online'

const CATEGORY_TABS: { id: CategoryTab; label: string }[] = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'kosmetologia', label: 'Kosmetologia' },
  { id: 'trychologia', label: 'Trychologia' },
  { id: 'oprawa-oka', label: 'Oprawa oka' },
  { id: 'online', label: 'Online' },
]

export default function ServiceStep({
  offerings,
  selectedOffering,
  onSelectOffering,
  isLoading = false,
}: ServiceStepProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Map offering name to local service catalog description if available
  const descriptionsByName = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of services) {
      map.set(s.name.toLowerCase().trim(), s.description)
    }
    return map
  }, [])

  // Helper to determine category from offering name or categoryId
  const getOfferingCategory = (offering: PublicOffering): CategoryTab => {
    const nameLower = offering.name.toLowerCase()
    if (offering.categoryId === 4 || nameLower.includes('online')) {
      return 'online'
    }
    if (
      offering.categoryId === 1 ||
      nameLower.includes('brwi') ||
      nameLower.includes('rzęs')
    ) {
      return 'oprawa-oka'
    }
    if (
      offering.categoryId === 2 ||
      nameLower.includes('trychol') ||
      nameLower.includes('głowy') ||
      nameLower.includes('włosa')
    ) {
      return 'trychologia'
    }
    return 'kosmetologia'
  }

  const filteredOfferings = useMemo(() => {
    return offerings.filter((offering) => {
      if (!offering.active) return false

      if (activeCategory !== 'all') {
        const cat = getOfferingCategory(offering)
        if (cat !== activeCategory) return false
      }

      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim()
        const matchesName = offering.name.toLowerCase().includes(query)
        const desc =
          descriptionsByName.get(offering.name.toLowerCase().trim()) || ''
        const matchesDesc = desc.toLowerCase().includes(query)
        if (!matchesName && !matchesDesc) return false
      }

      return true
    })
  }, [offerings, activeCategory, searchQuery, descriptionsByName])

  if (isLoading) {
    return (
      <div className="space-y-4 py-8" role="status" aria-live="polite">
        <div className="h-10 w-full max-w-md animate-pulse rounded-md bg-surface-muted" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-36 animate-pulse rounded-lg border border-border-default bg-surface-muted"
            />
          ))}
        </div>
        <span className="sr-only">Wczytywanie listy usług...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
          Wybierz zabieg
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Zaznacz usługę, na którą chcesz się umówić. Możesz filtrować według
          kategorii lub wyszukiwać po nazwie.
        </p>
      </div>

      {/* Search & Categories Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pills */}
        <div
          role="tablist"
          aria-label="Kategorie zabiegów"
          className="flex flex-wrap gap-1.5"
        >
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors',
                activeCategory === tab.id
                  ? 'bg-action text-white shadow-xs'
                  : 'bg-surface-muted text-text-secondary hover:bg-surface-strong hover:text-text-primary border border-border-default',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj zabiegu..."
            aria-label="Wyszukaj zabieg"
            className="w-full rounded-md border border-border-default bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-action focus:outline-none focus:ring-1 focus:ring-action"
          />
        </div>
      </div>

      {/* Offerings Grid */}
      {filteredOfferings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-default p-8 text-center">
          <Sparkles
            className="mx-auto h-8 w-8 text-text-muted"
            aria-hidden="true"
          />
          <p className="mt-2 text-sm font-medium text-text-primary">
            Nie znaleziono zabiegów spełniających kryteria
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Spróbuj zmienić kategorię lub wpisać inną frazę w wyszukiwarce.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredOfferings.map((offering) => {
            const isSelected = selectedOffering?.id === offering.id
            const description = descriptionsByName.get(
              offering.name.toLowerCase().trim(),
            )

            return (
              <button
                key={offering.id}
                type="button"
                onClick={() => onSelectOffering(offering)}
                aria-pressed={isSelected}
                className={cn(
                  'group relative flex flex-col justify-between rounded-lg border p-5 text-left transition-all duration-200 cursor-pointer',
                  isSelected
                    ? 'border-action bg-primary-100/30 ring-2 ring-action/20 shadow-sm'
                    : 'border-border-default bg-surface hover:border-action/40 hover:bg-surface-muted/50 hover:shadow-subtle',
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-base sm:text-lg font-semibold text-text-primary group-hover:text-action transition-colors">
                      {offering.name}
                    </h3>
                    <span className="shrink-0 text-base sm:text-lg font-bold text-action">
                      {offering.price}&nbsp;zł
                    </span>
                  </div>

                  {description ? (
                    <p className="mt-2 text-xs sm:text-sm text-text-secondary line-clamp-2">
                      {description}
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border-default/60 pt-3 text-xs text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{offering.durationMinutes}&nbsp;min</span>
                  </div>

                  <span
                    className={cn(
                      'font-semibold transition-colors',
                      isSelected
                        ? 'text-action'
                        : 'text-action opacity-0 group-hover:opacity-100',
                    )}
                  >
                    {isSelected ? 'Wybrano ✓' : 'Wybierz →'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
