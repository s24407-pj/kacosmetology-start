import { cn } from '@libs/utils'
import type { ReactNode } from 'react'

interface EyebrowProps {
  children: ReactNode
  tone?: 'accent' | 'inverse'
  className?: string
}

export function Eyebrow({
  children,
  tone = 'accent',
  className,
}: EyebrowProps) {
  return (
    <span
      className={cn(
        'inline-block text-xs font-semibold uppercase tracking-[0.16em]',
        tone === 'accent' ? 'text-action' : 'text-white/80',
        className,
      )}
    >
      {children}
    </span>
  )
}
