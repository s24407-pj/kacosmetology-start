import { prefersReducedMotion, REDUCED_MOTION_QUERY } from '@libs/reducedMotion'
import { useSyncExternalStore } from 'react'

export { prefersReducedMotion }

function subscribe(onChange: () => void) {
  const media = window.matchMedia?.(REDUCED_MOTION_QUERY)
  if (!media) return () => {}

  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

const getServerSnapshot = () => false

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    prefersReducedMotion,
    getServerSnapshot,
  )
}
