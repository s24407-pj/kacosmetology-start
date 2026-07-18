import { primarySalonLocation } from '@data/business'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/rezerwacja')({
  beforeLoad: () => {
    throw redirect({ href: primarySalonLocation.bookingUrl })
  },
})
