import BookingPage from '@features/booking/page/BookingPage'
import { createRouteHead, routeSocialImages } from '@libs/routeMetadata'
import { createFileRoute } from '@tanstack/react-router'

interface ReservationSearch {
  service?: string
  serviceId?: string
}

function ReservationRouteComponent() {
  const search = Route.useSearch()
  return <BookingPage initialServiceId={search.serviceId || search.service} />
}

export const Route = createFileRoute('/rezerwacja')({
  validateSearch: (search: Record<string, unknown>): ReservationSearch => ({
    service: typeof search.service === 'string' ? search.service : undefined,
    serviceId:
      typeof search.serviceId === 'string' ? search.serviceId : undefined,
  }),
  head: () =>
    createRouteHead({
      path: '/rezerwacja',
      title: 'Rezerwacja wizyty online',
      description:
        'Zarezerwuj wizytę w salonie kosmetycznym i trychologicznym Ka.Cosmetology w Starogardzie Gdańskim.',
      socialImage: routeSocialImages.home,
    }),
  component: ReservationRouteComponent,
})
