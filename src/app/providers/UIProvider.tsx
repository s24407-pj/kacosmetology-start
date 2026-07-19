import { useReducedMotion } from '@hooks/useReducedMotion'
import { type PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { UIContext } from './UIContext'

export const UIProvider = ({ children }: PropsWithChildren) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      setShowScrollToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (reducedMotion) return

    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            entry.target.classList.remove('reveal-pending')
            animationObserver.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '-50px 0px' },
    )

    const observeAnimatedElements = () => {
      document.querySelectorAll('[data-reveal-on-scroll]').forEach((el) => {
        if (el.classList.contains('is-revealed')) return
        el.classList.add('reveal-pending')
        animationObserver.observe(el)
      })
    }

    observeAnimatedElements()

    // Re-observe intentionally marked elements from lazy-loaded sections.
    const mutationObserver = new MutationObserver((mutations) => {
      let hasNewNodes = false
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          hasNewNodes = true
          break
        }
      }
      if (hasNewNodes) {
        observeAnimatedElements()
      }
    })

    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      animationObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [reducedMotion])

  const value = useMemo(
    () => ({
      isMenuOpen,
      setIsMenuOpen,
      scrolled,
      showScrollToTop,
    }),
    [isMenuOpen, scrolled, showScrollToTop],
  )

  return <UIContext value={value}>{children}</UIContext>
}
