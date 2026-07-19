import type { AboutVideo as AboutVideoData } from '@app-types/types'
import { surfaceCardStyles } from '@components/ui'
import { useReducedMotion } from '@hooks/useReducedMotion'
import {
  IMAGE_SIZES,
  POSTER_WIDTHS,
  webpFallbackSrc,
  webpSrcSet,
} from '@libs/responsiveImage'
import { cn } from '@libs/utils'
import { useEffect, useRef, useState } from 'react'

type AboutVideoProps = {
  video: AboutVideoData
  variant?: 'standalone' | 'embedded'
  active?: boolean
  loop?: boolean
  onEnded?: () => void
}

export default function AboutVideo({
  video,
  variant = 'standalone',
  active = true,
  loop = true,
  onEnded,
}: AboutVideoProps) {
  const isEmbedded = variant === 'embedded'
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isVisibleRef = useRef(false)
  const reducedMotion = useReducedMotion()
  const [isVisible, setIsVisible] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [playingVideoKey, setPlayingVideoKey] = useState<string | null>(null)
  const [prevActive, setPrevActive] = useState(active)

  if (prevActive !== active) {
    setPrevActive(active)
    if (!active) {
      setPlayingVideoKey(null)
    }
  }

  if (active && isVisible && !shouldLoad) {
    setShouldLoad(true)
  }

  useEffect(() => {
    if (reducedMotion) return

    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return

        isVisibleRef.current = entry.isIntersecting
        setIsVisible(entry.isIntersecting)

        if (entry.isIntersecting && active) {
          setShouldLoad(true)
        }

        const element = videoRef.current
        if (!element) return

        if (entry.isIntersecting && active) {
          const playPromise = element.play()
          if (playPromise !== undefined) {
            void playPromise.catch(() => {})
          }
        } else {
          element.pause()
        }
      },
      { rootMargin: '100px', threshold: 0.25 },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [active, reducedMotion])

  useEffect(() => {
    const element = videoRef.current
    if (!element || reducedMotion) return

    if (!active) {
      element.pause()
      return
    }

    if (shouldLoad && isVisibleRef.current) {
      const playPromise = element.play()
      if (playPromise !== undefined) {
        void playPromise.catch(() => {})
      }
    }
  }, [active, shouldLoad, reducedMotion])

  const posterSrc = webpFallbackSrc(video.poster, 720)
  const posterSrcSet = webpSrcSet(video.poster, POSTER_WIDTHS)
  const videoKey = `${video.sources.webm}|${video.sources.mp4}`
  const keepVideoMounted = !reducedMotion && (isEmbedded || active)
  const isPlaying = active && playingVideoKey === videoKey
  const posterVisible = !isPlaying

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        isEmbedded ? 'h-full w-full' : surfaceCardStyles(),
      )}
    >
      <div
        ref={containerRef}
        className="relative aspect-4/5 overflow-hidden bg-surface-strong"
      >
        {keepVideoMounted ? (
          <>
            <video
              ref={videoRef}
              muted
              loop={loop}
              playsInline
              preload={shouldLoad ? 'auto' : 'none'}
              aria-label={video.alt}
              aria-hidden={isEmbedded && !active ? true : undefined}
              onPlaying={() => {
                if (active) setPlayingVideoKey(videoKey)
              }}
              onEnded={onEnded}
              className="absolute inset-0 h-full w-full object-cover object-center"
            >
              {shouldLoad && (
                <>
                  <source src={video.sources.webm} type="video/webm" />
                  <source src={video.sources.mp4} type="video/mp4" />
                </>
              )}
            </video>
            <img
              src={posterSrc}
              srcSet={posterSrcSet}
              sizes={IMAGE_SIZES.processPoster}
              alt={reducedMotion ? video.alt : ''}
              aria-hidden={!reducedMotion}
              className={cn(
                'absolute inset-0 z-10 h-full w-full object-cover object-center',
                posterVisible ? 'opacity-100' : 'opacity-0',
                active && !posterVisible
                  ? 'motion-safe:transition-opacity motion-safe:duration-300 motion-reduce:transition-none'
                  : 'transition-none',
              )}
              loading="lazy"
            />
          </>
        ) : (
          <img
            src={posterSrc}
            srcSet={posterSrcSet}
            sizes={IMAGE_SIZES.processPoster}
            alt={video.alt}
            className="h-full w-full object-cover object-center"
            loading="lazy"
          />
        )}
      </div>
      {!isEmbedded && (
        <div className="pointer-events-none absolute inset-0 bg-black/10" />
      )}
    </div>
  )
}
