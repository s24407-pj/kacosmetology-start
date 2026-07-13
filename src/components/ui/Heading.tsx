import { cn } from '@libs/utils'
import type { JSX, ReactNode } from 'react'

interface HeadingProps {
  level?: 1 | 2 | 3 | 4
  gradient?: boolean
  className?: string
  children: ReactNode
}

export function Heading({
  level = 2,
  gradient = false,
  className,
  children,
}: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements

  const sizeClasses = {
    1: 'text-4xl md:text-6xl',
    2: 'text-3xl md:text-5xl',
    3: 'text-2xl md:text-3xl',
    4: 'text-xl md:text-2xl',
  }

  const baseClasses = cn(
    'font-bold',
    sizeClasses[level],
    gradient ? 'text-action' : 'text-text-primary',
    className,
    'font-display',
  )

  return <Tag className={baseClasses}>{children}</Tag>
}
