# KA Cosmetology

Server-rendered single-page website for a cosmetology salon in Poland. Built
with TanStack Start, React 19, Vite, Tailwind CSS 4, and Nitro.

## Prerequisites

- Node.js 24
- pnpm 11

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
| `pnpm check` | Run Biome formatting and lint checks |
| `pnpm format:write` | Format files with Biome |
| `pnpm test` | Run unit tests |
| `pnpm test:coverage` | Run unit tests with coverage |
| `pnpm test:e2e` | Run Playwright tests |
| `pnpm ci` | Run the complete local CI suite |

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

TanStack Start renders the `/` route on the server. Navigation inside the page
continues to use the existing section hashes and scroll behavior. Static salon
content remains in `src/data/`; there are no API calls or server functions.

See [AGENTS.md](./AGENTS.md) for repository conventions.
