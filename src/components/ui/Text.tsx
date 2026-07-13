import { cn } from '@libs/utils'
import type { ReactNode } from 'react'

interface TextProps {
  children: ReactNode
  variant?: 'body' | 'lead' | 'small' | 'caption'
  font?: 'playfair' | 'crimson' | 'default'
  className?: string
  italic?: boolean
}

export function Text({
  children,
  variant = 'body',
  font = 'default',
  className,
  italic = false,
}: TextProps) {
  const variantClasses = {
    body: 'text-base',
    lead: 'text-xl md:text-2xl',
    small: 'text-sm',
    caption: 'text-xs',
  }

  const fontClass =
    font === 'playfair'
      ? 'font-display'
      : font === 'crimson'
        ? 'font-body'
        : undefined

  return (
    <p
      className={cn(
        'text-text-secondary',
        variantClasses[variant],
        italic && 'italic',
        fontClass,
        className,
      )}
    >
      {children}
    </p>
  )
}
