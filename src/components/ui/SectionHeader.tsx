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
        'mx-auto mb-12 max-w-3xl text-center animate-on-scroll',
        className,
      )}
    >
      {eyebrow && (
        <span className="mb-4 inline-flex items-center gap-2 rounded-md border border-border-default bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-action">
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          'text-3xl md:text-5xl font-bold mb-5 font-display text-text-primary',
          gradient && 'text-action',
        )}
      >
        {title}
      </h2>
      {divider && (
        <div
          aria-hidden="true"
          className="mx-auto mb-6 flex items-center justify-center gap-2"
        >
          <span className="h-px w-16 bg-border-default" />
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
