# Runbook

This runbook records only procedures supported by the repository. Production is
described as a Dokploy Node service, possibly behind Cloudflare, but deployment
configuration, credentials, revision APIs, cache controls, owners, and
escalation contacts are not present. Those are explicit limits, not implied
procedures. Evidence: the Dokploy summary in `README.md`, the scripts in
`package.json`, and the absence of deployment configuration in the repository.

## Local startup and shutdown

Requirements: Node 24 and pnpm 11.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The development server listens on `http://localhost:3000`. Stop it with the
terminal interrupt (`Ctrl-C`). For a production-shaped local process:

```bash
pnpm build
HOST=127.0.0.1 PORT=4173 pnpm start
```

Nitro output is `.output/`; stop the process with `Ctrl-C`. No worker, queue,
scheduled job, database, or migration is represented in this repository.

## Pre-deployment verification

Run:

```bash
pnpm run validate
```

This executes Biome and public-metadata drift checks, typecheck/build, unit
coverage, a high-severity dependency audit, and Playwright. Playwright builds
and starts the Nitro server itself. A substantial release is not locally ready
unless this command exits zero. Evidence: F-009, F-015, `package.json`,
`playwright.config.ts`.

When salon identity/location changes, first run:

```bash
pnpm generate-public-metadata
pnpm check:public-metadata
```

Commit the resulting public files with their canonical `business.ts` change.
When promotions or price history change, run their focused data tests as well as
the full gate; these are static business facts bundled into the artifact.

## Runtime signals

- **Logs:** Nitro writes process output to stdout/stderr. The repository does
  not define a production log destination, retention policy, or query command.
- **Analytics diagnostics:** browser developer tools may show one of three
  static `[analytics]` warnings for retryable load failure, exhausted retry, or
  initialization failure. They are not proven to be collected remotely.
  Evidence: F-012, `src/libs/analytics.test.ts`.
- **Metrics/traces:** no application metrics or tracing backend is configured.
  Plausible is product analytics, not a service-health monitor.
- **Health:** README configures `GET /` as the Dokploy health path. A successful
  response proves only that the root is served; it does not prove the deployed
  revision or current promotion content. Evidence: `README.md`.
- **Readiness:** there is no production readiness endpoint. The
  `data-react-client-ready` attribute is Playwright synchronization, not an
  operator health contract. Evidence: F-010, `playwright.config.ts`,
  `tests/e2e/pages/HomePage.ts`.

## Deployment verification

The repository has no deploy command and cannot identify the live revision.
After an externally performed deployment, the available manual checks are:

1. Confirm `/` responds and renders the hero and services.
2. Compare visible contact/location facts with `src/data/business.ts`.
3. At the intended Warsaw-local date, compare promotion banner, applicable
   service price, deadline, and lowest-price disclosure with the committed
   promotion and history data.
4. Check `/robots.txt`, `/sitemap.xml`, `/site.webmanifest`, and `/llms.txt`
   when business/public metadata changed.
5. Exercise a deferred section such as `#kontakt`; a failed optional section
   should show local Polish reload UI without removing the rest of the page.

These checks do not establish release identity or bypass a stale intermediary
cache. A verified platform-specific procedure is still required for that.

## Failure diagnosis and local recovery

### Build or metadata drift failure

Run `pnpm check` and `pnpm build`. If public metadata is stale, change the
canonical business data/renderer as intended, run
`pnpm generate-public-metadata`, inspect the diff, and rerun the checks. Do not
hand-edit generated files. Evidence: F-008, `src/libs/publicMetadata.test.ts`,
`scripts/generate-public-metadata.mjs`.

### Wrong or missing promotion

Check the Warsaw-local reference date, `promotionConfigs`, production config
validation, service applicability by `ServiceId`, and the immutable price
ledger. Reproduce with focused unit tests and then `pnpm run validate`. Do not
repair historical prices by deriving them from today's catalog. Evidence:
F-001, F-002, F-005, F-007, `src/data/promotionValidation.test.ts`,
`src/data/servicePriceHistory.test.ts`.

### Deferred section fails

Use the section's `Odśwież stronę` action once. If it fails again, inspect the
browser network/console for a missing fingerprinted chunk and preserve the rest
of the page. Repository code cannot purge a CDN or repair an incoherent live
deployment. Evidence: F-003,
`tests/e2e/deferred-section-failure.spec.ts`.

### Analytics warnings

The first load warning leaves one later-demand retry. A second load warning or
an initialization warning disables analytics for that page. Customer-facing
rendering should continue. Reloading starts a new page lifecycle; persistent
failure may be a blocker, network policy, or missing asset. Evidence: F-012,
`src/libs/analytics.test.ts`.

### E2E failure

Do not add retries or timeouts first. Local Playwright retries are zero. CI
permits two diagnostic retries, but `failOnFlakyTests` makes a recovered retry
fail; inspect the trace/screenshot/video artifacts and reproduce the focused
spec. CI artifact retention is 14 days. Confirm the client-ready and
fixed-reference-time contracts before interacting with SSR-visible controls.
Evidence: F-010, F-015, `playwright.config.ts`, `.github/workflows/ci.yml`.

## Rollback and repair boundary

Code/configuration rollback is a Git revert of the responsible commit followed
by `pnpm run validate` and a fresh external deployment. The correct live
revision-selection, deployment, traffic switch, and Cloudflare purge commands
are not available in this repository; do not guess them. There is no database,
queue, job state, or application data-repair procedure. Static business data is
repaired in source, validated, rebuilt, and redeployed.

Production ownership and escalation information are also unavailable. If live
recovery requires Dokploy, Cloudflare, logs, credentials, or revision identity,
handoff must use the organization's external operational channel. This is the
remaining F-011 debt.
