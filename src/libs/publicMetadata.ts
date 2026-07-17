import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import type { BusinessProfile } from '@app-types/types'

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
    `- [Booksy — umów wizytę](${location.bookingUrl}): Rezerwacja wizyt online 24/7`,
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

Jednostronicowa witryna gabinetu ${markdownEscape(brand.practitionerNameGenitive)} (magister kosmetologii). Poniższe linki prowadzą do sekcji na stronie głównej.

## Strona

- [Start](${root}): Strona główna gabinetu
- [O mnie](${new URL('#o-mnie', root).href}): Podejście holistyczne i doświadczenie
- [Zabiegi](${new URL('#zabiegi', root).href}): Katalog zabiegów z cenami i opisami
- [Efekty](${new URL('#efekty', root).href}): Galeria efektów przed i po
- [Galeria](${new URL('#galeria', root).href}): Zdjęcia gabinetu
- [Opinie](${new URL('#opinie', root).href}): Opinie klientek
- [Kontakt](${new URL('#kontakt', root).href}): Telefon, e-mail, adres, godziny otwarcia

## Rezerwacja

${links.join('\n')}
`
}

export const renderRobotsTxt = (profile: BusinessProfile) =>
  `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap.xml', profile.brand.siteUrl).href}\n`

export const renderSitemapXml = (profile: BusinessProfile) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${xmlEscape(new URL('/', profile.brand.siteUrl).href)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`

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
    const actual = await readFile(absolutePath, 'utf8').catch(() => null)
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
