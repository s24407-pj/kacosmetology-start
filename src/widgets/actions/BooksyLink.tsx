import type { ServiceArea, ServiceId } from '@app-types/types'
import { actionLinkStyles } from '@components/ui'
import { primarySalonLocation } from '@data/business'
import { trackPlausibleEvent } from '@libs/analytics'
import { cn } from '@libs/utils'
import { ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'

export default function BooksyLink({
  placement,
  area,
  serviceId,
  children = 'Umów wizytę w Booksy',
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
  return (
    <a
      href={primarySalonLocation.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        typeof children === 'string'
          ? `${children} (otwiera nową kartę)`
          : 'Umów wizytę w Booksy (otwiera nową kartę)'
      }
      onClick={() =>
        trackPlausibleEvent('CTA Booksy Click', {
          placement,
          ...(area ? { area } : {}),
          ...(serviceId ? { serviceId } : {}),
        })
      }
      className={cn(actionLinkStyles(), className)}
    >
      {children}
      {showExternalIcon ? (
        <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
      ) : null}
    </a>
  )
}
