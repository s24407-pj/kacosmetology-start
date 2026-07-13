import { cn } from '@libs/utils'
import { ANIMATIONS } from '@theme/constants'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  href: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  href,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-action text-white hover:bg-action-hover border border-action',
    secondary:
      'bg-surface text-action hover:bg-surface-muted border border-border-default',
    outline:
      'bg-transparent border border-action text-action hover:bg-action hover:text-white',
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <a
      href={href}
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-md font-semibold',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 focus-visible:ring-offset-2',
        ANIMATIONS.transition,
        ANIMATIONS.shadow,
        ANIMATIONS.translateUp,
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </a>
  )
}
