import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import type { BusinessProfile } from '@app-types/types'
import { getPublicServicePath, services } from '@data/services'

export const PUBLIC_METADATA_PATHS = {
  llms: 'public/llms.txt',
  robots: 'public/robots.txt',
  sitemap: 'public/sitemap.xml',
  manifest: 'public/site.webmanifest',
} as const

const xmlEscape = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const markdownEscape = (value: string) =>
  value.replaceAll('\\', '\\\\').replaceAll('[', '\\[').replaceAll(']', '\\]')

export const renderLlmsTxt = (profile: BusinessProfile) => {
  const { brand } = profile
  const location = profile.locations.find(
    ({ id }) => id === profile.primaryLocationId,
  )
  if (!location) throw new Error('Primary salon location is missing')
  const root = new URL('/', brand.siteUrl).href
  const links = [
    `- [Rezerwacja w Booksy](${location.bookingUrl}): Zewnętrzny system rezerwacji wizyt`,
    '',
    '## Optional',
    '',
    `- [Instagram](${brand.socialMedia.instagram}): Profil gabinetu w social media`,
    ...(brand.socialMedia.facebook
      ? [
          `- [Facebook](${brand.socialMedia.facebook}): Profil gabinetu w social media`,
        ]
      : []),
    `- [Mapa witryny](${new URL('sitemap.xml', root).href}): Plik sitemap.xml`,
  ]
  return `# ${markdownEscape(brand.name)}

> Gabinet kosmetologiczny i trychologiczny w ${markdownEscape(location.localityLocative)}. Holistyczne terapie skóry i włosów — indywidualna diagnoza i rezerwacja online.

Wielotrasowa witryna gabinetu ${markdownEscape(brand.practitionerNameGenitive)} (magister kosmetologii). Oferta jest podzielona na kosmetologię, oprawę oka i trychologię.

## Strona

- [Start](${root}): Strona główna gabinetu
- [O mnie](${new URL('#o-mnie', root).href}): Podejście holistyczne i doświadczenie
- [Kosmetologia](${new URL('kosmetologia', root).href}): Zabiegi i konsultacje kosmetologiczne
- [Oprawa oka](${new URL('oprawa-oka', root).href}): Stylizacja brwi i rzęs
- [Trychologia](${new URL('trychologia', root).href}): Konsultacje i zabiegi trychologiczne
- [Efekty](${new URL('galeria#efekty', root).href}): Galeria efektów przed i po
- [Galeria gabinetu](${new URL('galeria#gabinet', root).href}): Zdjęcia gabinetu
- [Opinie](${new URL('#opinie', root).href}): Opinie klientek
- [Kontakt](${new URL('#kontakt', root).href}): Telefon, e-mail, adres, godziny otwarcia

## Rezerwacja

${links.join('\n')}
`
}

export const renderRobotsTxt = (profile: BusinessProfile) =>
  `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap.xml', profile.brand.siteUrl).href}\n`

export const getSitemapPaths = () => [
  '/',
  '/kosmetologia',
  '/oprawa-oka',
  '/trychologia',
  '/galeria',
  ...services
    .filter((service) => service.isPublished && service.hasDetailPage)
    .flatMap((service) => {
      const path = getPublicServicePath(service)
      return path ? [path] : []
    }),
]

export const renderSitemapXml = (profile: BusinessProfile) => {
  const entries = getSitemapPaths()
    .map(
      (path, index) =>
        `  <url>\n    <loc>${xmlEscape(new URL(path, profile.brand.siteUrl).href)}</loc>\n    <changefreq>${index === 0 ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${index === 0 ? '1.0' : index < 5 ? '0.8' : '0.6'}</priority>\n  </url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}

export const renderSiteWebManifest = (profile: BusinessProfile) =>
  `${JSON.stringify(
    {
      name: profile.brand.name,
      short_name: profile.brand.appShortName,
      theme_color: '#722F37',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    null,
    2,
  )}\n`

export const renderPublicMetadata = (profile: BusinessProfile) => ({
  [PUBLIC_METADATA_PATHS.llms]: renderLlmsTxt(profile),
  [PUBLIC_METADATA_PATHS.robots]: renderRobotsTxt(profile),
  [PUBLIC_METADATA_PATHS.sitemap]: renderSitemapXml(profile),
  [PUBLIC_METADATA_PATHS.manifest]: renderSiteWebManifest(profile),
})

const readExistingFile = async (path: string) => {
  try {
    return await readFile(path, 'utf8')
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return null
    }
    throw error
  }
}

export const syncPublicMetadata = async ({
  root,
  rendered,
  check,
}: {
  root: string
  rendered: Readonly<Record<string, string>>
  check: boolean
}) => {
  const stalePaths: string[] = []
  for (const [relativePath, expected] of Object.entries(rendered)) {
    const absolutePath = join(root, relativePath)
    const actual = await readExistingFile(absolutePath)
    if (actual === expected) continue
    stalePaths.push(relative(root, absolutePath))
    if (check) continue
    await mkdir(dirname(absolutePath), { recursive: true })
    const temporaryPath = `${absolutePath}.tmp-${process.pid}`
    await writeFile(temporaryPath, expected)
    await rename(temporaryPath, absolutePath)
  }
  return stalePaths
}
