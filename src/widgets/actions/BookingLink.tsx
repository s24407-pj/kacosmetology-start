import type { ServiceArea, ServiceId } from '@app-types/types'
import { actionLinkStyles } from '@components/ui'
import { getServiceById } from '@data/services'
import { analytics } from '@libs/analytics'
import { bookingHref } from '@libs/booking/policy'
import { cn } from '@libs/utils'
import { Calendar } from 'lucide-react'
import type { ReactNode } from 'react'

export default function BookingLink({
  placement,
  area,
  serviceId,
  children = 'Umów wizytę',
  className,
  showExternalIcon = true,
}: {
  placement: string
  area?: ServiceArea
  serviceId?: ServiceId
  children?: ReactNode
  className?: string
  showExternalIcon?: boolean
}) {
  const serviceName = serviceId ? getServiceById(serviceId)?.name : undefined

  return (
    <a
      href={bookingHref(serviceId)}
      aria-label={typeof children === 'string' ? children : 'Umów wizytę'}
      onClick={() =>
        analytics.trackInitiateCheckout({
          placement,
          destinationUrl: bookingHref(serviceId),
          ...(area ? { serviceCategory: area } : {}),
          ...(serviceName ? { serviceName } : {}),
        })
      }
      className={cn(actionLinkStyles(), className)}
    >
      {children}
      {showExternalIcon ? (
        <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : null}
    </a>
  )
}
