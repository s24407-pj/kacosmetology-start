import { cn } from '@libs/utils'

type ActionVariant = 'primary' | 'secondary' | 'outline' | 'text'
type ActionSize = 'sm' | 'md' | 'lg'

export function actionLinkStyles({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ActionVariant
  size?: ActionSize
  className?: string
} = {}) {
  const variants: Record<ActionVariant, string> = {
    primary: 'border border-action bg-action text-white hover:bg-action-hover',
    secondary:
      'border border-border-default bg-surface text-action hover:bg-surface-strong',
    outline:
      'border border-action bg-transparent text-action hover:bg-action hover:text-white',
    text: 'text-action underline-offset-4 hover:underline',
  }
  const sizes: Record<ActionSize, string> = {
    sm: 'min-h-11 px-4 py-2 text-sm',
    md: 'min-h-12 px-6 py-3 text-base',
    lg: 'min-h-12 px-8 py-4 text-lg',
  }

  return cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 focus-visible:ring-offset-2',
    variants[variant],
    sizes[size],
    className,
  )
}

export function surfaceCardStyles({
  interactive = false,
  className,
}: {
  interactive?: boolean
  className?: string
} = {}) {
  return cn(
    'rounded-lg border border-border-default bg-surface shadow-subtle',
    interactive &&
      'transition-[border-color,background-color] duration-200 hover:border-action/50 hover:bg-surface-muted/40 focus-within:border-action/50',
    className,
  )
}
