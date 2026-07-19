import { cn } from '@libs/utils'
import type { ReactNode } from 'react'
import { Eyebrow } from './Eyebrow'
import { Heading } from './Heading'

interface SectionHeaderProps {
  title: string | ReactNode
  subtitle?: string
  eyebrow?: string
  tone?: 'default' | 'accent' | 'inverse'
  align?: 'left' | 'center'
  divider?: boolean
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  tone = 'default',
  align = 'center',
  divider = false,
  className,
}: SectionHeaderProps) {
  const centered = align === 'center'

  return (
    <div
      data-reveal-on-scroll
      className={cn(
        'mb-10 max-w-3xl sm:mb-12',
        centered && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <Eyebrow
          tone={tone === 'inverse' ? 'inverse' : 'accent'}
          className="mb-3"
        >
          {eyebrow}
        </Eyebrow>
      )}
      <Heading level={2} variant="section" tone={tone} className="mb-4">
        {title}
      </Heading>
      {divider && (
        <div
          aria-hidden="true"
          className={cn(
            'mb-5 flex items-center gap-2',
            centered && 'justify-center',
          )}
        >
          <span
            className={cn(
              'h-px w-12',
              tone === 'inverse' ? 'bg-white/30' : 'bg-action/25',
            )}
          />
        </div>
      )}
      {subtitle && (
        <p
          className={cn(
            'max-w-3xl font-body text-lg leading-relaxed md:text-xl',
            tone === 'inverse' ? 'text-white/80' : 'text-text-secondary',
            centered && 'mx-auto',
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
