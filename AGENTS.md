# AGENTS.md

Repository instructions for coding agents. Keep changes focused and match nearby
patterns; do not commit unless the user or an active workflow authorizes it.

## Commands

Requires Node 24 and pnpm 11.

```bash
pnpm install --frozen-lockfile # install
pnpm dev                       # local server on port 3000
pnpm typecheck                 # TypeScript only
pnpm lint                      # Biome lint only
pnpm check                     # Biome + generated metadata drift
pnpm check:ci                  # Biome CI mode (matches GitHub Actions)
pnpm exec lefthook run pre-commit # dry-run Git pre-commit (Biome on staged files; hooks install via pnpm install)
pnpm test                      # all Vitest tests
pnpm vitest run src/libs/utils.test.ts # one unit file
pnpm playwright test tests/e2e/services-section.spec.ts # one E2E file
pnpm build                     # typecheck, metadata check, Nitro build
pnpm start                     # run .output/server/index.mjs
pnpm run validate              # check, build, coverage, audit, E2E
pnpm validate:ci               # CI pipeline locally (biome ci + build + coverage + audit + E2E)
```

Install browsers once with `pnpm exec playwright install`; on a fresh Linux host
use `pnpm exec playwright install --with-deps`. Run `pnpm check` and `pnpm test`
before finishing. Run `pnpm run validate` for multi-file, layout, navigation,
dependency, performance, or E2E-covered changes. Use `pnpm validate:ci` when matching
GitHub Actions gates (after browsers are installed).

Deployment is configured externally as a Dokploy Node service; this repository
has no deploy command.

## Architecture

- TanStack Start server-renders the home, specialization, service-detail,
  reservation, and gallery routes through Nitro.
- `src/routes/` owns route loading, document metadata, and composition.
- `src/app/` owns the shell and providers; React Context owns shared UI state.
- `src/features/` owns domain sections; `src/widgets/` owns layout-wide UI.
- `src/components/ui/` contains reusable, domain-neutral primitives.
- `src/data/` is the canonical static business/configuration layer.
- `src/libs/` owns reusable policy and infrastructure adapters.
- `src/hooks/` owns reusable React behavior; `src/theme/` owns design tokens.
- Dependencies flow from routes/features/widgets toward data, libs, and UI
  primitives; data and libs must not import feature presentation.
- Unit tests are co-located; Playwright specs and page objects live in
  `tests/e2e/`.

See [DESIGN.md](./docs/DESIGN.md) for boundaries, rationale, and change traces.

## Canonical homes

| Change | Canonical location |
| --- | --- |
| Service identity, names, prices | `src/data/services.ts` |
| Immutable historical prices | `src/data/servicePriceHistory.ts` |
| Promotion records and precedence | `src/data/promotion.ts` |
| Promotion integrity rules | `src/data/promotionValidation.ts` |
| Brand, locations, opening schedule | `src/data/business.ts` |
| Opening-hours calculation/projections | `src/libs/openingHours.ts` |
| Nav labels and section IDs | `src/data/navigation.ts` |
| Blog article MDX | `src/content/blog/` |
| Blog metadata manifest | `src/data/blogPosts.generated.ts` (via `pnpm generate-blog-content`) |
| Blog MDX syntax policy | `src/libs/blogMdxPolicy.ts` |
| SEO head and JSON-LD composition | `src/routes/__root.tsx` |
| Public metadata rendering | `src/libs/publicMetadata.ts` |
| Deferred analytics lifecycle | `src/libs/analytics.ts` |
| Deferred startup scheduling | `src/libs/scheduleDeferredWork.ts` |
| New domain section | `src/features/<domain>/sections/` |
| Service public URL and specialization | `src/data/services.ts` |
| Route metadata composition | `src/libs/routeMetadata.ts` |
| Reusable UI primitive | `src/components/ui/` |
| Build/test/tool configuration | repository-root `*.config.*`, `package.json` |

After editing `src/data/business.ts` or public blog posts, run
`pnpm generate-blog-content` when blog MDX changes, then
`pnpm generate-public-metadata`; `check` and `build` reject stale committed
`llms.txt`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, or
`blogPosts.generated.ts` files.

## Conventions and gotchas

- TypeScript uses single quotes, no semicolons, 2-space indentation, and Biome.
- UI copy, content, and user-facing errors are Polish.
- Use `ServiceId` for references, history, keys, DOM IDs, and analytics; service
  names are presentation only. `src/data/services.ts`.
- Promotion resolution is non-stacking: highest discount, then earlier start,
  then lexical ID. Validate the complete production config.
  F-007, `src/data/promotion.test.ts`,
  `src/data/promotionValidation.test.ts`.
- Historical price rows are explicit immutable facts; never reconstruct or
  mutate them during render.
  `src/data/servicePriceHistory.test.ts`.
- One render-time snapshot crosses SSR and hydration. Playwright may request a
  fixed time only when `PLAYWRIGHT_TEST_MODE=1`.
  `src/libs/renderTime.test.ts`,
  `src/app/providers/RenderTimeProvider.test.tsx`.
- Below-fold home sections mount after load/idle or direct-hash demand. Each has
  its own `DeferredSectionBoundary`; preserve section IDs and local recovery.
  `src/features/home/page/HomePage.test.tsx`.
- Analytics remains optional and deferred. Its wrapper owns one later-demand
  import retry and static warnings; callers never add retries.
  `src/libs/analytics.test.ts`.
- Deferred fonts load on first scroll or the 4-second fallback; keep that work
  out of the critical path.
- E2E retries are zero locally. CI permits two diagnostic retries but
  `failOnFlakyTests` makes any recovered retry fail; artifacts are retained for
  14 days. `playwright.config.ts`, `.github/workflows/ci.yml`.

## Boundaries

- Do not invent prices, promotions, contact facts, deployment facts, or owners.
- Do not edit generated `src/routeTree.gen.ts`; use route generation.
- Do not bypass `@` aliases with long cross-layer relative imports.
- Do not add feature policy to generic UI components or route metadata.
- Do not change public metadata by hand; change its canonical input/renderer.
- Do not weaken tests, retries, readiness markers, or validation to get green.
- Ask before changing public contracts, dependencies, persistence, deployment,
  analytics schemas, promotion policy, or cross-module ownership.

Write an execution plan before multi-module features, schema/interface changes,
dependency upgrades, migrations, deployment work, or changes with rollback/data
implications. Small local fixes can follow existing tests and nearby patterns.

current known debt is listed in [DESIGN.md](./docs/DESIGN.md#known-debt).
