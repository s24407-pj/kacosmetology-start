import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { businessProfile } from '@data/business'
import { getPublicServicePath, services } from '@data/services'
import { afterEach, describe, expect, it } from 'vitest'
import {
  getSitemapPaths,
  PUBLIC_METADATA_PATHS,
  renderLlmsTxt,
  renderPublicMetadata,
  renderRobotsTxt,
  renderSitemapXml,
  renderSiteWebManifest,
  syncPublicMetadata,
} from './publicMetadata'

const temporaryDirectories: string[] = []
afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true })),
  )
})

describe('public metadata renderers', () => {
  it('matches the committed llms file byte for byte', async () => {
    const committed = await readFile(
      join(process.cwd(), PUBLIC_METADATA_PATHS.llms),
      'utf8',
    )
    expect(renderLlmsTxt(businessProfile)).toBe(committed)
  })

  it('uses and escapes only the canonical practitioner genitive form', () => {
    const original = renderLlmsTxt(businessProfile)
    const changedGenitive = renderLlmsTxt({
      ...businessProfile,
      brand: {
        ...businessProfile.brand,
        practitionerNameGenitive: 'Test [Case]',
      },
    })
    expect(changedGenitive).toBe(
      original.replace('Katarzyny Suwalskiej', 'Test \\[Case\\]'),
    )

    expect(
      renderLlmsTxt({
        ...businessProfile,
        brand: {
          ...businessProfile.brand,
          practitionerName: 'Changed Nominative',
        },
      }),
    ).toBe(original)
  })

  it('uses and escapes the canonical locality locative form', () => {
    const original = renderLlmsTxt(businessProfile)
    const changedLocative = renderLlmsTxt({
      ...businessProfile,
      locations: [
        {
          ...businessProfile.locations[0],
          localityLocative: 'Test [Place]',
        },
      ],
    })

    expect(changedLocative).toBe(
      original.replace('Starogardzie Gdańskim', 'Test \\[Place\\]'),
    )
  })

  it('are deterministic and newline terminated', () => {
    const rendered = renderPublicMetadata(businessProfile)
    expect(rendered).toEqual(renderPublicMetadata(businessProfile))
    expect(Object.values(rendered).every((value) => value.endsWith('\n'))).toBe(
      true,
    )
    expect(JSON.parse(renderSiteWebManifest(businessProfile))).toMatchObject({
      name: businessProfile.brand.name,
      short_name: businessProfile.brand.appShortName,
    })
  })

  it('publishes fixed index routes and every published service detail', () => {
    const fixedRoutes = [
      '/',
      '/kosmetologia',
      '/oprawa-oka',
      '/trychologia',
      '/galeria',
      '/blog',
      '/blog/pielegnacja-anti-aging-po-50',
    ]
    const serviceRoutes = services
      .filter((service) => service.isPublished && service.hasDetailPage)
      .flatMap((service) => {
        const path = getPublicServicePath(service)
        return path ? [path] : []
      })

    expect(new Set(getSitemapPaths())).toEqual(
      new Set([...fixedRoutes, ...serviceRoutes]),
    )
    expect(getSitemapPaths()).not.toContain('/rezerwacja')
  })

  it('derives origins and escapes XML and Markdown input', () => {
    const profile = {
      ...businessProfile,
      brand: {
        ...businessProfile.brand,
        name: 'A [B]',
        siteUrl: 'https://example.com/subpath/' as const,
      },
    }
    expect(renderLlmsTxt(profile)).toContain('# A \\[B\\]')
    expect(renderRobotsTxt(profile)).toContain(
      'https://example.com/subpath/sitemap.xml',
    )
    expect(renderSitemapXml(profile)).toContain('https://example.com/')
  })

  it('omits optional Facebook from llms output', () => {
    const profile = {
      ...businessProfile,
      brand: {
        ...businessProfile.brand,
        socialMedia: {
          instagram: businessProfile.brand.socialMedia.instagram,
        },
      },
    }
    expect(renderLlmsTxt(profile)).not.toContain('[Facebook]')
  })

  it('checks without writing and atomically writes only stale files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'public-metadata-'))
    temporaryDirectories.push(root)
    const path = PUBLIC_METADATA_PATHS.robots
    const absolutePath = join(root, path)
    await writeFile(absolutePath, 'stale', { flag: 'w' }).catch(async () => {
      await mkdir(join(root, 'public'), { recursive: true })
      await writeFile(absolutePath, 'stale')
    })
    const rendered = { [path]: 'fresh\n' }
    expect(await syncPublicMetadata({ root, rendered, check: true })).toEqual([
      path,
    ])
    expect(await readFile(absolutePath, 'utf8')).toBe('stale')
    expect(await syncPublicMetadata({ root, rendered, check: false })).toEqual([
      path,
    ])
    expect(await readFile(absolutePath, 'utf8')).toBe('fresh\n')
    expect(await syncPublicMetadata({ root, rendered, check: false })).toEqual(
      [],
    )
  })

  it('propagates EISDIR read failures', async () => {
    const root = await mkdtemp(join(tmpdir(), 'public-metadata-'))
    temporaryDirectories.push(root)
    const path = PUBLIC_METADATA_PATHS.robots
    await mkdir(join(root, path), { recursive: true })

    await expect(
      syncPublicMetadata({
        root,
        rendered: { [path]: 'fresh\n' },
        check: true,
      }),
    ).rejects.toMatchObject({ code: 'EISDIR' })
  })
})
