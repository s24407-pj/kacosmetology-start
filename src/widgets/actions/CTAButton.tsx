import { actionLinkStyles } from '@components/ui'
import { useUI } from '@context/UIContext'
import { primarySalonLocation } from '@data/business'
import { trackPlausibleEvent } from '@libs/analytics'
import { cn } from '@libs/utils'
import { Calendar } from 'lucide-react'

type CTAButtonProps = {
  placement?: string
}

export default function CTAButton({ placement = 'navbar' }: CTAButtonProps) {
  const { scrolled } = useUI()

  return (
    <div className="flex items-center justify-center">
      <a
        href={primarySalonLocation.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Umów wizytę w Booksy (otwiera nową kartę)"
        onClick={() => trackPlausibleEvent('CTA Booksy Click', { placement })}
        className={cn(
          actionLinkStyles({ size: 'xs' }),
          'h-10 min-h-0 gap-0 leading-none',
        )}
      >
        <Calendar className="block h-5 w-5 shrink-0" />

        <span
          className={cn(
            'grid motion-safe:transition-[grid-template-columns,opacity,margin] motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none',
            scrolled
              ? 'ml-0 grid-cols-[0fr] opacity-0'
              : 'ml-2 grid-cols-[1fr] opacity-100',
          )}
          aria-hidden={scrolled}
        >
          <span className="min-w-0 overflow-hidden whitespace-nowrap leading-none">
            Umów się
          </span>
        </span>
      </a>
    </div>
  )
}
