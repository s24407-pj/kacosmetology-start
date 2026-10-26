import { primarySalonLocation } from '@data/business'
import { BookingClient, BookingError, errorMessage } from '@libs/booking/client'
import type {
  Employee,
  Offering,
  Profile,
  Quote,
  Reservation,
  Session,
  Slot,
} from '@libs/booking/contracts'
import {
  companyId as configuredCompany,
  internationalPhone,
  isCustomerSession,
  serviceMap,
  wallTime,
  warsawToday,
} from '@libs/booking/policy'
import {
  type Attempt,
  clearAttempt,
  definitiveFailure,
  eraseAttemptBodies,
  expireAttempts,
  hasUnresolved,
  matches,
  newAttempt,
  RETENTION_MS,
  readAttempt,
  saveAttempt,
} from '@libs/booking/recovery'
import { useEffect, useRef, useState } from 'react'

const inputClass =
  'w-full rounded-lg border border-border-default bg-white p-3 text-text-primary'
const buttonClass =
  'rounded-lg bg-action px-5 py-3 font-medium text-white disabled:opacity-50'

export default function ReservationPage({
  initialService,
  company = configuredCompany,
  mapping = serviceMap,
}: {
  initialService?: string
  company?: string
  mapping?: Record<string, string>
}) {
  const [client] = useState(() => new BookingClient())
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [service, setService] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employee, setEmployee] = useState('')
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [time, setTime] = useState('')
  const [availabilityRefresh, setAvailabilityRefresh] = useState(0)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [availabilityWarning, setAvailabilityWarning] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [phone, setPhone] = useState('+48')
  const [phoneConfirmed, setPhoneConfirmed] = useState(false)
  const [sentPhone, setSentPhone] = useState('')
  const [code, setCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [lostAttempt, setLostAttempt] = useState(false)
  const [race, setRace] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [result, setResult] = useState<Reservation | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [waitUntil, setWaitUntil] = useState(0)
  const [now, setNow] = useState(Date.now())
  const submitLock = useRef(false)
  const catalogGeneration = useRef(0)
  const slotGeneration = useRef(0)
  const lastScope = useRef<string | null>(null)
  const sessionGeneration = useRef(0)
  const scope = session
    ? `${session.userId}:${session.companyId}:${session.employmentId}:${session.authorities.join(',')}`
    : null
  const selectionLocked = Boolean(attempt || lostAttempt || result)

  const report = (cause: unknown) => {
    setError(errorMessage(cause))
    if (cause instanceof BookingError && cause.retryAfterSeconds)
      setWaitUntil(Date.now() + cause.retryAfterSeconds * 1000)
  }
  const restoreSession = async () => {
    const generation = ++sessionGeneration.current
    client.invalidate()
    let identity: Session
    try {
      identity = await client.request<Session>('/api/auth/me')
    } catch (cause) {
      if (cause instanceof BookingError && cause.status === 401) {
        setSession(null)
        setProfile(null)
        return
      }
      throw cause
    }
    if (generation !== sessionGeneration.current) return
    const nextScope = `${identity.userId}:${identity.companyId}:${identity.employmentId}:${identity.authorities.join(',')}`
    if (lastScope.current !== null && lastScope.current !== nextScope) {
      setFirstName('')
      setLastName('')
      setEmail('')
      setQuote(null)
      setAccepted(false)
      setRace(false)
      setAcknowledged(false)
      setAttempt(null)
      setLostAttempt(false)
      setError(
        'Konto lub salon zmieniły się. Dane formularza zostały usunięte. Sprawdź właściwe konto i przygotuj nową rezerwację.',
      )
    }
    lastScope.current = nextScope
    setSession(identity)
    setProfile(null)
    if (!isCustomerSession(identity, company)) return
    const readiness = await client.request<Profile>('/api/users/me')
    if (readiness.id !== identity.userId || readiness.companyId !== company)
      throw new Error('Nieprawidłowy zakres kartoteki')
    if (generation !== sessionGeneration.current) return
    setProfile(readiness)
    const saved = readAttempt(identity)
    setAttempt(saved)
    setLostAttempt(!saved && hasUnresolved(identity))
  }

  useEffect(() => {
    setDate(warsawToday())
    if (!company) return
    let cancelled = false
    client
      .request<Offering[]>(
        `/api/offerings/public/company/${encodeURIComponent(company)}`,
      )
      .then((items) => {
        if (cancelled) return
        const available = items.filter(
          (item) => item.active && item.companyId === company,
        )
        setOfferings(available)
        const mapped = initialService ? mapping[initialService] : undefined
        if (mapped && available.some((item) => item.id === mapped))
          setService(mapped)
        else if (initialService)
          setError(
            'Wybrana usługa nie ma aktywnego powiązania z rezerwacją. Wybierz usługę z aktualnego katalogu.',
          )
      })
      .catch(report)
    restoreSession()
      .catch(report)
      .finally(() => setSessionLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const generation = ++catalogGeneration.current
    setEmployees([])
    setEmployee('')
    setSlots([])
    setTime('')
    setQuote(null)
    setAccepted(false)
    if (!service) return
    client
      .request<Employee[]>(
        `/api/employees/public/company/${encodeURIComponent(company)}?offeringId=${encodeURIComponent(service)}`,
      )
      .then((items) => {
        if (generation === catalogGeneration.current) setEmployees(items)
      })
      .catch(report)
  }, [service])

  useEffect(() => {
    const generation = ++slotGeneration.current
    setAvailabilityWarning('')
    setSlots([])
    setTime('')
    setQuote(null)
    setAccepted(false)
    if (!service || !date || !employees.length) {
      setSlotsLoading(false)
      return
    }
    setSlotsLoading(true)
    const eligible = employee
      ? employees.filter((item) => item.id === employee)
      : employees
    Promise.allSettled(
      eligible.map((item) =>
        client.request<Slot[]>(
          `/api/availability?employeeId=${encodeURIComponent(item.id)}&serviceId=${encodeURIComponent(service)}&date=${date}`,
        ),
      ),
    )
      .then((all) => {
        if (generation !== slotGeneration.current) return
        const successful = all.filter((result) => result.status === 'fulfilled')
        if (successful.length < all.length) {
          setAvailabilityWarning(
            successful.length
              ? 'Nie udało się pobrać terminów części specjalistów. Pokazujemy terminy pozostałych. Spróbuj ponownie później, aby sprawdzić pełną dostępność.'
              : 'Nie udało się pobrać dostępnych terminów. Spróbuj ponownie później.',
          )
        }
        const merged = new Map<string, Slot>()
        for (const slot of successful.flatMap((result) => result.value)) {
          const previous = merged.get(slot.time)
          merged.set(slot.time, {
            ...slot,
            personalConflict:
              (previous?.personalConflict ?? true) && slot.personalConflict,
          })
        }
        setSlots(
          [...merged.values()].sort((a, b) => a.time.localeCompare(b.time)),
        )
      })
      .catch(report)
      .finally(() => {
        if (generation === slotGeneration.current) setSlotsLoading(false)
      })
  }, [service, employee, date, employees, scope, availabilityRefresh])

  useEffect(() => {
    try {
      expireAttempts()
    } catch {
      /* In-memory attempt remains available in this tab. */
    }
    if (attempt && now - attempt.createdAt >= RETENTION_MS) {
      setAttempt(null)
      setLostAttempt(true)
      setFirstName('')
      setLastName('')
      setEmail('')
    }
  }, [attempt, now])

  const run = async (
    work: () => Promise<void>,
    allowDuringCooldown = false,
  ) => {
    if (submitLock.current || (!allowDuringCooldown && Date.now() < waitUntil))
      return
    submitLock.current = true
    setBusy(true)
    setError('')
    try {
      await work()
    } catch (cause) {
      report(cause)
    } finally {
      submitLock.current = false
      setBusy(false)
    }
  }

  const sendCode = () =>
    run(async () => {
      const canonical = internationalPhone(phone)
      if (!canonical || !phoneConfirmed) {
        setError(
          'Podaj pełny numer z prefiksem kraju (np. +48) i potwierdź, że jest poprawny.',
        )
        return
      }
      await client.request('/api/auth/request-code', {
        method: 'POST',
        body: { companyId: company, phoneNumber: canonical },
      })
      setSentPhone(canonical)
      setCode('')
      setWaitUntil(Date.now() + 30000)
    })
  const verifyCode = () =>
    run(async () => {
      await client.request('/api/auth/verify-code', {
        method: 'POST',
        body: { companyId: company, phoneNumber: sentPhone, code },
      })
      setCode('')
      setSentPhone('')
      setWaitUntil(0)
      await restoreSession()
    }, true)
  const logout = () =>
    run(async () => {
      await client.request('/api/auth/logout', { method: 'POST' })
      // Retain only the uncertainty marker; logout deliberately destroys private form recovery.
      try {
        eraseAttemptBodies()
      } catch {
        /* Server logout is already confirmed. */
      }
      setSession(null)
      setProfile(null)
      setAttempt(null)
      setFirstName('')
      setLastName('')
      setEmail('')
      setCode('')
      client.invalidate()
      if (selectionLocked && !result)
        setError(
          'Nieznany wynik poprzedniego zgłoszenia. Po ponownym logowaniu skontaktuj się z salonem przed kolejną rezerwacją.',
        )
    })
  const getQuote = () =>
    run(async () => {
      const value = await client.request<Quote>('/api/quotes', {
        method: 'POST',
        session: session ?? undefined,
        body: {
          serviceId: service,
          startTime: `${date}T${time.length === 5 ? `${time}:00` : time}`,
        },
      })
      if (value.companyId !== company || value.serviceId !== service)
        throw new Error('Nieprawidłowy zakres oferty')
      setQuote(value)
      setAccepted(false)
    })
  const submit = () =>
    run(async () => {
      if (
        !session ||
        !profile ||
        !isCustomerSession(session, company) ||
        lostAttempt
      )
        return
      let current = attempt
      if (!current) {
        if (
          !quote ||
          !accepted ||
          new Date(quote.expiresAt).getTime() <= Date.now() ||
          (race && !acknowledged)
        ) {
          setError('Pobierz i zaakceptuj aktualną ofertę.')
          return
        }
        if (
          profile.profileState === 'PENDING' &&
          (!firstName.trim() || !lastName.trim())
        ) {
          setError('Uzupełnij imię i nazwisko.')
          return
        }
        if (
          profile.profileState === 'PENDING' &&
          email.trim() &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) {
          setError('Podaj poprawny adres e-mail lub pozostaw pole puste.')
          return
        }
        current = newAttempt(
          {
            serviceId: service,
            employeeId: employee || null,
            startTime: quote.startTime,
            quoteId: quote.quoteId,
            ...(profile.profileState === 'PENDING'
              ? {
                  firstVisitDetails: {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    ...(email.trim() ? { contactEmail: email.trim() } : {}),
                  },
                }
              : {}),
          },
          session,
        )
      }
      if (!matches(current, session)) {
        setError('Zgłoszenie należy do innego konta lub salonu.')
        return
      }
      const priorUncertain = current.uncertain
      // Write before network; a crash after dispatch must recover the same body and key.
      const sending = { ...current, uncertain: true }
      try {
        saveAttempt(sending)
      } catch {
        setError(
          'Nie można zachować danych zgłoszenia w tej karcie. Rezerwacja nie została wysłana. Włącz pamięć sesji przeglądarki lub skontaktuj się z salonem.',
        )
        return
      }
      setAttempt(sending)
      try {
        const actual = await client.request<Reservation>('/api/reservations', {
          method: 'POST',
          session,
          body: current.body,
          key: current.key,
        })
        if (actual.companyId !== company)
          throw new Error('Nieprawidłowy zakres potwierdzenia')
        setResult(actual)
        try {
          clearAttempt(session)
        } catch {
          /* A local cleanup failure cannot undo the committed response. */
        }
        setAttempt(null)
        setFirstName('')
        setLastName('')
        setEmail('')
        setRace(false)
        // The acknowledgement is authoritative; retries/reloads never dispatch another conversion.
        // Booking analytics are deliberately not emitted: no new tracking scope is needed here.
      } catch (cause) {
        if (definitiveFailure(cause, priorUncertain)) {
          clearAttempt(session)
          setAttempt(null)
          if (
            cause instanceof BookingError &&
            cause.code === 'CUSTOMER_PROFILE_CHANGED'
          ) {
            setRace(true)
            setAcknowledged(false)
            setFirstName('')
            setLastName('')
            setEmail('')
            await restoreSession()
          }
          if (
            cause instanceof BookingError &&
            ['SLOT_UNAVAILABLE', 'QUOTE_RECONFIRMATION_REQUIRED'].includes(
              cause.code,
            )
          ) {
            setQuote(null)
            setAccepted(false)
            if (cause.code === 'SLOT_UNAVAILABLE')
              setAvailabilityRefresh((value) => value + 1)
          }
        }
        if (
          cause instanceof BookingError &&
          [401, 403].includes(cause.status)
        ) {
          setProfile(null)
          await restoreSession().catch(() => {})
        }
        throw cause
      }
    })

  const waiting = now < waitUntil
  const canBook = Boolean(
    session && profile && isCustomerSession(session, company),
  )
  const quoteExpired = !quote || new Date(quote.expiresAt).getTime() <= now

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-52 text-text-primary min-[810px]:pt-40">
      <h1 className="font-display text-4xl">Rezerwacja wizyty</h1>
      <p className="mt-4">
        Wybierz usługę i termin. Potwierdzenie telefonu dotyczy wyłącznie tego
        salonu. Wszystkie godziny podajemy dla Polski (Europe/Warsaw).
      </p>
      <p className="mt-2">
        Pomoc salonu:{' '}
        <a
          className="underline"
          href={`tel:${primarySalonLocation.phone.replace(/\s/g, '')}`}
        >
          {primarySalonLocation.phone}
        </a>
        .
      </p>
      {!company ? (
        <p role="alert" className="mt-6">
          Rezerwacja online nie jest jeszcze skonfigurowana. Zadzwoń:{' '}
          <a href={`tel:${primarySalonLocation.phone.replace(/\s/g, '')}`}>
            {primarySalonLocation.phone}
          </a>
          .
        </p>
      ) : (
        <>
          {error && (
            <p
              role="alert"
              className="my-4 rounded-lg border border-red-700 p-4"
            >
              {error}
            </p>
          )}
          {waiting && (
            <p role="status">
              Ponowienie za {Math.ceil((waitUntil - now) / 1000)} s.
            </p>
          )}
          {result ? (
            <section
              className="mt-8 rounded-xl border border-border-default p-6"
              aria-label="Wynik rezerwacji"
            >
              <h2 className="text-2xl">
                {result.status === 'BOOKED'
                  ? 'Wizyta zarezerwowana'
                  : result.status === 'CANCELLED'
                    ? 'Wizyta anulowana'
                    : 'Aktualny stan wizyty'}
              </h2>
              <p>
                {result.serviceName} — {result.price} zł ·{' '}
                {result.durationMinutes} min
              </p>
              <p>
                {wallTime(result.startTime)} – {wallTime(result.endTime)}{' '}
                (Polska)
              </p>
              <p>
                {result.employeeName} · {result.companyName}{' '}
                {result.companyAddress}
              </p>
              <p>
                Status:{' '}
                {{
                  BOOKED: 'Zarezerwowana',
                  CANCELLED: 'Anulowana',
                  COMPLETED: 'Zakończona',
                  NO_SHOW: 'Nieobecność',
                }[result.status] ?? result.status}
                . Numer rezerwacji: {result.id}
              </p>
              {result.archived && <p>Ta rezerwacja jest zarchiwizowana.</p>}
            </section>
          ) : (
            <>
              <fieldset
                disabled={busy || selectionLocked}
                className="mt-8 space-y-4 rounded-xl border border-border-default p-6"
              >
                <legend className="px-2 text-xl">1. Usługa i termin</legend>
                <label className="block">
                  Usługa
                  <select
                    aria-label="Usługa"
                    className={inputClass}
                    value={service}
                    onChange={(event) => setService(event.target.value)}
                  >
                    <option value="">Wybierz usługę</option>
                    {offerings.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} · {item.durationMinutes} min · od{' '}
                        {item.price} zł
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  Specjalista
                  <select
                    aria-label="Specjalista"
                    className={inputClass}
                    value={employee}
                    onChange={(event) => setEmployee(event.target.value)}
                  >
                    <option value="">Dowolny dostępny specjalista</option>
                    {employees.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.firstName} {item.lastName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  Data
                  <input
                    type="date"
                    className={inputClass}
                    min={warsawToday()}
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </label>
                <label className="block">
                  Godzina
                  <select
                    aria-label="Godzina"
                    className={inputClass}
                    value={time}
                    onChange={(event) => {
                      setTime(event.target.value)
                      setQuote(null)
                      setAccepted(false)
                    }}
                  >
                    <option value="">Wybierz godzinę</option>
                    {slots.map((slot) => (
                      <option
                        key={slot.time}
                        value={slot.time}
                        disabled={slot.personalConflict}
                      >
                        {slot.time.slice(0, 5)}
                        {slot.personalConflict
                          ? ' — koliduje z Twoją wizytą'
                          : ''}
                      </option>
                    ))}
                  </select>
                </label>
                {slotsLoading && (
                  <p role="status">Pobieramy dostępne terminy…</p>
                )}
                {availabilityWarning && (
                  <p role="status">{availabilityWarning}</p>
                )}
                {service &&
                  date &&
                  !slotsLoading &&
                  !slots.length &&
                  !availabilityWarning && (
                    <p role="status">
                      Brak dostępnych terminów dla wybranego dnia. Wybierz inny
                      dzień.
                    </p>
                  )}
                <p>
                  Wybór godziny nie blokuje terminu. Dostępność zostanie
                  sprawdzona przy zapisie.
                </p>
              </fieldset>
              {lostAttempt && (
                <p role="alert" className="mt-6">
                  Zachowano informację o zgłoszeniu bez potwierdzonego wyniku,
                  ale jego dane wygasły lub zostały usunięte. Skontaktuj się z
                  salonem przed utworzeniem nowej rezerwacji. Brak wizyty na
                  liście nie dowodzi, że zapis się nie powiódł.
                </p>
              )}
              {attempt && (
                <section className="mt-6 rounded-xl border border-border-default p-6">
                  <h2 className="text-xl">Sprawdź poprzednie zgłoszenie</h2>
                  <p>
                    Wynik może być już zapisany. Zachowane dane i ten sam klucz
                    służą wyłącznie do ponowienia tej operacji (do 30 minut).
                    Nie twórz drugiego zgłoszenia.
                  </p>
                  <p>{wallTime(attempt.body.startTime)}</p>
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={busy || waiting || !canBook}
                    onClick={submit}
                  >
                    Sprawdź wynik tego samego zgłoszenia
                  </button>
                </section>
              )}
              <section
                className="mt-8 space-y-4 rounded-xl border border-border-default p-6"
                aria-label="Weryfikacja telefonu"
              >
                <h2 className="text-xl">2. Potwierdź telefon</h2>
                {sessionLoading ? (
                  <p role="status">Sprawdzamy sesję…</p>
                ) : session ? (
                  <>
                    <p>
                      {canBook
                        ? `Telefon potwierdzony: ${profile?.phoneNumber}`
                        : 'Aktywna sesja należy do innego salonu albo konta pracownika. Wyloguj ją przed potwierdzeniem telefonu klienta.'}
                    </p>
                    <button
                      type="button"
                      disabled={busy || waiting}
                      className={buttonClass}
                      onClick={logout}
                    >
                      Wyloguj
                    </button>
                    <button
                      type="button"
                      disabled={busy || waiting}
                      className={buttonClass}
                      onClick={() => run(restoreSession)}
                    >
                      Odśwież sesję
                    </button>
                  </>
                ) : (
                  <>
                    <label className="block">
                      Telefon z prefiksem kraju
                      <input
                        type="tel"
                        autoComplete="tel"
                        className={inputClass}
                        value={phone}
                        onChange={(event) => {
                          setPhone(event.target.value)
                          setPhoneConfirmed(false)
                        }}
                        placeholder="+48500100200"
                      />
                    </label>
                    <label className="flex gap-3">
                      <input
                        type="checkbox"
                        checked={phoneConfirmed}
                        onChange={(event) =>
                          setPhoneConfirmed(event.target.checked)
                        }
                      />
                      Potwierdzam pełny numer wraz z prefiksem kraju (np. +48
                      dla Polski).
                    </label>
                    <button
                      type="button"
                      className={buttonClass}
                      disabled={busy || waiting}
                      onClick={sendCode}
                    >
                      {sentPhone ? 'Wyślij kod ponownie' : 'Wyślij kod SMS'}
                    </button>
                    {sentPhone && (
                      <div>
                        <p>Kod wysłano na {sentPhone}.</p>
                        <label>
                          Kod SMS
                          <input
                            className={inputClass}
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                          />
                        </label>
                        <button
                          type="button"
                          className={buttonClass}
                          disabled={busy || !/^\d{6}$/.test(code)}
                          onClick={verifyCode}
                        >
                          Potwierdź kod
                        </button>
                      </div>
                    )}
                  </>
                )}
                <p>
                  Numer telefonu jest powiązany z jedną kartoteką w salonie.
                  Przy wspólnym lub ponownie przydzielonym numerze skontaktuj
                  się z salonem. Potwierdzenie SMS nie potwierdza tożsamości
                  osoby.
                </p>
              </section>
              {canBook && !attempt && !lostAttempt && (
                <section
                  className="mt-8 space-y-4 rounded-xl border border-border-default p-6"
                  aria-label="Potwierdzenie wizyty"
                >
                  <h2 className="text-xl">3. Dane i potwierdzenie</h2>
                  {race && (
                    <label className="flex gap-3">
                      <input
                        type="checkbox"
                        checked={acknowledged}
                        onChange={(event) =>
                          setAcknowledged(event.target.checked)
                        }
                      />
                      Rozumiem, że moje dane nie zostały zapisane. Chcę powiązać
                      wizytę z kartoteką salonu dla tego numeru. W razie
                      niezgodności skontaktuję się z salonem.
                    </label>
                  )}
                  {profile?.profileState === 'PENDING' ? (
                    <>
                      <p>
                        Pierwsza wizyta: dane kartoteki zapiszą się dopiero po
                        udanej rezerwacji.
                      </p>
                      <label className="block">
                        Imię
                        <input
                          autoComplete="given-name"
                          maxLength={100}
                          required
                          className={inputClass}
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                        />
                      </label>
                      <label className="block">
                        Nazwisko
                        <input
                          autoComplete="family-name"
                          maxLength={100}
                          required
                          className={inputClass}
                          value={lastName}
                          onChange={(event) => setLastName(event.target.value)}
                        />
                      </label>
                      <label className="block">
                        E-mail (opcjonalnie)
                        <input
                          type="email"
                          autoComplete="email"
                          maxLength={255}
                          className={inputClass}
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                        />
                      </label>
                    </>
                  ) : (
                    <p>
                      Wizyta zostanie powiązana z kartoteką salonu dla
                      potwierdzonego telefonu. Zmiany imienia, nazwiska lub
                      numeru zgłoś obsłudze salonu.
                    </p>
                  )}
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={
                      busy || waiting || !time || (race && !acknowledged)
                    }
                    onClick={getQuote}
                  >
                    Pobierz aktualną ofertę
                  </button>
                  {quote && (
                    <div>
                      <p>
                        {quote.serviceName} · {quote.price} zł ·{' '}
                        {quote.durationMinutes} min ·{' '}
                        {wallTime(quote.startTime)}
                      </p>
                      <p>
                        Oferta ważna do{' '}
                        {new Intl.DateTimeFormat('pl-PL', {
                          timeZone: 'Europe/Warsaw',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(new Date(quote.expiresAt))}{' '}
                        (Polska).
                      </p>
                      {quoteExpired ? (
                        <p role="status">
                          Oferta wygasła. Pobierz aktualną ofertę.
                        </p>
                      ) : (
                        <label className="flex gap-3">
                          <input
                            type="checkbox"
                            checked={accepted}
                            onChange={(event) =>
                              setAccepted(event.target.checked)
                            }
                          />
                          Akceptuję powyższą cenę, czas trwania i termin.
                        </label>
                      )}
                    </div>
                  )}
                  <p>
                    Dane zgłoszenia mogą być przechowywane w tej karcie
                    przeglądarki przez maksymalnie 30 minut, aby bezpiecznie
                    sprawdzić wynik po przerwaniu połączenia. Wylogowanie usuwa
                    te dane.{' '}
                    <a className="underline" href="/polityka-prywatnosci">
                      Polityka prywatności
                    </a>
                  </p>
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={
                      busy ||
                      waiting ||
                      !accepted ||
                      quoteExpired ||
                      (race && !acknowledged)
                    }
                    onClick={submit}
                  >
                    Rezerwuję wizytę
                  </button>
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
