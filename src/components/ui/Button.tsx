import { cn } from '@libs/utils'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { actionLinkStyles } from './styles'

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
  return (
    <a
      href={href}
      className={cn(
        actionLinkStyles({ variant, size }),
        'shadow-subtle',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  )
}
