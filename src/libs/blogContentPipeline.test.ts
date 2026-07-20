import type { BlogPostMetadata } from '@app-types/blog'
import { describe, expect, it } from 'vitest'
import {
  buildBlogManifest,
  isPublicAtGeneration,
  renderBlogPostsGeneratedModule,
  sortBlogPostsDeterministically,
} from './blogContentPipeline'

const validSource = ({
  fileExtras = '',
  body = `## Nagłówek

Akapit testowy z [linkiem](/blog).
`,
}: {
  fileExtras?: string
  body?: string
} = {}) => `---
title: "Tytuł testowy"
excerpt: "Opis testowy artykułu."
publishedAt: "2026-01-10"
status: "published"
category:
  slug: "pielegnacja-skory"
  label: "Pielęgnacja skóry"
tags:
  - slug: "bariera"
    label: "Bariera"
${fileExtras}---

${body}`

describe('blogContentPipeline', () => {
  it('builds a public published post when publishedAt is on or before generation day', async () => {
    const { payload, errors } = await buildBlogManifest({
      files: [{ fileName: 'artykul-a.mdx', source: validSource() }],
      contentGeneratedAt: '2026-01-15T12:00:00.000Z',
    })
    expect(errors).toEqual([])
    expect(payload.posts).toHaveLength(1)
    expect(payload.posts[0]?.isPublic).toBe(true)
    expect(payload.posts[0]?.slug).toBe('artykul-a')
  })

  it('marks future-dated published posts as scheduled (not public)', async () => {
    const { payload, errors } = await buildBlogManifest({
      files: [
        {
          fileName: 'zaplanowany.mdx',
          source: validSource({
            fileExtras: 'publishedAt: "2026-08-01"\n',
          }).replace('publishedAt: "2026-01-10"\n', ''),
        },
      ],
      contentGeneratedAt: '2026-07-20T12:00:00.000Z',
    })
    expect(errors).toEqual([])
    expect(payload.posts[0]?.status).toBe('published')
    expect(payload.posts[0]?.isPublic).toBe(false)
  })

  it('rejects missing required fields and body images', async () => {
    const { errors } = await buildBlogManifest({
      files: [
        {
          fileName: 'zly.mdx',
          source: `---
title: "Bez reszty"
---

## Nagłówek

![alt](/images/blog/zly/cover.webp)
`,
        },
      ],
      contentGeneratedAt: '2026-07-20T12:00:00.000Z',
    })
    expect(errors.some((error) => error.includes('excerpt'))).toBe(true)
    expect(errors.some((error) => /image|Blog MDX policy/.test(error))).toBe(
      true,
    )
  })

  it('rejects updatedAt before publishedAt', async () => {
    const { errors } = await buildBlogManifest({
      files: [
        {
          fileName: 'daty.mdx',
          source: validSource({ fileExtras: 'updatedAt: "2026-01-01"\n' }),
        },
      ],
      contentGeneratedAt: '2026-07-20T12:00:00.000Z',
    })
    expect(errors.some((error) => error.includes('updatedAt'))).toBe(true)
  })

  it('rejects conflicting taxonomy labels and duplicate slugs', async () => {
    const { errors } = await buildBlogManifest({
      files: [
        {
          fileName: 'jeden.mdx',
          source: validSource(),
        },
        {
          fileName: 'jeden.mdx',
          source: validSource(),
        },
        {
          fileName: 'dwa.mdx',
          source: `---
title: "Inny"
excerpt: "Opis"
publishedAt: "2026-01-11"
status: "published"
category:
  slug: "pielegnacja-skory"
  label: "Inna etykieta"
tags: []
---

## Nagłówek

Tekst.
`,
        },
      ],
      contentGeneratedAt: '2026-07-20T12:00:00.000Z',
    })
    expect(errors.some((error) => error.includes('Duplicate'))).toBe(true)
    expect(errors.some((error) => error.includes('Conflicting category'))).toBe(
      true,
    )
  })

  it('rejects invalid cover paths', async () => {
    const { errors } = await buildBlogManifest({
      files: [
        {
          fileName: 'okladka.mdx',
          source: validSource({
            fileExtras: `coverImage:
  src: "https://example.com/x.webp"
  alt: "Alt"
`,
          }),
        },
      ],
      contentGeneratedAt: '2026-07-20T12:00:00.000Z',
    })
    expect(errors.some((error) => error.includes('Remote'))).toBe(true)
  })

  it('rejects invalid status, filename slug, frontmatter slug and duplicate tags', async () => {
    const invalidStatus = await buildBlogManifest({
      files: [
        {
          fileName: 'status.mdx',
          source: validSource().replace(
            'status: "published"',
            'status: "preview"',
          ),
        },
      ],
      contentGeneratedAt: '2026-07-20T12:00:00.000Z',
    })
    expect(invalidStatus.errors.some((error) => error.includes('status'))).toBe(
      true,
    )

    const badName = await buildBlogManifest({
      files: [
        {
          fileName: 'Bad_Slug.mdx',
          source: validSource(),
        },
      ],
      contentGeneratedAt: '2026-07-20T12:00:00.000Z',
    })
    expect(badName.errors.some((error) => error.includes('invalid slug'))).toBe(
      true,
    )

    const withSlug = await buildBlogManifest({
      files: [
        {
          fileName: 'with-slug.mdx',
          source: validSource({ fileExtras: 'slug: "with-slug"\n' }),
        },
      ],
      contentGeneratedAt: '2026-07-20T12:00:00.000Z',
    })
    expect(
      withSlug.errors.some((error) => error.includes('do not set "slug"')),
    ).toBe(true)

    const duplicateTags = await buildBlogManifest({
      files: [
        {
          fileName: 'dup-tag.mdx',
          source: `---
title: "Tytuł"
excerpt: "Opis"
publishedAt: "2026-01-10"
status: "published"
category:
  slug: "pielegnacja-skory"
  label: "Pielęgnacja skóry"
tags:
  - slug: "bariera"
    label: "Bariera"
  - slug: "bariera"
    label: "Bariera"
---

## Nagłówek

Tekst.
`,
        },
      ],
      contentGeneratedAt: '2026-07-20T12:00:00.000Z',
    })
    expect(
      duplicateTags.errors.some((error) => error.includes('Duplicate tag')),
    ).toBe(true)
  })

  it('rejects cover paths outside the article directory and missing alt', async () => {
    const wrongDir = await buildBlogManifest({
      files: [
        {
          fileName: 'okladka.mdx',
          source: validSource({
            fileExtras: `coverImage:
  src: "/images/blog/inny/cover.webp"
  alt: "Alt"
`,
          }),
        },
      ],
      contentGeneratedAt: '2026-07-20T12:00:00.000Z',
    })
    expect(
      wrongDir.errors.some((error) => error.includes('must start with')),
    ).toBe(true)

    const missingAlt = await buildBlogManifest({
      files: [
        {
          fileName: 'okladka.mdx',
          source: validSource({
            fileExtras: `coverImage:
  src: "/images/blog/okladka/cover.webp"
`,
          }),
        },
      ],
      contentGeneratedAt: '2026-07-20T12:00:00.000Z',
    })
    expect(
      missingAlt.errors.some((error) => error.includes('coverImage.alt')),
    ).toBe(true)
  })

  it('accepts a valid local cover image', async () => {
    const { payload, errors } = await buildBlogManifest({
      files: [
        {
          fileName: 'okladka.mdx',
          source: validSource({
            fileExtras: `coverImage:
  src: "/images/blog/okladka/cover.webp"
  alt: "Opis okładki"
`,
          }),
        },
      ],
      contentGeneratedAt: '2026-07-20T12:00:00.000Z',
    })
    expect(errors).toEqual([])
    expect(payload.posts[0]?.coverImage).toEqual({
      src: '/images/blog/okladka/cover.webp',
      alt: 'Opis okładki',
    })
  })

  it('sorts deterministically and renders a stable module', async () => {
    const posts: BlogPostMetadata[] = [
      {
        slug: 'b',
        title: 'B',
        excerpt: 'e',
        publishedAt: '2026-01-10',
        status: 'published',
        isPublic: true,
        category: { slug: 'c', label: 'C' },
        tags: [],
      },
      {
        slug: 'a',
        title: 'A',
        excerpt: 'e',
        publishedAt: '2026-01-10',
        status: 'published',
        isPublic: true,
        category: { slug: 'c', label: 'C' },
        tags: [],
      },
    ]
    expect(
      sortBlogPostsDeterministically(posts).map((post) => post.slug),
    ).toEqual(['a', 'b'])
    const rendered = renderBlogPostsGeneratedModule({
      contentGeneratedAt: '2026-07-20T00:00:00.000Z',
      posts: sortBlogPostsDeterministically(posts),
    })
    expect(rendered).toContain('AUTO-GENERATED')
    expect(rendered).toContain('blogContentGeneratedAt')
    expect(
      renderBlogPostsGeneratedModule({
        contentGeneratedAt: '2026-07-20T00:00:00.000Z',
        posts: sortBlogPostsDeterministically(posts),
      }),
    ).toBe(rendered)
  })

  it('rejects conflicting tag labels across articles', async () => {
    const { errors } = await buildBlogManifest({
      files: [
        {
          fileName: 'jeden.mdx',
          source: validSource(),
        },
        {
          fileName: 'dwa.mdx',
          source: `---
title: "Inny"
excerpt: "Opis"
publishedAt: "2026-01-11"
status: "draft"
category:
  slug: "inna"
  label: "Inna"
tags:
  - slug: "bariera"
    label: "Inna bariera"
---

## Nagłówek

Tekst.
`,
        },
      ],
      contentGeneratedAt: '2026-07-20T12:00:00.000Z',
    })
    expect(errors.some((error) => error.includes('Conflicting tag'))).toBe(true)
  })

  it('rejects raw HTML in the body', async () => {
    const { errors } = await buildBlogManifest({
      files: [
        {
          fileName: 'html.mdx',
          source: validSource({
            body: `## Nagłówek

<div>nie</div>
`,
          }),
        },
      ],
      contentGeneratedAt: '2026-07-20T12:00:00.000Z',
    })
    expect(errors.some((error) => /mdxJsx|Blog MDX policy/.test(error))).toBe(
      true,
    )
  })

  it('rejects path traversal in cover images and missing tags field', async () => {
    const traversal = await buildBlogManifest({
      files: [
        {
          fileName: 'okladka.mdx',
          source: validSource({
            fileExtras: `coverImage:
  src: "/images/blog/okladka/../secret/cover.webp"
  alt: "Alt"
`,
          }),
        },
      ],
      contentGeneratedAt: '2026-07-20T12:00:00.000Z',
    })
    expect(traversal.errors.some((error) => error.includes('Unsafe'))).toBe(
      true,
    )

    const missingTags = await buildBlogManifest({
      files: [
        {
          fileName: 'bez-tagow.mdx',
          source: `---
title: "Tytuł"
excerpt: "Opis"
publishedAt: "2026-01-10"
status: "published"
category:
  slug: "pielegnacja-skory"
  label: "Pielęgnacja skóry"
---

## Nagłówek

Tekst.
`,
        },
      ],
      contentGeneratedAt: '2026-07-20T12:00:00.000Z',
    })
    expect(missingTags.errors.some((error) => error.includes('tags'))).toBe(
      true,
    )
  })

  it('computes publication eligibility from generation time only', () => {
    expect(
      isPublicAtGeneration({
        status: 'draft',
        publishedAt: '2020-01-01',
        contentGeneratedAt: '2026-07-20T00:00:00.000Z',
      }),
    ).toBe(false)
    expect(
      isPublicAtGeneration({
        status: 'published',
        publishedAt: '2026-07-20',
        contentGeneratedAt: '2026-07-20T23:59:59.000Z',
      }),
    ).toBe(true)
  })
})
