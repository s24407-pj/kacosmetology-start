import App from '@app/App'
import { NotFoundPage } from '@app/page/NotFoundPage'
import { RenderTimeProvider } from '@context/RenderTimeProvider'
import { brand } from '@data/business'
import crimsonLatin400 from '@fontsource/crimson-text/latin-400.css?url'
import crimsonLatinExt400 from '@fontsource/crimson-text/latin-ext-400.css?url'
import playfairLatin700 from '@fontsource/playfair-display/latin-700.css?url'
import playfairLatinExt700 from '@fontsource/playfair-display/latin-ext-700.css?url'
import {
  PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY,
  resolveRenderTimeSnapshot,
} from '@libs/renderTime'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { createServerFn } from '@tanstack/react-start'
import appCss from '../app/styles/index.css?url'

const logoUrl = new URL(brand.logo.imagePath, brand.siteUrl).href

interface RootSearch {
  [PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY]?: string
}

const getRenderTimeSnapshot = createServerFn({ method: 'GET' })
  .validator(
    (requestedReferenceTime: string | undefined) => requestedReferenceTime,
  )
  .handler(({ data: requestedReferenceTime }) =>
    resolveRenderTimeSnapshot({
      now: new Date(),
      requestedReferenceTime,
      allowReferenceTime: process.env.PLAYWRIGHT_TEST_MODE === '1',
    }),
  )

export const Route = createRootRoute({
  validateSearch: (search: Record<string, unknown>): RootSearch => {
    const value = search[PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY]
    return typeof value === 'string'
      ? { [PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY]: value }
      : {}
  },
  loaderDeps: ({ search }) => ({
    requestedReferenceTime: search[PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY],
  }),
  loader: async ({ deps }) => ({
    renderTimeSnapshot: await getRenderTimeSnapshot({
      data: deps.requestedReferenceTime,
    }),
  }),
  component: RootApplication,
  notFoundComponent: NotFoundPage,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      { title: brand.name },
      { name: 'author', content: brand.name },
      { name: 'robots', content: 'index, follow' },
      { name: 'apple-mobile-web-app-title', content: brand.name },
      { name: 'theme-color', content: '#722F37' },
      { property: 'og:site_name', content: brand.name },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'pl_PL' },
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
    ],
  }),
  shellComponent: RootDocument,
})

function RootApplication() {
  const { renderTimeSnapshot } = Route.useLoaderData()
  return (
    <RenderTimeProvider snapshot={renderTimeSnapshot}>
      <App />
    </RenderTimeProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        {import.meta.env.DEV ? (
          <TanStackDevtools
            plugins={[
              {
                name: 'TanStack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        ) : null}
        <Scripts />
      </body>
    </html>
  )
}
