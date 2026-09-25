import { useCustomerAuth } from '@features/booking/hooks/useCustomerAuth'
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  MessageSquare,
  Phone,
  RefreshCw,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface AuthStepProps {
  onSuccess: () => void
  onBack: () => void
}

export default function AuthStep({ onSuccess, onBack }: AuthStepProps) {
  const { customer, token, requestCode, verifyCode, logout } = useCustomerAuth()

  // Form states
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const [codeSent, setCodeSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Normalizes Polish phone number to E.164 (+48XXXXXXXXX)
  const normalizePhoneNumber = (raw: string): string => {
    const cleaned = raw.replace(/[\s\-()]/g, '')
    if (cleaned.startsWith('+')) {
      return cleaned
    }
    if (cleaned.length === 9) {
      return `+48${cleaned}`
    }
    return `+${cleaned}`
  }

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const normalized = normalizePhoneNumber(phoneNumber)
    if (!/^\+[0-9]{9,15}$/.test(normalized)) {
      setErrorMessage(
        'Podaj prawidłowy numer telefonu (np. 726 154 460 lub +48 726 154 460).',
      )
      return
    }

    setIsSubmitting(true)
    try {
      await requestCode(normalized)
      setCodeSent(true)
      setResendCooldown(60)
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Nie udało się wysłać kodu SMS. Spróbuj ponownie za chwilę.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const normalized = normalizePhoneNumber(phoneNumber)
    if (!/^[0-9]{4,6}$/.test(code.trim())) {
      setErrorMessage('Wpisz poprawny 4-6 cyfrowy kod SMS.')
      return
    }

    setIsSubmitting(true)
    try {
      await verifyCode({
        phoneNumber: normalized,
        code: code.trim(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      })
      onSuccess()
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Nieprawidłowy kod weryfikacyjny. Sprawdź SMS i spróbuj ponownie.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // If already logged in, show simple confirmation
  if (token && customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
              Dane klienta
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Twoje dane zostaną użyte do potwierdzenia rezerwacji.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface px-3 py-1.5 text-xs sm:text-sm font-medium text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Zmień termin</span>
          </button>
        </div>

        <div className="rounded-lg border border-border-default bg-surface p-6 shadow-xs max-w-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-action">
              <User className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-text-primary">
                {customer.firstName} {customer.lastName}
              </h3>
              <p className="text-sm text-text-secondary">
                {customer.phoneNumber}
              </p>
              {customer.email ? (
                <p className="text-xs text-text-muted">{customer.email}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 border-t border-border-default/60 pt-4">
            <button
              type="button"
              onClick={onSuccess}
              className="w-full sm:w-auto flex-1 rounded-md border border-action bg-action px-6 py-2.5 text-sm font-semibold text-white hover:bg-action-hover transition-colors cursor-pointer"
            >
              Kontynuuj do podsumowania →
            </button>

            <button
              type="button"
              onClick={logout}
              className="text-xs text-text-muted hover:text-danger-500 transition-colors py-2"
            >
              To nie Twoje konto? Wyloguj się
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-text-primary">
            Weryfikacja numeru telefonu
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Wpisz swój numer telefonu komórkowego. Wyślemy bezpłatny kod SMS,
            aby potwierdzić rezerwację.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface px-3 py-1.5 text-xs sm:text-sm font-medium text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Zmień termin</span>
        </button>
      </div>

      <div className="rounded-lg border border-border-default bg-surface p-6 shadow-xs max-w-lg">
        {errorMessage ? (
          <div
            className="mb-4 rounded-md bg-danger-500/10 p-3 text-xs text-danger-500"
            role="alert"
          >
            {errorMessage}
          </div>
        ) : null}

        {!codeSent ? (
          /* Step A: Phone Number */
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label
                htmlFor="booking-phone"
                className="block text-sm font-medium text-text-primary mb-1"
              >
                Numer telefonu
              </label>
              <div className="relative">
                <Phone
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                  aria-hidden="true"
                />
                <input
                  id="booking-phone"
                  type="tel"
                  required
                  placeholder="np. 726 154 460"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-md border border-border-default bg-surface py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-action focus:outline-none focus:ring-1 focus:ring-action"
                />
              </div>
              <p className="mt-1.5 text-xs text-text-muted">
                Numer posłuży wyłącznie do potwierdzenia wizyty i powiadomień
                SMS o rezerwacji.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || phoneNumber.trim().length < 9}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-action bg-action px-6 py-2.5 text-sm font-semibold text-white hover:bg-action-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  <span>Wysyłanie kodu...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  <span>Wyślij kod SMS</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step B: Verify Code */
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="rounded-md bg-surface-muted p-3 text-xs text-text-secondary flex items-center justify-between">
              <div>
                Wysłano kod na numer:{' '}
                <span className="font-semibold text-text-primary">
                  {phoneNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCodeSent(false)
                  setCode('')
                  setErrorMessage(null)
                }}
                className="text-xs text-action hover:underline cursor-pointer"
              >
                Zmień numer
              </button>
            </div>

            <div>
              <label
                htmlFor="booking-sms-code"
                className="block text-sm font-medium text-text-primary mb-1"
              >
                Kod z wiadomości SMS
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                  aria-hidden="true"
                />
                <input
                  id="booking-sms-code"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="np. 123456"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  className="w-full rounded-md border border-border-default bg-surface py-2.5 pl-10 pr-3 text-center text-lg font-mono tracking-widest text-text-primary placeholder:text-text-muted focus:border-action focus:outline-none focus:ring-1 focus:ring-action"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label
                  htmlFor="booking-first-name"
                  className="block text-xs font-medium text-text-secondary mb-1"
                >
                  Imię (opcjonalnie dla nowych kont)
                </label>
                <input
                  id="booking-first-name"
                  type="text"
                  placeholder="np. Anna"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-md border border-border-default bg-surface py-2 px-3 text-sm text-text-primary focus:border-action focus:outline-none focus:ring-1 focus:ring-action"
                />
              </div>

              <div>
                <label
                  htmlFor="booking-last-name"
                  className="block text-xs font-medium text-text-secondary mb-1"
                >
                  Nazwisko (opcjonalnie)
                </label>
                <input
                  id="booking-last-name"
                  type="text"
                  placeholder="np. Kowalska"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-md border border-border-default bg-surface py-2 px-3 text-sm text-text-primary focus:border-action focus:outline-none focus:ring-1 focus:ring-action"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || code.length < 4}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-action bg-action px-6 py-2.5 text-sm font-semibold text-white hover:bg-action-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Weryfikacja...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    <span>Zatwierdź kod i kontynuuj</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-1">
              {resendCooldown > 0 ? (
                <p className="text-xs text-text-muted">
                  Możesz wysłać kod ponownie za {resendCooldown} s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestCode}
                  className="text-xs text-action hover:underline cursor-pointer"
                >
                  Nie dotarł SMS? Wyślij kod ponownie
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
