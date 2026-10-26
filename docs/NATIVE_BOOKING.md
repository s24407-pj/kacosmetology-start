# Native customer booking

The `/rezerwacja` route uses Spring Scheduler directly. Marketing prices and
slugs are presentation only. Booking catalog, availability, accepted price,
duration, identity and reservation status come from Spring.

## Configuration

| Setting | Stage | Purpose |
| --- | --- | --- |
| `VITE_SCHEDULER_COMPANY_ID` | Build | Salon UUID from Scheduler; empty disables booking and displays contact. |
| `VITE_SCHEDULER_SERVICE_MAP` | Build | JSON object mapping marketing `ServiceId` values to active Scheduler offering UUIDs. |
| `SCHEDULER_API_ORIGIN` | Runtime | Fixed backend origin, e.g. `http://scheduler:8080`, for the Nitro relay. No path, query, fragment or user credentials. |
| `SCHEDULER_OPENAPI_PATH` | Generation | Optional path to matching backend OpenAPI JSON; defaults to the sibling scheduler checkout's generated file. |

Example shape (replace the UUID with an actual offering in the configured salon):

```text
VITE_SCHEDULER_SERVICE_MAP={"service-regulacja-brwi":"00000000-0000-4000-8000-000000000002"}
```

These identifiers are public configuration, not credentials. Mapping must be
reviewed against the salon's active catalog. Never derive backend IDs from
marketing slugs, names or prices. Missing, malformed or inactive mappings leave
the catalog available for deliberate service selection and explain the problem.
Changing `VITE_*` values requires a rebuild. The upstream origin stays server-only.

## Sessions and relay

Prefer a same-origin edge `/api` route to Spring, following the deployment's
existing trusted-proxy configuration. The included Nitro `/api/**` relay is an
alternative for deployments without that route. It forwards each browser's
cookies, CSRF/context/idempotency headers, body, response status and separate
Set-Cookie headers only within that request. It holds no global token/cookie jar,
never follows upstream redirects and sets `Cache-Control: no-store`.

The backend's `CORS_ORIGINS` must include the public website origin when using
the Nitro relay, which preserves the browser Origin header. Keep the allowed
origin explicit and credentialed; do not wildcard it. The Vite Nitro plugin opts
into scanning `./server`, so the relay is included in production builds.

The relay strips `Forwarded`, all `X-Forwarded-*`, `X-Real-IP` and
`CF-Connecting-IP` input. It cannot establish a trustworthy original browser IP;
Spring sees the relay address and IP rate limits are shared by its users.
For production per-client limits, configure a trusted edge path directly to
Spring that overwrites forwarding headers and restricts direct backend access.
Do not solve shared limits by trusting browser-supplied IP headers or disabling
rate limits. Keep SESSION host-only/HttpOnly, Secure in production and SameSite=Lax;
never cache `/api`, authenticated content, or responses carrying cookies.

After OTP login/logout the client refreshes its CSRF bootstrap. Every protected
write captures `v1:<customerId>:<companyId>:null:ROLE_CUSTOMER` from its original
session. A wrong-role/company session requires explicit logout. On account
change, entered names/email and accepted quotes are cleared; an old request is
never rebound to the new account. Availability refreshes after authentication.
The API remains authoritative when cookies change before the browser notices.

## Establishment, accepted terms and retries

OTP creates or authenticates a salon-local pending identity, without making it
visible to staff. Only successful booking establishes the first-visit profile.
Returning customers enter no names/email; established details remain staff-managed.
If staff establishes the profile while a customer is filling first-visit details,
Spring rejects with `CUSTOMER_PROFILE_CHANGED`. The page refreshes readiness,
explains the existing salon record and requires explicit acknowledgement before
a changed request with a new key. It never strips details and silently retries.

A quote holds commercial terms, not capacity. Customers explicitly accept its
server price, duration and Warsaw local start. Expiry/reconfirmation requires
fresh terms; slot loss refreshes availability. Phone entry requires a confirmed
international prefix. Formatting spaces, parentheses and hyphens are removed;
no country code is guessed. OTP proves possession of a phone, not physical-person
identity. Shared/recycled/incorrect phones require salon assistance.

Before sending, the browser retains exact request/key and original account/salon
in `sessionStorage`, under `kacosmetology.booking.attempt:<company>:<account>`.
Separate scoped entries prevent another login from replacing an unresolved request.
Payloads expire after 30 minutes across all accounts during use or reopening the
page. Logout erases private bodies. A minimal
`kacosmetology.booking.unresolved:<company>:<account>` marker remains until the
original attempt is resolved or the browser tab session ends. It contains no OTP,
password or session cookie. No data is written to localStorage for booking.

If storage cannot retain the exact attempt, the page refuses to dispatch it.
After timeout, 401/403/429, context rejection or `IDEMPOTENCY_IN_PROGRESS`, it keeps
the same body/key. Reauthenticate the original account and deliberately check the
same request. Only definitive post-replay business rejection resolves an earlier
unknown outcome. Missing history never proves failure. Losing the payload requires
salon resolution before another booking; a warning cannot reconstruct the request.

Spring successful replay returns HTTP 200 with current state, possibly CANCELLED
or archived. The page displays that actual state and emits no purchase conversion.
Local cleanup/refetch failures cannot turn a committed response into booking failure.

## Coordinated rollout and verification

Deploy only matching scheduler ADR-0018, dashboard and customer-site contracts.
Apply backend V2 to add profile versions; never edit V1, bypass Flyway, reset an
existing database or remove permanent submission records. Update the dashboard's
backend commit pin when the final changes are committed. Stop booking traffic
while switching incompatible clients/API; there is no legacy flat-field adapter.
A rollback must coordinate all writers and preserve durable request outcomes.
See backend identity documentation for a read-only phone-key audit and manually
reviewed remediation; do not guess legacy prefixes or merge customer identities.

Run `pnpm api:generate`, check/typecheck/build, unit coverage and browser suites.
Mock E2E tests cover UI/recovery boundaries. Every push to main and every pull
request also runs the separate `Booking integration smoke` CI job. It builds the
Scheduler commit in `.github/scheduler-api-revision`, starts Spring with dev-only
mock SMS and disposable PostgreSQL/Redis services, and inserts the synthetic
calendar in `scripts/ci/booking-fixture.sql`. No production credentials are used.
The Chromium smoke exercises OTP → quote → booking, a lost committed response,
cancellation and exact-key/body replay, then a returning booking. Missing fixture
configuration or backend startup failure fails the job rather than skipping it.
Keep the backend revision pin aligned with intentional contract upgrades. Configure
`Booking integration smoke` as a required check in GitHub branch protection;
repository workflow files cannot enforce that setting themselves.

`pnpm run validate` / `pnpm validate:ci` run the general site suite. The separate
integration command is `pnpm test:integration`; CI supplies `SCHEDULER_API_ORIGIN`,
`VITE_SCHEDULER_COMPANY_ID`, `VITE_SCHEDULER_SERVICE_MAP`,
`SCHEDULER_E2E_EMPLOYEE_ID`, `SCHEDULER_E2E_REDIS_CONTAINER` and
`SCHEDULER_E2E_CONTAINER_ENGINE=docker`. The dedicated config enables the real
scenario automatically and runs one Chromium worker. For local isolated fixtures,
the existing full-suite opt-in `SCHEDULER_E2E_REAL=1` remains available; the default
container CLI is Podman. Never point fixture-writing tests at a live salon database.

Availability requests settle independently for each eligible specialist. Successful
responses remain selectable when another request fails; a separate message explains
incomplete data. A total fetch failure is distinct from an empty successful day.



## Verification completed on 2026-10-26

Customer website: `pnpm run validate` passed against the final matching isolated
Spring API, with 431 unit tests, all configured coverage thresholds, both
TypeScript projects, production build, metadata/lint checks and a clean security
audit. Coverage: 91.65% statements, 85.25% branches, 94.76% functions and 92.82%
lines. Browser suite: 146 passed, 40 intentionally skipped duplicate desktop-only
metadata/crawler cases in the mobile project. No failures or retries. Both
Desktop Chromium and Mobile Chrome ran. Mobile Safari was not run locally.

The real tests exercised native phone/OTP authentication through the production
Nitro relay, explicit commercial acceptance, a committed 201 with its response
lost, customer cancellation, reload and exact-key/body replay returning current
CANCELLED state, plus a returning booking without first-visit fields. Test SMS
used only isolated dev Redis; no real messages were sent. Mock browser tests
also covered profile-establishment acknowledgement, cross-account draft clearing,
429/reload recovery, wrong-role logout, quote expiry, keyboard use and automated
WCAG checks. A promotion-visible regression also verifies that the fixed
navigation never covers the reservation heading on desktop or mobile. Unit transport tests cover request-local cookies, separate Set-Cookie,
no-store, untrusted forwarding headers and browser-native fetch invocation.

Matching backend: `./gradlew spotlessApply build` passed 641 tests across 78
suites with zero failures, errors or skips (evidence in its
`docs/verification/customer-intent-tests.json`, dated 2026-10-25).
Dashboard: formatting/typecheck/build and 98 unit tests passed, plus 164 mocked,
22 real API and 12 production browser tests; the final duplicate-candidate fix
was additionally checked with all 18 customer-booking and 2 real reservation tests.

The implementation is coordinated with scheduler PR #71 and dashboard PR #25;
the customer changes use `feat/native-customer-booking`. Verification performed
no deployment, existing-data reset or automated legacy-phone changes. Operators
still need the actual production company/service mapping and backend CORS/proxy
configuration. The dashboard's `.github/scheduler-api-revision` pins the matching
backend commit so CI reproduces the same contract.
