import { cn } from '@libs/utils'
import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string | ReactNode
  subtitle?: string
  eyebrow?: string
  gradient?: boolean
  divider?: boolean
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  gradient = false,
  divider = true,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mx-auto mb-10 max-w-3xl text-center animate-on-scroll sm:mb-12',
        className,
      )}
    >
      {eyebrow && (
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-action">
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          'mb-4 font-display text-3xl font-bold leading-tight text-text-primary sm:text-4xl md:text-5xl',
          gradient && 'text-action',
        )}
      >
        {title}
      </h2>
      {divider && (
        <div
          aria-hidden="true"
          className="mx-auto mb-5 flex items-center justify-center gap-2"
        >
          <span className="h-px w-12 bg-action/25" />
        </div>
      )}
      {subtitle && (
        <p className="text-lg text-text-secondary max-w-3xl mx-auto animate-on-scroll stagger-1 font-body md:text-xl">
          {subtitle}
        </p>
      )}
    </div>
  )
}
