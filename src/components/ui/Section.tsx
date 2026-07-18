import { cn } from '@libs/utils'
import type { ReactNode } from 'react'

interface SectionProps {
  id?: string
  className?: string
  containerClassName?: string
  background?: 'white' | 'gradient' | 'gray' | 'contact' | 'mesh'
  decorated?: boolean | 'top' | 'bottom'
  children: ReactNode
}

export function Section({
  id,
  className,
  containerClassName,
  background = 'white',
  decorated = false,
  children,
}: SectionProps) {
  const bgClasses = {
    white: 'bg-surface',
    gradient:
      'bg-[linear-gradient(180deg,var(--color-surface-muted)_0%,var(--color-surface)_100%)]',
    gray: 'bg-surface-muted',
    contact:
      'bg-[linear-gradient(180deg,var(--color-surface)_0%,var(--color-surface-muted)_68%,var(--color-surface-muted)_100%)]',
    mesh: 'bg-surface-muted',
  }
  const showTopSeparator = decorated === true || decorated === 'top'
  const showBottomSeparator = decorated === true || decorated === 'bottom'

  return (
    <section
      id={id}
      className={cn(
        'relative overflow-hidden py-16 scroll-mt-48 sm:py-20 min-[1180px]:scroll-mt-36',
        bgClasses[background],
        className,
      )}
    >
      {decorated && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {showTopSeparator && (
            <div className="absolute inset-x-0 top-0 h-px bg-border-default" />
          )}
          {showBottomSeparator && (
            <div className="absolute inset-x-0 bottom-0 h-px bg-border-default" />
          )}
        </div>
      )}
      <div
        className={cn(
          'relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  )
}
