import { type PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { UIContext } from './UIContext'

export const UIProvider = ({ children }: PropsWithChildren) => {
  const [activeSection, setActiveSection] = useState('hero')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showScrollToTop, setShowScrollToTop] = useState(false)

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.1 },
    )

    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-up')
            entry.target.classList.remove('opacity-0', 'translate-y-8')
          }
        })
      },
      { threshold: 0.1, rootMargin: '-50px 0px' },
    )

    const observeAnimatedElements = () => {
      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        animationObserver.observe(el)
      })
    }

    document.querySelectorAll('section[id]').forEach((el) => {
      sectionObserver.observe(el)
    })

    observeAnimatedElements()

    // Re-observe when lazy-loaded components add new .animate-on-scroll elements
    const mutationObserver = new MutationObserver((mutations) => {
      let hasNewNodes = false
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          hasNewNodes = true
          break
        }
      }
      if (hasNewNodes) {
        // Also pick up new sections for the section observer
        document.querySelectorAll('section[id]').forEach((el) => {
          sectionObserver.observe(el)
        })
        observeAnimatedElements()
      }
    })

    mutationObserver.observe(document.body, { childList: true, subtree: true })

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      setShowScrollToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      sectionObserver.disconnect()
      animationObserver.disconnect()
      mutationObserver.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // CTA sticky pojawia się przy tym samym progu co przycisk "wróć na górę" (300px)
  const showStickyBookCTA = showScrollToTop

  const value = useMemo(
    () => ({
      activeSection,
      setActiveSection,
      isMenuOpen,
      setIsMenuOpen,
      scrolled,
      showScrollToTop,
      showStickyBookCTA,
    }),
    [activeSection, isMenuOpen, scrolled, showScrollToTop, showStickyBookCTA],
  )

  return <UIContext value={value}>{children}</UIContext>
}
