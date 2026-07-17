# AGENTS.md

Instructions for AI coding agents working in this repository.

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Run the built Nitro server
pnpm lint             # Run Biome lint
pnpm test             # Run Vitest unit tests (single run)
pnpm test:coverage    # Run Vitest unit tests with coverage
pnpm test:e2e         # Run Playwright E2E tests
pnpm check            # Run Biome format + lint checks
pnpm run validate     # Full local validation: check, build, unit, audit + E2E
pnpm format:write     # Format code with Biome
pnpm optimize-images  # Regenerate optimized WebP assets (scripts/optimize-images.mjs)
pnpm generate-favicons # Regenerate favicons/app icons (scripts/generate-favicons.mjs)
pnpm generate-public-metadata # Regenerate committed public metadata
pnpm check:public-metadata # Check committed public metadata for drift
```

Run a single unit test file:

```bash
pnpm vitest run src/libs/utils.test.ts
```

Run a single E2E test file:

```bash
pnpm playwright test tests/e2e/services-section.spec.ts
```

Before finishing a task, run `pnpm check` and `pnpm test` (or a relevant subset).

### Before pushing a big PR

Run `pnpm run validate` before opening or pushing a substantial PR. Use it for new features, multi-file refactors, perf/bundle work, dependency upgrades, or changes touching layout, navigation, or E2E-covered flows. Small, scoped edits (copy tweak, single test fix) can keep using `pnpm check` and `pnpm test` only.

First-time E2E locally requires Playwright browsers: `pnpm exec playwright install`.

## Tech Stack

- **TanStack Start** with React 19, TypeScript, Vite, and Nitro SSR
- **TanStack Router** with one file route (`/`)
- **Tailwind CSS 4** for styling
- **Biome** for linting and formatting
- **Vitest** (unit) + **Playwright** (E2E) for testing
- **pnpm** as package manager (Node 24 required)
- **Plausible Analytics** (self-hosted, privacy-friendly)

## Folder Structure

```
src/
  routes/       — TanStack Start document and `/` route
  app/          — App shell, Layout, providers, global CSS
  features/     — Domain sections (home, services, contact)
  widgets/      — NavBar, BottomNav, Footer, sticky CTA, promotion banner
  components/   — Reusable UI (Button, Section, Heading…)
  data/         — Static data + promotion logic
  libs/         — utils, analytics, priceHistory, openingHours
  hooks/        — Custom hooks
  theme/        — Design tokens
  types/        — Shared TypeScript types (@app-types)
tests/e2e/      — Playwright specs + page object components
scripts/        — Image optimization + favicon generation tooling
```

## Where to Edit What

| Change                  | Location                                             |
| ----------------------- | ---------------------------------------------------- |
| New page section        | `src/features/<domain>/sections/`                    |
| Global layout widget    | `src/widgets/`                                       |
| Reusable UI primitive   | `src/components/ui/`                                 |
| Service prices, catalog | `src/data/services.ts`                               |
| Promotions, discounts   | `src/data/promotion.ts`                              |
| Nav links / section IDs | `src/data/navigation.ts`                             |
| Business/salon identity | `src/data/business.ts`                               |
| Public metadata output  | `src/libs/publicMetadata.ts` + generation script     |
| SEO meta, JSON-LD       | `src/routes/__root.tsx`                              |
| Unit test               | Co-located `*.test.ts(x)` next to source             |
| E2E test                | `tests/e2e/` with page objects in `tests/e2e/pages/` |

## Architecture

### One Route, Server Rendered

TanStack Start server-renders the single `/` route. In-page navigation still uses `scrollToSection()` from `src/libs/utils.ts` with hash-based anchors. Active section is tracked via IntersectionObserver in `UIProvider`.

### State Management

React Context only — `src/app/providers/UIContext.tsx` (definition) + `src/app/providers/UIProvider.tsx` (IntersectionObserver logic). Uses React 19's `use()` hook instead of `useContext`.

Context manages: `activeSection`, `isMenuOpen`, `scrolled`, `showScrollToTop`, `showStickyBookCTA`.

### Data Layer

All data is static TypeScript in `src/data/`. No API calls — data is bundled with the app:

- `services.ts` — full service catalog with pricing, durations, descriptions
- `promotion.ts` — promotion config and applicability/scope utilities
- `business.ts` — canonical brand and salon identity used by UI and metadata
- `gallery.ts`, `effects.ts`, `opinions.ts`, `navigation.ts` — authored content
- `servicePriceHistory.ts` — historical price data (used by the 30-day lowest price feature)

After changing `business.ts`, run `pnpm generate-public-metadata`. Committed
public metadata is generated; `pnpm check` and `pnpm build` reject stale files.

Do not invent prices or promotions outside the data layer.

### Path Aliases

Configured in `tsconfig.json` and resolved by Vite:

`@app`, `@features`, `@widgets`, `@components`, `@data`, `@context`, `@libs`, `@hooks`, `@theme`, `@assets`, `@app-types`

### Lazy Loading

All `HomePage` sections except `HeroSection` are code-split via `React.lazy()` in `HomePage.tsx`. Each lazy section has its own `Suspense` boundary (`LazySection` helper): near-fold sections (About, Process, Services) show a spinner fallback; below-fold sections use `null` fallback for progressive paint.

Non-critical font CSS loads after first paint via `src/libs/scheduleDeferredWork.ts` (first scroll or 4 s after `load`). Critical weights (Playfair 700, Crimson 400) stay in the initial bundle. Batched imports in `src/libs/loadDeferredFonts.ts`.

### Mobile Navigation

`BottomNav` (`src/widgets/navigation/BottomNav.tsx`) is a fixed bottom navigation bar visible only on mobile (hidden at `min-[810px]`). It mirrors the main nav links and tracks analytics events.

### SEO

All meta tags, Open Graph, and JSON-LD live in `src/routes/__root.tsx`. `public/sitemap.xml` lists the homepage only.

### Animations

`UIProvider` uses a `MutationObserver` + `IntersectionObserver` to auto-apply `animate-fade-up` class to any element with `animate-on-scroll` class when it enters the viewport. The MutationObserver re-observes newly added elements (e.g. from lazy-loaded components).

### Promotion System

Promotions in `src/data/promotion.ts` can apply to: all services, specific categories, or specific services. `getActivePromotion()` returns the first active promotion and `getAllActivePromotions()` returns every active one; `doesPromotionApplyToService()` checks applicability and `getPromotionScopeDescription()` / `formatPromotionDeadline()` format copy. Discounted prices are computed inline in `ExpandableServiceCard`/`ServicesSection` (there is no `getDiscountedPrice`). Price history is stored in localStorage to display "lowest price in 30 days".

## Testing

- **Unit tests:** Vitest, co-located as `src/**/*.test.ts(x)` (see `vite.config.ts`)
- **E2E tests:** Playwright in `tests/e2e/`; use page object components in `tests/e2e/pages/components/`
- Analytics is disabled automatically in test environment

## Code Style

- No semicolons, single quotes, 2-space indent, 80-char line width (Biome)
- Polish language throughout (UI labels, comments, data)
- Analytics events tracked via `src/libs/analytics.ts` wrapper (`initAnalytics()` + `trackPlausibleEvent()`; init scheduled after `load` + idle in `scheduleDeferredWork.ts`, Plausible loaded dynamically)
- `src/libs/scheduleDeferredWork.ts` — defers analytics and non-critical fonts off the critical path
- `src/libs/loadDeferredFonts.ts` — deferred font CSS imports in batches (Playfair 400/600, Crimson 600/italic)
- `src/libs/pluralize.ts` — Polish pluralization for review counts (`pluralizeOpinie`)
- `src/libs/priceHistory.ts` — price history tracking (localStorage, 30-day window)
- `src/libs/openingHours.ts` — salon opening hours utilities (`isSalonOpenNow()`, etc.)
- `src/hooks/useScrollDepthTracking.ts` — scroll depth analytics hook used in `HomePage.tsx`

## Agent Guidelines

- Prefer minimal, focused diffs; avoid over-engineering
- Do not commit unless explicitly asked
- Reference existing files with `@` instead of copying large code blocks
- Match patterns in nearby code before introducing new abstractions
