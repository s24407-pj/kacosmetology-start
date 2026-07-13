import { useEffect, useRef, useState } from 'react'

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function useCountUp(
  target: number,
  duration = 1500,
  decimals = 0,
): [React.RefObject<HTMLElement | null>, string] {
  const ref = useRef<HTMLElement | null>(null)
  const finalValue = target.toFixed(decimals)
  const [value, setValue] = useState(() =>
    prefersReducedMotion()
      ? finalValue
      : '0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : ''),
  )
  const started = useRef(false)

  useEffect(() => {
    if (prefersReducedMotion()) return

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        observer.disconnect()

        const startTime = performance.now()

        const tick = (now: number) => {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          // ease-out cubic
          const eased = 1 - (1 - progress) ** 3
          setValue((eased * target).toFixed(decimals))
          if (progress < 1) requestAnimationFrame(tick)
        }

        requestAnimationFrame(tick)
      },
      { threshold: 0.3 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration, decimals])

  return [ref, value]
}
