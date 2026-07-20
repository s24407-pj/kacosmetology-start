# Blog authoring

Git-authored Markdown/MDX articles live in `src/content/blog/`. The filename
(without `.mdx`) is the public slug. Do not put `slug` in frontmatter.

## Create an article

1. Copy `src/content/blog/_templates/article.mdx` to
   `src/content/blog/<slug-artykulu>.mdx`.
2. Fill required frontmatter.
3. Write Markdown body starting at `h2` (page `h1` comes from the route).
4. Keep `status: draft` until ready.
5. Run generation and validation (below).

## Required frontmatter

- `title`
- `excerpt`
- `publishedAt` (`YYYY-MM-DD`)
- `status`: `draft` | `published`
- `category`: `{ slug, label }`
- `tags`: array (may be empty) of `{ slug, label }`

Optional: `updatedAt`, `coverImage` (`src`, `alt`), `seo` (`title`, `description`).

## Rules

- Taxonomy **slugs** are stable IDs; labels are presentation text. The same slug
  must not use conflicting labels across articles.
- Cover images only: `coverImage.src` must be under
  `/images/blog/<article-slug>/`. No remote URLs. No images in the Markdown body.
- Bodies are Markdown-only: no imports, exports, JSX, JavaScript expressions or
  raw HTML (`src/libs/blogMdxPolicy.ts` enforces this at generate and compile).
- `updatedAt`, when set, must be ≥ `publishedAt`.

## Draft, published and scheduled

- Drafts never appear in routes, sitemap or `llms.txt`.
- Publication eligibility is computed at **content generation** time:
  `status === published` and `publishedAt <= contentGeneratedAt` (UTC day).
- Future-dated published posts are **scheduled**. They become public only after
  you rerun `pnpm generate-blog-content` (and deploy) on/after `publishedAt`.

## Commands

```bash
pnpm generate-blog-content      # write src/data/blogPosts.generated.ts
pnpm check:blog-content         # drift check (no write)
pnpm generate-public-metadata   # sitemap / llms after public posts change
pnpm check
pnpm test
```

Do not edit `src/data/blogPosts.generated.ts` by hand.

## Common validation errors

- Missing required frontmatter fields
- Invalid ISO dates or `updatedAt` before `publishedAt`
- Forbidden MDX nodes (JSX, imports, body images)
- Duplicate article slug / duplicate tags / conflicting taxonomy labels
- Cover path outside `/images/blog/<slug>/`

## Publication checklist

1. Content reviewed; educational disclaimer kept where appropriate.
2. `status: published` and `publishedAt` set.
3. `pnpm generate-blog-content`
4. `pnpm generate-public-metadata`
5. `pnpm check` and focused tests / `pnpm run validate` for release.
