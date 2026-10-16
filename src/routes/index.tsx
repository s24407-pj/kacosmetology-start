import HomePage from '@features/home/page/HomePage'
import { createRouteHead, homeRouteMetadata } from '@libs/routeMetadata'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  head: () => {
    const head = createRouteHead(homeRouteMetadata)
    return {
      ...head,
      links: [
        ...head.links,
        {
          rel: 'preload',
          as: 'image',
          type: 'image/webp',
          href: '/images/hero-360.webp',
          fetchPriority: 'high',
          imageSrcSet:
            '/images/hero-360.webp 360w, /images/hero-720.webp 720w, /images/hero-1080.webp 1080w',
          imageSizes:
            '(min-width: 810px) calc((min(100vw - 3rem, 80rem) - 3rem) / 2), min(100vw - 2rem, 28rem)',
        },
      ],
    }
  },
  component: HomePage,
})
