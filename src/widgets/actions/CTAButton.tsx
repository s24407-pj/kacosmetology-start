import { useUI } from '@context/UIContext'
import { contact } from '@data/contact'
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
        href={contact.booksy}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Umów się"
        onClick={() => trackPlausibleEvent('CTA Booksy Click', { placement })}
        className={cn(
          // stała wysokość + centrowanie
          'inline-flex h-10 items-center justify-center rounded-md leading-none px-4',
          'bg-action text-white',
          'transition-colors duration-200 ease-in-out hover:bg-action-hover',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 focus-visible:ring-offset-2',
        )}
      >
        <Calendar className="w-5 h-5 block shrink-0" />

        {/* Etykieta: animujemy szerokość + opacity, bez wpływu na wysokość */}
        <span
          className={cn(
            'overflow-hidden whitespace-nowrap leading-none',
            // nie używamy "gap", tylko własny margines, który też animujemy
            'transition-[width,opacity,margin] duration-300 ease-in-out',
            scrolled
              ? 'w-0 opacity-0 ml-0'
              : // 8ch ≈ szerokość napisu "Umów się" – możesz dopasować
                'w-[8ch] opacity-100 ml-2',
          )}
          aria-hidden={scrolled}
        >
          Umów się
        </span>
      </a>
    </div>
  )
}
