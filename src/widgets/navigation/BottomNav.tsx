import HairsBulbSVG from '@components/icons/HairsBulbSVG'
import { useUI } from '@context/UIContext'
import { BOTTOM_NAV_ITEMS } from '@data/navigation'
import { trackPlausibleEvent } from '@libs/analytics'
import { Link, useRouterState } from '@tanstack/react-router'
import { Images, Phone, Sparkles } from 'lucide-react'

const icons = {
  kosmetologia: Sparkles,
  trychologia: HairsBulbSVG,
  galeria: Images,
  kontakt: Phone,
}

export default function BottomNav() {
  const { isMenuOpen } = useUI()
  const location = useRouterState({ select: (state) => state.location })
  if (isMenuOpen) return null

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-default bg-surface/98 pb-[env(safe-area-inset-bottom)] backdrop-blur min-[810px]:hidden"
      aria-label="Nawigacja mobilna"
    >
      <ul className="grid grid-cols-4">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = icons[item.id]
          const active = item.hash
            ? location.pathname === '/' && location.hash === item.hash
            : location.pathname.startsWith(item.to) && item.to !== '/'
          return (
            <li key={item.id}>
              <Link
                to={item.to}
                hash={item.hash}
                aria-current={active ? 'page' : undefined}
                className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] text-text-secondary transition-[transform,background-color,color] duration-200 hover:-translate-y-0.5 hover:bg-surface-muted hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action/50 motion-reduce:transform-none motion-reduce:transition-none aria-[current=page]:text-action"
                onClick={() =>
                  trackPlausibleEvent('Navigation Link Click', {
                    target: item.id,
                    context: 'bottom-nav',
                  })
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
