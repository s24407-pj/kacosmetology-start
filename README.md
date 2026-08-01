# KA Cosmetology

Server-rendered, route-oriented website for a cosmetology salon in Poland. Built
with TanStack Start, React 19, Vite, Tailwind CSS 4, and Nitro. Kosmetologia,
oprawa oka and trychologia share one brand and canonical business-data model.

## Prerequisites

- Node.js 24
- pnpm 11

With [mise](https://mise.jdx.dev/) installed and activated in your shell, from
the repo root run `mise install` to install the versions pinned in
`mise.toml`, then continue with the quick start below.

## Quick start

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The development server is available at `http://localhost:3000`.

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Type-check and build the production server |
| `pnpm start` | Run the built Nitro server |
| `pnpm check` | Run Biome formatting and lint checks plus metadata drift |
| `pnpm exec lefthook run pre-commit` | Dry-run fast staged pre-commit checks (sensitive filenames, Biome, diff, relevant data/metadata; hooks install via `pnpm install`) |
| `pnpm exec lefthook run pre-push` | Dry-run the broader pre-push gate (Biome CI, TypeScript projects, and unit tests) |
| `pnpm check:ci` | Run Biome in CI mode (matches GitHub Actions) |
| `pnpm generate-public-metadata` | Regenerate committed public metadata |
| `pnpm check:public-metadata` | Check committed public metadata for drift |
| `pnpm format:write` | Format files with Biome |
| `pnpm test` | Run unit tests |
| `pnpm test:coverage` | Run unit tests with coverage |
| `pnpm test:e2e` | Run Playwright tests |
| `pnpm run validate` | Run the complete local validation suite |
| `pnpm validate:ci` | Run the GitHub Actions pipeline locally |

## Dokploy

Configure the application as a Node service:

- Install: `pnpm install --frozen-lockfile`
- Build: `pnpm build`
- Start: `pnpm start`
- Port: set `PORT` to the port exposed through Dokploy
- Health check: `/`

The Nitro build is written to `.output/`. Cloudflare may cache fingerprinted
assets aggressively; SSR HTML should remain uncached or use a short TTL.

## Architecture

TanStack Start renders `/`, `/kosmetologia`, `/oprawa-oka`, `/trychologia`,
`/galeria`, and dynamic service details on the server. The compatibility route
`/rezerwacja` redirects directly to the canonical Booksy profile. Static salon
content remains in `src/data/`; there is no general business API or data-service
layer. One narrow server function in the root route establishes the shared
SSR/hydration render-time snapshot.

Business identity and salon-location facts have one canonical owner in
`src/data/business.ts`. After changing them, run
`pnpm generate-public-metadata`; normal `check` and `build` commands verify
that `llms.txt`, `robots.txt`, `sitemap.xml`, and `site.webmanifest` are current.

See [AGENTS.md](./AGENTS.md) for repository conventions,
[DESIGN.md](./docs/DESIGN.md) for architecture and change boundaries
