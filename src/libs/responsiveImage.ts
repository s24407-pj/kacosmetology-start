export const MOBILE_WIDTHS = [360, 720, 1080] as const
export const POSTER_WIDTHS = [360, 720] as const
export const GALLERY_WIDTHS = [360, 720, 1080, 1440] as const
export const VITRUVIAN_WIDTHS = [320, 640] as const

export function webpSrcSet(src: string, widths: readonly number[]): string {
  const base = src.replace(/\.webp$/, '')
  return widths.map((w) => `${base}-${w}.webp ${w}w`).join(', ')
}

export function webpFallbackSrc(src: string, width = 720): string {
  return src.replace(/\.webp$/, `-${width}.webp`)
}

export const IMAGE_SIZES = {
  hero: '(min-width: 810px) calc((min(100vw - 3rem, 80rem) - 3rem) / 2), min(100vw - 2rem, 28rem)',
  specializationHero: '100vw',
  specializationCard:
    '(min-width: 1024px) calc((min(100vw - 4rem, 72rem) - 2rem) / 3), calc(100vw - 2rem)',
  aboutPortrait:
    '(min-width: 810px) calc((min(100vw - 3rem, 72rem) - 3rem) / 2), min(100vw - 2rem, 72rem)',
  processPoster:
    '(min-width: 768px) calc((min(100vw - 3rem, 80rem) - 7.5rem) / 4), min(100vw - 2rem, 80rem)',
  effects: 'min(100vw - 2rem, 32rem)',
  gallery:
    '(min-width: 1024px) calc((min(100vw - 3rem, 85rem) - 1rem) / 2), (min-width: 768px) calc((min(100vw - 3rem, 85rem) - 2rem) / 3), calc(100vw - 2rem)',
  vitruvian: '320px',
} as const
