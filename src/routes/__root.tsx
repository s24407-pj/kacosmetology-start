import { brand, primarySalonLocation } from '@data/business'
import crimsonLatin400 from '@fontsource/crimson-text/latin-400.css?url'
import crimsonLatinExt400 from '@fontsource/crimson-text/latin-ext-400.css?url'
import playfairLatin700 from '@fontsource/playfair-display/latin-700.css?url'
import playfairLatinExt700 from '@fontsource/playfair-display/latin-ext-700.css?url'
import { toBeautySalonJsonLd } from '@libs/businessMetadata'
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import appCss from '../app/styles/index.css?url'

const structuredData = toBeautySalonJsonLd({
  brand,
  location: primarySalonLocation,
  priceRange: '30-550 PLN',
})

const canonicalUrl = new URL('/', brand.siteUrl).href
const logoUrl = new URL(brand.logo.imagePath, brand.siteUrl).href

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      {
        title: `${brand.practitionerName} | Kosmetolog | Trycholog | ${primarySalonLocation.address.locality}`,
      },
      {
        name: 'description',
        content:
          'Indywidualne terapie oparte na holistycznym podejściu – kosmetologia, trychologia i więcej. Praca z przyczyną, nie tylko z problemem. Zapisz się na konsultację.',
      },
      { name: 'author', content: brand.name },
      { name: 'robots', content: 'index, follow' },
      { name: 'apple-mobile-web-app-title', content: brand.name },
      { name: 'theme-color', content: '#722F37' },
      { property: 'og:site_name', content: brand.name },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'pl_PL' },
      {
        property: 'og:title',
        content: `${brand.practitionerName} | Kosmetolog i Trycholog w Starogardzie Gdańskim`,
      },
      {
        property: 'og:description',
        content:
          'Indywidualne terapie oparte na holistycznym podejściu – kosmetologia, trychologia i więcej. Praca z przyczyną, nie tylko z problemem. Zapisz się na konsultację.',
      },
      { property: 'og:url', content: canonicalUrl },
      {
        property: 'og:image',
        content: logoUrl,
      },
      {
        property: 'og:image:alt',
        content: brand.logo.imageAlt,
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'stylesheet', href: playfairLatin700 },
      { rel: 'stylesheet', href: playfairLatinExt700 },
      { rel: 'stylesheet', href: crimsonLatin400 },
      { rel: 'stylesheet', href: crimsonLatinExt400 },
      { rel: 'canonical', href: canonicalUrl },
      { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      { rel: 'manifest', href: '/site.webmanifest' },
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
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Static, controlled JSON-LD.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        {children}
        {import.meta.env.DEV ? (
          <TanStackRouterDevtools position="bottom-right" />
        ) : null}
        <Scripts />
      </body>
    </html>
  )
}
