import type { BottomNavItemId } from '@app-types/types'
import { useUI } from '@context/UIContext'
import { BOTTOM_NAV_ITEMS } from '@data/navigation'
import { useSectionNavigation } from '@hooks/useSectionNavigation'
import { trackPlausibleEvent } from '@libs/analytics'
import { cn } from '@libs/utils'
import { Images, Phone, Sparkles, Star } from 'lucide-react'

const BOTTOM_NAV_CONTEXT = 'bottom-nav'

const BOTTOM_NAV_ICONS = {
  zabiegi: Sparkles,
  efekty: Images,
  opinie: Star,
  kontakt: Phone,
} as const

export default function BottomNav() {
  const { activeSection } = useUI()
  const navigateToSection = useSectionNavigation()

  const isActive = (id: BottomNavItemId) => activeSection === id

  const handleClick = (sectionId: BottomNavItemId) => {
    trackPlausibleEvent('Navigation Link Click', {
      target: sectionId,
      context: BOTTOM_NAV_CONTEXT,
    })
    void navigateToSection(sectionId)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 min-[810px]:hidden bg-surface border-t border-border-default h-14"
      aria-label="Nawigacja dolna"
    >
      <ul className="flex justify-around items-center h-full px-2">
        {BOTTOM_NAV_ITEMS.map(({ id, label }) => {
          const Icon = BOTTOM_NAV_ICONS[id]

          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => handleClick(id)}
                className={cn(
                  'flex min-w-14 flex-col items-center gap-0.5 rounded-md px-3 py-1.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40',
                  isActive(id)
                    ? 'text-action'
                    : 'text-text-muted hover:text-action',
                )}
                aria-current={isActive(id) ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-300',
                    isActive(id) && 'bg-surface-strong',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-medium leading-tight">
                  {label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
