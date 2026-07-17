import { contact } from '@data/contact'
import crimsonLatin400 from '@fontsource/crimson-text/latin-400.css?url'
import crimsonLatinExt400 from '@fontsource/crimson-text/latin-ext-400.css?url'
import playfairLatin700 from '@fontsource/playfair-display/latin-700.css?url'
import playfairLatinExt700 from '@fontsource/playfair-display/latin-ext-700.css?url'
import { toSchemaOrgOpeningHoursSpecifications } from '@libs/openingHours'
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import appCss from '../app/styles/index.css?url'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  '@id': 'https://kacosmetology.pl/#beautysalon',
  name: 'Ka.Cosmetology',
  image: 'https://kacosmetology.pl/images/logo.webp',
  url: 'https://kacosmetology.pl/',
  telephone: '+48 726 154 460',
  email: 'gabinet@kacosmetology.pl',
  priceRange: '30-550 PLN',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ul. Paderewskiego 11a',
    postalCode: '83-200',
    addressLocality: 'Starogard Gdański',
    addressCountry: 'PL',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 53.898941431338294,
    longitude: 18.595858632430925,
  },
  areaServed: {
    '@type': 'City',
    name: 'Starogard Gdański',
  },
  hasMap:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d146965.76001793574!2d18.595858632430925!3d53.898941431338294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47029ddcdf06e639%3A0x22e7786a8b623b1a!2sKa.Cosmetology%20Kosmetolog%20%7C%20Trycholog!5e0!3m2!1spl!2spl!4v1757628479347!5m2!1spl!2spl',
  openingHoursSpecification: toSchemaOrgOpeningHoursSpecifications(
    contact.openingSchedule,
  ),
  sameAs: [
    'https://kacosmetology.booksy.com',
    'https://www.instagram.com/ka.cosmetology',
    'https://www.facebook.com/profile.php?id=61579179969990',
  ],
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      {
        title:
          'Katarzyna Suwalska | Kosmetolog | Trycholog | Starogard Gdański',
      },
      {
        name: 'description',
        content:
          'Indywidualne terapie oparte na holistycznym podejściu – kosmetologia, trychologia i więcej. Praca z przyczyną, nie tylko z problemem. Zapisz się na konsultację.',
      },
      { name: 'author', content: 'Ka.Cosmetology' },
      { name: 'robots', content: 'index, follow' },
      { name: 'apple-mobile-web-app-title', content: 'Ka.Cosmetology' },
      { name: 'theme-color', content: '#722F37' },
      { property: 'og:site_name', content: 'Ka.Cosmetology' },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'pl_PL' },
      {
        property: 'og:title',
        content:
          'Katarzyna Suwalska | Kosmetolog i Trycholog w Starogardzie Gdańskim',
      },
      {
        property: 'og:description',
        content:
          'Indywidualne terapie oparte na holistycznym podejściu – kosmetologia, trychologia i więcej. Praca z przyczyną, nie tylko z problemem. Zapisz się na konsultację.',
      },
      { property: 'og:url', content: 'https://kacosmetology.pl/' },
      {
        property: 'og:image',
        content: 'https://kacosmetology.pl/images/logo.webp',
      },
      {
        property: 'og:image:alt',
        content: 'Logotyp Ka.Cosmetology – monogram w odcieniach burgundu',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'stylesheet', href: playfairLatin700 },
      { rel: 'stylesheet', href: playfairLatinExt700 },
      { rel: 'stylesheet', href: crimsonLatin400 },
      { rel: 'stylesheet', href: crimsonLatinExt400 },
      { rel: 'canonical', href: 'https://kacosmetology.pl/' },
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
