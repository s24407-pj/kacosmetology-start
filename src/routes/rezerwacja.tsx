import ReservationPage from '@features/reservation/ReservationPage'
import { createRouteHead, routeSocialImages } from '@libs/routeMetadata'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/rezerwacja')({
  validateSearch: (search: Record<string, unknown>) => ({
    service: typeof search.service === 'string' ? search.service : undefined,
  }),
  head: () =>
    createRouteHead({
      path: '/rezerwacja',
      title: 'Rezerwacja wizyty',
      description:
        'Wybierz usługę i termin, potwierdź telefon i zarezerwuj wizytę.',
      socialImage: routeSocialImages.home,
      robots: 'noindex,follow',
    }),
  component: () => (
    <ReservationPage initialService={Route.useSearch().service} />
  ),
})
