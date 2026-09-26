import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

export function useCountUp(
  target: number,
  duration = 1500,
  decimals = 0,
): [React.RefObject<HTMLElement | null>, string] {
  const ref = useRef<HTMLElement | null>(null)
  const finalValue = target.toFixed(decimals)
  const reducedMotion = useReducedMotion()
  const [value, setValue] = useState(finalValue)

  useEffect(() => {
    if (reducedMotion) {
      setValue(finalValue)
      return
    }

    const el = ref.current
    if (!el) return

    let frameId: number | undefined
    let measured = false

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return

        // Counters already on screen keep the server-rendered value; only
        // off-screen counters are reset, so the reset is never visible.
        if (!measured) {
          measured = true
          if (entry.isIntersecting) {
            observer.disconnect()
            setValue(finalValue)
            return
          }
          setValue((0).toFixed(decimals))
          return
        }

        if (!entry.isIntersecting) return
        observer.disconnect()

        const startTime = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1)
          // ease-out cubic
          const eased = 1 - (1 - progress) ** 3
          setValue((eased * target).toFixed(decimals))
          if (progress < 1) frameId = requestAnimationFrame(tick)
        }
        frameId = requestAnimationFrame(tick)
      },
      { threshold: 0.3 },
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (frameId !== undefined) cancelAnimationFrame(frameId)
    }
  }, [target, duration, decimals, finalValue, reducedMotion])

  return [ref, value]
}
