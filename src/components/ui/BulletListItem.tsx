import { cn } from '@libs/utils'
import type { ReactNode } from 'react'

interface BulletListItemProps {
  children: ReactNode
  color?: 'primary' | 'green' | 'blue' | 'red' | 'white'
  className?: string
}

export function BulletListItem({
  children,
  color = 'primary',
  className,
}: BulletListItemProps) {
  const colorClasses = {
    primary: 'bg-brand',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    white: 'bg-white/70',
  }

  return (
    <li className={cn('flex items-start gap-2 text-gray-700', className)}>
      <div
        className={cn(
          'w-1.5 h-1.5 rounded-full mt-2 shrink-0',
          colorClasses[color],
        )}
      />
      <span className="text-sm">{children}</span>
    </li>
  )
}
