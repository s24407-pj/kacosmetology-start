import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'

let pendingScrollObserver: MutationObserver | null = null

const cancelPendingScroll = () => {
  pendingScrollObserver?.disconnect()
  pendingScrollObserver = null
}

const scrollWhenMounted = (sectionId: string) => {
  const target = document.getElementById(sectionId)
  if (target) {
    cancelPendingScroll()
    return
  }

  cancelPendingScroll()
  pendingScrollObserver = new MutationObserver(() => {
    const deferredTarget = document.getElementById(sectionId)
    if (!deferredTarget) {
      return
    }

    cancelPendingScroll()
    deferredTarget.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
  pendingScrollObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })

  window.setTimeout(cancelPendingScroll, 10_000)
}

export function useSectionNavigation() {
  const navigate = useNavigate({ from: '/' })

  return useCallback(
    async (sectionId: string) => {
      await navigate({
        to: '/',
        hash: sectionId,
        replace: true,
        resetScroll: false,
        hashScrollIntoView: { behavior: 'smooth', block: 'start' },
      })
      scrollWhenMounted(sectionId)
    },
    [navigate],
  )
}
