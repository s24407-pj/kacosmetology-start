import { cn } from '@libs/utils'

type ActionVariant = 'primary' | 'secondary' | 'outline' | 'inverse' | 'text'
type ActionSize = 'xs' | 'sm' | 'md' | 'lg'

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
    inverse: 'bg-white text-action hover:bg-surface-muted',
    text: 'text-action underline-offset-4 hover:underline',
  }
  const sizes: Record<ActionSize, string> = {
    xs: 'min-h-10 px-4 py-2 text-sm',
    sm: 'min-h-11 px-4 py-2 text-sm',
    md: 'min-h-12 px-6 py-3 text-base',
    lg: 'min-h-12 px-8 py-4 text-lg',
  }

  return cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-[transform,background-color,color,box-shadow] duration-200 ease-in-out hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 focus-visible:ring-offset-2',
    variants[variant],
    sizes[size],
    className,
  )
}

export function surfaceCardStyles({
  variant = 'raised',
  interactive = false,
  className,
}: {
  variant?: 'flat' | 'outlined' | 'raised'
  interactive?: boolean
  className?: string
} = {}) {
  const variants = {
    flat: 'bg-transparent',
    outlined: 'rounded-lg border border-border-default bg-surface',
    raised: 'rounded-lg bg-surface shadow-subtle',
  }

  return cn(
    variants[variant],
    interactive &&
      'transition-[transform,background-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:bg-surface-muted/40 hover:shadow-raised focus-within:-translate-y-1 focus-within:shadow-raised motion-reduce:transform-none motion-reduce:transition-none',
    className,
  )
}

export function iconActionStyles({
  tone = 'default',
  size = 'md',
  className,
}: {
  tone?: 'default' | 'inverse' | 'overlay'
  size?: 'sm' | 'md' | 'lg'
  className?: string
} = {}) {
  const tones = {
    default: 'text-text-secondary hover:bg-surface-muted hover:text-action',
    inverse: 'text-white/80 hover:bg-white/10 hover:text-white',
    overlay: 'bg-surface/90 text-text-primary hover:bg-surface',
  }
  const sizes = {
    sm: 'h-9 w-9',
    md: 'h-10 w-10',
    lg: 'h-11 w-11',
  }

  return cn(
    'inline-flex shrink-0 items-center justify-center rounded-md transition-[transform,background-color,color,box-shadow] duration-200 hover:scale-105 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 focus-visible:ring-offset-2',
    tones[tone],
    sizes[size],
    className,
  )
}
