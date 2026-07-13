import { SectionHeader } from '@components/ui'
import { ABOUT_SECTION } from '@data/about'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import AboutProcessStep from './AboutProcessStep'

const STAGGER_CLASSES = [
  'stagger-3',
  'stagger-4',
  'stagger-5',
  'stagger-6',
] as const

function ChevronRight() {
  return (
    <div
      className="flex shrink-0 items-center justify-center text-action"
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.2}
        stroke="currentColor"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m8.25 4.5 7.5 7.5-7.5 7.5"
        />
      </svg>
    </div>
  )
}

function ThreadConnector() {
  return (
    <div className="flex justify-center" aria-hidden="true">
      <svg
        width="60"
        height="72"
        viewBox="0 0 60 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 8 0 C 8 28, 52 20, 52 36 C 52 52, 8 44, 8 72"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          strokeLinecap="round"
          className="text-action/40"
        />
      </svg>
    </div>
  )
}

export default function AboutProcessTimeline() {
  const { processHeading, processSteps } = ABOUT_SECTION
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  const isAutoPlayRef = useRef(isAutoPlay)

  useEffect(() => {
    isAutoPlayRef.current = isAutoPlay
  }, [isAutoPlay])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const handleVideoEnded = useCallback(() => {
    if (reducedMotion || !isAutoPlayRef.current) return
    setActiveIndex((prev) => (prev + 1) % processSteps.length)
  }, [processSteps.length, reducedMotion])

  return (
    <div>
      <SectionHeader title={processHeading} eyebrow="Krok po kroku" gradient />

      <div
        role="tablist"
        aria-label={processHeading}
        className="hidden md:flex md:items-stretch md:gap-2"
        onMouseLeave={() => setIsAutoPlay(true)}
      >
        {processSteps.map((step, index) => (
          <Fragment key={step.step}>
            <div className="min-w-0 flex-1">
              <AboutProcessStep
                step={step}
                staggerClass={STAGGER_CLASSES[index] ?? 'stagger-3'}
                isActive={index === activeIndex}
                onActivate={() => {
                  setActiveIndex(index)
                  setIsAutoPlay(false)
                }}
                onVideoEnded={handleVideoEnded}
              />
            </div>
            {index < processSteps.length - 1 && <ChevronRight />}
          </Fragment>
        ))}
      </div>

      <ol className="md:hidden">
        {processSteps.map((step, index) => (
          <Fragment key={step.step}>
            <li>
              <AboutProcessStep
                step={step}
                staggerClass={STAGGER_CLASSES[index] ?? 'stagger-3'}
              />
            </li>
            {index < processSteps.length - 1 && <ThreadConnector />}
          </Fragment>
        ))}
      </ol>
    </div>
  )
}
