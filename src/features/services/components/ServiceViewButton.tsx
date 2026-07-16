import { cn } from '@libs/utils'
import type { ReactNode } from 'react'

interface ServiceViewButtonProps {
  active?: boolean
  onClick: () => void
  icon: ReactNode
  label: string
  className?: string
}

export function ServiceViewButton({
  active = false,
  onClick,
  icon,
  label,
  className,
}: ServiceViewButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex min-h-11 items-center px-4 py-2 border rounded-md text-sm font-semibold transition-colors duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40 focus-visible:ring-offset-2',
        active
          ? 'bg-action text-white border-action'
          : 'bg-surface text-text-primary border-border-default hover:border-action/40 hover:bg-surface-muted hover:text-action',
        className,
      )}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  )
}
