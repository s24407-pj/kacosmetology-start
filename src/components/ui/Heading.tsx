import { cn } from '@libs/utils'
import type { JSX, ReactNode } from 'react'

interface HeadingProps {
  level?: 1 | 2 | 3 | 4
  variant?: 'hero' | 'page' | 'section' | 'content' | 'card' | 'utility'
  tone?: 'default' | 'accent' | 'inverse'
  className?: string
  children: ReactNode
}

export function Heading({
  level = 2,
  variant,
  tone = 'default',
  className,
  children,
}: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements

  const defaultVariants = {
    1: 'page',
    2: 'section',
    3: 'content',
    4: 'card',
  } as const
  const variantClasses = {
    hero: 'text-5xl leading-tight md:text-7xl',
    page: 'text-4xl leading-tight sm:text-5xl md:text-6xl',
    section: 'text-3xl leading-tight sm:text-4xl md:text-5xl',
    content: 'text-2xl leading-snug md:text-3xl',
    card: 'text-xl leading-snug sm:text-2xl',
    utility: 'text-lg leading-snug',
  }
  const toneClasses = {
    default: 'text-text-primary',
    accent: 'text-action',
    inverse: 'text-white',
  }

  const baseClasses = cn(
    'font-display font-bold',
    variantClasses[variant ?? defaultVariants[level]],
    toneClasses[tone],
    className,
  )

  return <Tag className={baseClasses}>{children}</Tag>
}
