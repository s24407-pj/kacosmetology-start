# Execution plan: Blog section

Status: **draft — awaiting decision on open questions before implementation**

This is a cross-cutting public surface: new routes, nav contracts, sitemap /
`llms.txt` generation, breadcrumbs, and SEO/JSON-LD. Per
[DESIGN.md](../DESIGN.md#cross-cutting-feature), implement only after the open
questions below are settled.

## Goal

Add a brochure-site blog: a listing page and per-post detail pages, authored as
compiled TypeScript in `src/data/` (same model as services/gallery). Polish UI
copy only. No CMS, MDX, or business API unless a separate plan explicitly
approves that architecture change.

## Non-goals (v1)

- Home-page hash section or deferred home mount for blog
- CMS, MDX, Markdown filesystem, or remote content API
- Comments, tags taxonomy UI, search, RSS, pagination beyond a simple full list
- Inventing post titles, bodies, or medical/marketing claims — stakeholders
  supply Polish content before merge to production-ready content

## Open questions (block implementation)

Public contracts — confirm before coding:

| # | Question | Recommendation |
| --- | --- | --- |
| 1 | Public path prefix | `/aktualnosci` (Polish, matches `/galeria`) **or** `/blog` (shorter, common). Prefer **`/aktualnosci`**. |
| 2 | Main nav | Add one item after Galeria. Label: **Aktualności**. |
| 3 | Bottom nav (5 slots) | **Do not replace** an existing tab in v1. Discover via main nav / listing links only. Revisit later if analytics shows demand. |
| 4 | Content shape | Structured blocks in TS (`paragraph` / `heading` / `list`), not raw HTML. |
| 5 | Seed posts | At least **one** real published post before shipping the nav item; otherwise ship routes behind “empty listing” only if product accepts that. |
| 6 | Analytics event names | Propose `Blog Listing View` and `Blog Post View` (props: `postId`, `postSlug`). Confirm before adding. |
| 7 | Related services | Optional `relatedServiceIds: ServiceId[]` on posts — include in v1 schema even if first posts leave it empty. |

Until these are answered, treat path strings, nav IDs, and analytics names as
tentative in the rest of this plan (examples use `/aktualnosci`).

## Policy owner

| Concern | Owner |
| --- | --- |
| Post identity, slug, publish flag, dates, body, related services | `src/data/blog.ts` |
| Integrity gate (unique IDs/slugs, slug shape, published rules) | `src/data/blogValidation.ts` |
| Path helpers / getters | same data module (mirror `services.ts`) |
| Document head composition | route files via `src/libs/routeMetadata.ts` |
| Sitemap / llms listing of blog URLs | `src/libs/publicMetadata.ts` |
| BlogPosting + breadcrumb JSON-LD | `src/libs/blogMetadata.ts` (new; keep `businessMetadata.ts` salon/service-focused) |
| Listing / detail UI | `src/features/blog/` |
| Nav labels / destinations | `src/data/navigation.ts` + nav ID / `PublicRoutePath` unions in `src/types/types.ts` |

Lower layers must not import feature presentation. Routes stay thin.

## Public interfaces

### Types (`src/types/types.ts`)

```ts
export type BlogPostId = `post-${string}`

export type BlogContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }

export interface BlogPost {
  id: BlogPostId
  slug: string
  title: string
  description: string // meta + listing excerpt
  publishedAt: string // ISO date YYYY-MM-DD
  updatedAt?: string
  isPublished: boolean
  heroImagePath?: string // under public/, optional v1
  content: BlogContentBlock[]
  relatedServiceIds: ServiceId[]
}

export type PublicRoutePath = /* existing */ | '/aktualnosci'
export type MainNavItemId = /* existing */ | 'aktualnosci'
```

Stable `BlogPostId` for keys, analytics, and validation — titles are
presentation only (same rule as `ServiceId`).

### Data API (`src/data/blog.ts`)

- `blogPosts: BlogPost[]` (source of truth)
- `getPublishedBlogPosts(): BlogPost[]` — published only, newest `publishedAt` first, tie-break lexical `id`
- `getBlogPostBySlug(slug: string): BlogPost | undefined`
- `getPublicBlogPath(post: BlogPost): `/aktualnosci/${string}` | null` — null when unpublished or missing slug
- `getPublicBlogListingPath(): '/aktualnosci'`

### Validation (`src/data/blogValidation.ts`)

Mirror `serviceValidation.ts`:

- Unique `id` and `slug`
- Slug `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- Non-empty title, description, content for published posts
- `relatedServiceIds` reference existing `ServiceId`s
- Production gate invoked from the same place services/promotions are validated (extend existing production config test entry if one exists)

### Routes (do not edit `src/routeTree.gen.ts` by hand)

| File | Role |
| --- | --- |
| `src/routes/aktualnosci/index.tsx` | Listing: `createRouteHead` + `BlogListingPage` |
| `src/routes/aktualnosci/$slug.tsx` | Loader → `loadBlogPost(slug)`; `notFound` if missing/unpublished; head from loader; `BlogPostPage` |

Pattern reference: `src/routes/galeria.tsx` (listing chrome),
`src/routes/kosmetologia/$slug.tsx` (loader / head / notFound).

### Feature UI

```text
src/features/blog/
  model/loadBlogPost.ts
  page/BlogListingPage.tsx
  page/BlogPostPage.tsx
  page/*.test.tsx
  components/BlogPostContent.tsx   # renders BlogContentBlock[]
```

**Listing:** `PageHero` (centered, medium) + chronological list of published
posts. Prefer border-led rows / text links (gallery/specialization language),
not card grids or hero overlays. One section job: discover posts.

**Detail:** `PageHero` + breadcrumbs + date meta + `BlogPostContent` in
`Section` / `max-w-4xl` with `border-t` content blocks (service-detail pattern).
Optional related-service text links. Reveal-on-scroll attributes already used
site-wide.

**Breadcrumbs:** extend `BreadcrumbItem['to']` (or use `PublicRoutePath`) so
listing path is type-safe — today `Breadcrumbs` hardcodes specialization paths
only.

### Metadata / SEO

- Listing and detail: `createRouteHead({ path, title, description })`
- Detail JSON-LD: `BlogPosting` (headline, description, datePublished,
  dateModified, author/publisher from `businessProfile`, mainEntityOfPage URL)
  + `BreadcrumbList`
- `getSitemapPaths()`: add `/aktualnosci` and every published post path
- `renderLlmsTxt`: add listing (+ optional note that posts appear in sitemap)
- Run `pnpm generate-public-metadata` after renderer changes; commit updated
  `public/sitemap.xml` / `public/llms.txt`

### Navigation

- `MAIN_NAV_ITEMS`: insert `{ id: 'aktualnosci', label: 'Aktualności', to: '/aktualnosci' }`
- Bottom nav: unchanged in v1 (see open question 3)
- Footer: optional text link later; not required for v1

### Analytics

Fire-and-forget `trackPlausibleEvent` from listing/detail pages only — no new
retry logic in callers (`analytics.ts` owns lifecycle).

## Consumers checklist

| Consumer | Change |
| --- | --- |
| `src/types/types.ts` | IDs, `BlogPost`, route/nav unions |
| `src/data/blog.ts` + `blogValidation.ts` (+ tests) | New |
| `src/data/navigation.ts` | Main nav item |
| `src/features/blog/**` | New pages/model |
| `src/routes/aktualnosci/**` | New routes |
| `src/components/ui/Breadcrumbs.tsx` | Allow listing path in `to` |
| `src/libs/blogMetadata.ts` (+ tests) | New JSON-LD helpers |
| `src/libs/publicMetadata.ts` (+ tests) | Sitemap + llms |
| `public/sitemap.xml`, `public/llms.txt` | Regenerated |
| `src/widgets/navigation/NavBar.tsx` | Should work via data; verify active state for nested `/aktualnosci/$slug` |
| `docs/DESIGN.md` | After ship: mention blog in route architecture + canonical homes |
| `AGENTS.md` canonical table | After ship: blog row |
| E2E `tests/e2e/route-architecture.spec.ts` and/or `blog.spec.ts` | Metadata routes, list→detail, unknown slug → 404 |
| Unit: listing/detail pages, validation, metadata | Co-located |

## Implementation phases

### Phase 0 — Decisions

Resolve open questions 1–7. Freeze path prefix, nav, analytics names, and
whether seed content ships with the first PR or a follow-up.

### Phase 1 — Data + validation

1. Add types and `blog.ts` / `blogValidation.ts` with co-located tests.
2. Add placeholder or stakeholder-approved posts (`isPublished: false` allowed
   until content is ready).
3. Wire validation into the existing production integrity suite.

### Phase 2 — Libs + public metadata

1. `blogMetadata.ts` + unit tests.
2. Extend `publicMetadata` sitemap/llms; regenerate committed public files.
3. Extend `Breadcrumbs` path typing.

### Phase 3 — Feature UI + routes

1. `loadBlogPost`, listing and detail pages + unit tests (JSON-LD present,
   unpublished/unknown → notFound at route layer).
2. Add route files; let the router regenerate `routeTree.gen.ts`.
3. Main nav entry (only when at least one published post exists, or accept empty
   listing per product decision).

### Phase 4 — Hardening

1. E2E: metadata contract entries for listing + one post; navigation list→detail;
   bad slug 404 shell.
2. `pnpm check`, `pnpm test`, then `pnpm run validate` (multi-route / navigation /
   public metadata change).
3. Update `DESIGN.md` route architecture + canonical ownership; add AGENTS.md
   canonical-home row.

## UX / visual constraints

Follow existing brochure language and the frontend design rules for this site:

- Brand and existing tokens (`#722F37`, Playfair / Crimson) — no new purple/glow
  aesthetic
- Listing is not a dashboard; one purpose per section
- No cards in a hero; avoid card chrome unless interaction requires a container
- No detached badges/overlays on hero media
- Motion: reuse `data-reveal-on-scroll` (2–3 intentional reveals on listing/detail)
- Mobile + desktop: inherit `Layout` (NavBar, BottomNav, Footer)

## Testing plan

| Layer | Coverage |
| --- | --- |
| Unit data | ID/slug uniqueness, publish filter, sort order, path helpers |
| Unit validation | Reject bad slugs, empty published bodies, unknown service refs |
| Unit metadata | Head titles; sitemap includes listing + published only; JSON-LD shape |
| Unit pages | Listing renders published titles/links; detail renders blocks + breadcrumbs |
| E2E | Route architecture metadata loop; list→detail; unknown slug not-found |
| Validate | `pnpm run validate` before merge |

Do not weaken retries, readiness markers, or validation to get green.

## Rollback

- Revert the feature branch / PR: removes routes, nav item, data, and regenerated
  public files together.
- No persistence or deploy-config changes in-repo; Dokploy remains external.
- If partially merged: remove main nav item first (stops discovery), then unpublish
  posts (`isPublished: false`) so sitemap generation drops detail URLs on next
  `generate-public-metadata`, then delete routes in a follow-up.

## Risks

| Risk | Mitigation |
| --- | --- |
| Invented medical/marketing copy | Stakeholder-authored Polish content only |
| Bottom nav overcrowding | Keep 5 tabs; no blog tab in v1 |
| Breadcrumb / route type drift | Extend shared `PublicRoutePath`; avoid parallel string unions |
| Stale sitemap/llms | Always regenerate; `pnpm check` fails on drift |
| Empty blog launches poorly | Gate nav on published content or ship with ≥1 real post |

## Closest references

- `src/routes/kosmetologia/$slug.tsx` — loader / head / notFound
- `src/features/services/page/ServiceDetailPage.tsx` — detail chrome + JSON-LD
- `src/routes/galeria.tsx` + `src/features/gallery/page/GalleryPage.tsx` — listing
- `src/data/services.ts` + `src/data/serviceValidation.ts` — ID/slug/publish model
- `src/libs/publicMetadata.ts` — sitemap / llms
- `src/data/navigation.ts` — nav registration
- `tests/e2e/route-architecture.spec.ts` — public route metadata contract

## Suggested PR sequence (after decisions)

1. **PR A:** types + data + validation (+ unpublished or real seed posts)
2. **PR B:** metadata libs + public file regeneration + Breadcrumbs typing
3. **PR C:** feature pages + routes + main nav + unit tests
4. **PR D:** E2E + DESIGN/AGENTS docs + `pnpm run validate`

Single PR is acceptable if scope stays small (few posts, no CMS). Split if review
or content approval needs a pause between data and public discovery.
