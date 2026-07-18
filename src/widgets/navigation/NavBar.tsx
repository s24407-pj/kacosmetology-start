import KaCosmetologyLogo from '@components/icons/KaCosmetologyLogo'
import KaLogo from '@components/icons/KaLogo'
import { iconActionStyles } from '@components/ui'
import { useUI } from '@context/UIContext'
import { MAIN_NAV_ITEMS } from '@data/navigation'
import { trackPlausibleEvent } from '@libs/analytics'
import { cn } from '@libs/utils'
import { Link, useRouterState } from '@tanstack/react-router'
import CTAButton from '@widgets/actions/CTAButton'
import PromotionBanner from '@widgets/actions/PromotionBanner'
import { Menu, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef } from 'react'

const desktopItems = MAIN_NAV_ITEMS.filter((item) =>
  ['kosmetologia', 'oprawa-oka', 'trychologia', 'o-mnie', 'galeria'].includes(
    item.id,
  ),
)

export default function NavBar() {
  const { scrolled, isMenuOpen, setIsMenuOpen } = useUI()
  const location = useRouterState({ select: (state) => state.location })
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (!isMenuOpen) return
    const focusable = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('a, button') ?? [],
    )
    focusable[0]?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        menuButtonRef.current?.focus()
        return
      }
      if (event.key !== 'Tab' || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen, setIsMenuOpen])

  const track = (target: string, context: string) =>
    trackPlausibleEvent('Navigation Link Click', { target, context })

  const isActive = (item: (typeof MAIN_NAV_ITEMS)[number]) => {
    if (item.hash) {
      return location.pathname === '/' && location.hash === item.hash
    }
    if (item.to === '/') return location.pathname === '/' && !location.hash
    return location.pathname.startsWith(item.to)
  }

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 z-50 w-full border-b border-border-default bg-surface/95 transition-shadow',
          scrolled && 'shadow-subtle',
        )}
        aria-label="Główna nawigacja"
      >
        <PromotionBanner />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center py-3 min-[1180px]:flex min-[1180px]:justify-between">
            <button
              ref={menuButtonRef}
              type="button"
              className={iconActionStyles({
                size: 'lg',
                className: 'justify-self-start min-[1180px]:hidden',
              })}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X aria-hidden="true" />
              ) : (
                <Menu aria-hidden="true" />
              )}
            </button>

            <Link
              to="/"
              aria-label="Ka.Cosmetology — strona główna"
              onClick={() => track('home', 'logo')}
              className="justify-self-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40"
            >
              <KaCosmetologyLogo className="hidden w-32 text-action min-[1180px]:block" />
              <KaLogo className="w-10 text-action min-[1180px]:hidden" />
            </Link>

            <ul className="hidden items-center gap-5 min-[1180px]:flex">
              {desktopItems.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    hash={item.hash}
                    aria-current={isActive(item) ? 'page' : undefined}
                    onClick={() => track(item.id, 'desktop')}
                    className="inline-flex min-h-11 items-center rounded-md px-2 font-medium text-text-secondary transition-colors hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 aria-[current=page]:text-action"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="justify-self-end">
              <CTAButton placement="navbar" />
            </div>
          </div>
        </div>
      </nav>

      {isMenuOpen ? (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-surface-muted px-6 pb-20 pt-44 min-[1180px]:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu nawigacyjne"
        >
          <ul className="flex w-full max-w-sm flex-col items-center gap-3 py-8">
            {MAIN_NAV_ITEMS.map((item, index) => (
              <li
                key={item.id}
                className="w-full animate-fade-up text-center"
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                <Link
                  to={item.to}
                  hash={item.hash}
                  aria-current={isActive(item) ? 'page' : undefined}
                  onClick={() => {
                    track(item.id, 'mobile-menu')
                    setIsMenuOpen(false)
                  }}
                  className="inline-flex min-h-12 items-center justify-center rounded-md px-4 font-display text-2xl font-medium text-text-primary transition-colors hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 aria-[current=page]:text-action"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  )
}
