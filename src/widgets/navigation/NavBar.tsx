import type { MainNavItemId } from '@app-types/types'
import KaCosmetologyLogo from '@components/icons/KaCosmetologyLogo'
import KaLogo from '@components/icons/KaLogo'
import { useUI } from '@context/UIContext'
import { MAIN_NAV_ITEMS } from '@data/navigation'
import { useSectionNavigation } from '@hooks/useSectionNavigation'
import { trackPlausibleEvent } from '@libs/analytics'
import { cn, scrollToTop } from '@libs/utils'
import CTAButton from '@widgets/actions/CTAButton'
import PromotionBanner from '@widgets/actions/PromotionBanner'
import { Menu, X } from 'lucide-react'
import { type MouseEvent, useEffect, useLayoutEffect, useRef } from 'react'

const DESKTOP_NAV_CONTEXT = 'desktop'
const MOBILE_NAV_CONTEXT = 'mobile-menu'

export default function NavBar() {
  const { scrolled, activeSection, isMenuOpen, setIsMenuOpen } = useUI()
  const navigateToSection = useSectionNavigation()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const firstMobileItemRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (isMenuOpen) {
      firstMobileItemRef.current?.focus()
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (!isMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen, setIsMenuOpen])

  const handleLogoClick = () => {
    trackPlausibleEvent('Logo Click')
    scrollToTop()
  }

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: MainNavItemId,
  ) => {
    event.preventDefault()
    trackPlausibleEvent('Navigation Link Click', {
      target: sectionId,
      context: DESKTOP_NAV_CONTEXT,
    })
    void navigateToSection(sectionId)
  }

  const handleMobileNavClick = (sectionId: MainNavItemId) => {
    trackPlausibleEvent('Navigation Link Click', {
      target: sectionId,
      context: MOBILE_NAV_CONTEXT,
    })
    setIsMenuOpen(false)
    requestAnimationFrame(() => {
      void navigateToSection(sectionId)
    })
  }

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 w-full z-50 border-b border-border-default transition-colors duration-200 sm:text-xl',
          scrolled ? 'bg-surface shadow-subtle' : 'bg-surface/95',
        )}
        aria-label="Główna nawigacja"
      >
        <PromotionBanner />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="min-[810px]:hidden w-11 h-11 flex items-center justify-center text-text-primary rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40"
              aria-label={isMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <button
              type="button"
              onClick={handleLogoClick}
              className={cn(
                'absolute left-1/2 -translate-x-1/2 flex items-center rounded-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white min-[810px]:relative min-[810px]:left-auto min-[810px]:translate-x-0',
              )}
              aria-label="Wróć na początek strony"
            >
              <KaCosmetologyLogo
                className={cn(
                  'hidden min-[810px]:block text-action transition-all duration-300',
                  scrolled ? 'w-28' : 'w-36',
                )}
              />
              <KaLogo className="block min-[810px]:hidden w-10 text-action" />
            </button>

            <ul className="hidden min-[810px]:flex items-center space-x-6 min-[810px]:space-x-8 px-5 whitespace-nowrap">
              {MAIN_NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(event) => handleNavClick(event, item.id)}
                    className={cn(
                      'group relative inline-block rounded-sm pb-1 font-medium text-text-secondary transition-colors duration-200 hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                      activeSection === item.id && 'text-action',
                    )}
                    aria-current={
                      activeSection === item.id ? 'page' : undefined
                    }
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute -bottom-0.5 left-0 h-0.5 w-full origin-left bg-action transition-transform duration-200',
                        activeSection === item.id
                          ? 'scale-x-100'
                          : 'scale-x-0 group-hover:scale-x-100',
                      )}
                    />
                  </a>
                </li>
              ))}
            </ul>

            <div className="hidden min-[810px]:block">
              <CTAButton placement="navbar-desktop" />
            </div>

            <div className="min-[810px]:hidden text-sm">
              <CTAButton placement="navbar-mobile" />
            </div>
          </div>
        </div>
      </nav>
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-surface-muted min-[810px]:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu nawigacyjne"
        >
          <ul className="mobile-nav-list flex flex-col items-center gap-8 px-6">
            {MAIN_NAV_ITEMS.map((item, index) => (
              <li
                key={item.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <button
                  ref={index === 0 ? firstMobileItemRef : undefined}
                  type="button"
                  onClick={() => handleMobileNavClick(item.id)}
                  className={cn(
                    'mobile-nav-item-button rounded-md px-3 py-2 font-display text-2xl font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40',
                    activeSection === item.id
                      ? 'text-action'
                      : 'text-text-primary hover:text-action',
                  )}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
