import { actionLinkStyles, Heading, Text } from '@components/ui'
import { type ConsentCategorySettings, useConsent } from '@libs/consent'
import { cn } from '@libs/utils'
import { Link } from '@tanstack/react-router'
import { Cookie } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef } from 'react'

function ConsentToggle({
  id,
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-default py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="font-semibold text-text-primary">
          {label}
        </label>
        <Text variant="small" className="mt-1">
          {description}
        </Text>
      </div>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        onChange={(event) => onChange?.(event.target.checked)}
        className="mt-1 h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full bg-border-default transition-colors checked:bg-action disabled:cursor-not-allowed disabled:opacity-60 before:block before:h-4 before:w-4 before:translate-x-0.5 before:translate-y-0.5 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4"
      />
    </div>
  )
}

function PreferencesDialog({
  draftSettings,
  setDraftSettings,
  onAcceptAll,
  onRejectAll,
  onSave,
  onClose,
}: {
  draftSettings: ConsentCategorySettings
  setDraftSettings: (settings: ConsentCategorySettings) => void
  onAcceptAll: () => void
  onRejectAll: () => void
  onSave: () => void
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = ''
      previouslyFocused.current?.focus()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return
      }

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (focusable.length === 0) {
        return
      }

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
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        aria-label="Zamknij tło ustawień cookies"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-preferences-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-surface p-6 shadow-subtle"
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="consent-preferences-title"
            className="text-lg font-semibold leading-snug text-text-primary"
          >
            Ustawienia cookies
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className={cn(
              actionLinkStyles({ variant: 'text', size: 'xs' }),
              'min-h-10 shrink-0 px-2',
            )}
            aria-label="Zamknij ustawienia cookies"
          >
            Zamknij
          </button>
        </div>

        <p className="mt-3 text-sm text-text-secondary">
          Wybierz kategorie, na które wyrażasz zgodę. Zawsze możesz zmienić
          decyzję później.
        </p>

        <div className="mt-4">
          <ConsentToggle
            id="consent-necessary"
            label="Niezbędne"
            description="Wymagane do działania strony i bezpieczeństwa. Zawsze włączone."
            checked
            disabled
          />
          <ConsentToggle
            id="consent-analytics"
            label="Analityczne"
            description="Pomagają nam badać ruch na stronie (Google Analytics)."
            checked={draftSettings.analytics}
            onChange={(analytics) =>
              setDraftSettings({ ...draftSettings, analytics })
            }
          />
          <ConsentToggle
            id="consent-marketing"
            label="Marketingowe"
            description="Dopasowanie reklam i pomiar kampanii (Google Ads, Meta, OpenAI)."
            checked={draftSettings.marketing}
            onChange={(marketing) =>
              setDraftSettings({ ...draftSettings, marketing })
            }
          />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={onAcceptAll}
              className={actionLinkStyles({ variant: 'outline', size: 'sm' })}
            >
              Zaakceptuj wszystkie
            </button>
            <button
              type="button"
              onClick={onRejectAll}
              className={actionLinkStyles({ variant: 'outline', size: 'sm' })}
            >
              Odrzuć opcjonalne
            </button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className={actionLinkStyles({ variant: 'text', size: 'sm' })}
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={onSave}
              className={actionLinkStyles({ variant: 'primary', size: 'sm' })}
            >
              Zapisz wybrane
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CookieBanner() {
  const {
    isReady,
    bannerOpen,
    preferencesOpen,
    draftSettings,
    setDraftSettings,
    acceptAll,
    rejectAll,
    saveCustom,
    openSettings,
    closePreferences,
  } = useConsent()

  if (!isReady) {
    return null
  }

  if (!bannerOpen && !preferencesOpen) {
    return null
  }

  return (
    <>
      {bannerOpen && !preferencesOpen ? (
        <section
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-border-default bg-surface/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-subtle backdrop-blur-sm sm:px-6 sm:pt-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          aria-label="Zarządzanie zgodami na pliki cookies"
          aria-describedby="cookie-banner-description"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Heading
                level={2}
                variant="utility"
                className="inline-flex items-center gap-2 font-semibold"
              >
                <Cookie
                  className="h-5 w-5 shrink-0 text-action"
                  aria-hidden="true"
                  strokeWidth={1.75}
                />
                Pliki cookies i prywatność
              </Heading>
              <p
                id="cookie-banner-description"
                className="mt-2 text-sm text-text-secondary"
              >
                Niezbędne cookies zapewniają działanie strony. Za Twoją zgodą
                używamy też analitycznych i marketingowych — pomagają nam
                ulepszać treść i ofertę. Decyzję zmienisz w każdej chwili w
                stopce. Szczegóły w{' '}
                <Link
                  to="/polityka-prywatnosci"
                  className="font-semibold text-action underline-offset-4 hover:underline"
                >
                  Polityce prywatności
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={acceptAll}
                className={actionLinkStyles({ variant: 'outline', size: 'sm' })}
              >
                Zaakceptuj wszystkie
              </button>
              <button
                type="button"
                onClick={rejectAll}
                className={actionLinkStyles({ variant: 'outline', size: 'sm' })}
              >
                Odrzuć opcjonalne
              </button>
              <button
                type="button"
                onClick={openSettings}
                className={actionLinkStyles({ variant: 'text', size: 'sm' })}
              >
                Dostosuj
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {preferencesOpen ? (
        <PreferencesDialog
          draftSettings={draftSettings}
          setDraftSettings={setDraftSettings}
          onAcceptAll={acceptAll}
          onRejectAll={rejectAll}
          onSave={() => saveCustom(draftSettings)}
          onClose={closePreferences}
        />
      ) : null}
    </>
  )
}
