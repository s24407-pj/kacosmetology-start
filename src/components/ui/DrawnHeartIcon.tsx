import { cn } from '@libs/utils'

export function DrawnHeartIcon({
  className,
  strokeWidth = 2,
}: {
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      className={cn('shrink-0', className)}
      viewBox="0 0 64 56"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="draw-heart-path"
        d="M32 50C27 44 8 32 8 18.5C8 10.5 13 6 19.5 6C25 6 29 9.5 32 14C35 9.5 39 6 44.5 6C51 6 56 10.5 56 18.5C56 32 37 44 32 50Z"
        pathLength="100"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
