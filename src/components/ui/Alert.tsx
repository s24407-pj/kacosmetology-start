import { cn } from '@libs/utils'
import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'

interface AlertProps {
  children: ReactNode
  title?: ReactNode
  variant?: 'info' | 'warning' | 'error' | 'success'
  className?: string
}

export function Alert({
  children,
  title,
  variant = 'info',
  className,
}: AlertProps) {
  const variantClasses = {
    info: 'bg-blue-50 border-info-500 text-blue-900',
    warning: 'bg-yellow-50 border-warning-500 text-yellow-900',
    error: 'bg-red-50 border-danger-500 text-red-900',
    success: 'bg-green-50 border-success-500 text-green-900',
  }

  return (
    <div
      className={cn(
        'border-l-4 p-4 rounded-md',
        variantClasses[variant],
        className,
      )}
      role="alert"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="text-sm leading-relaxed">
          {title ? (
            <h3 className="font-semibold text-current">{title}</h3>
          ) : null}
          <div className={cn(title && 'mt-2')}>{children}</div>
        </div>
      </div>
    </div>
  )
}
