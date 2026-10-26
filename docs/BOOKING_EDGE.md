# Production booking API routing

Required path: browser → Cloudflare → Traefik → Spring Scheduler. The website
continues to use relative `/api/...` URLs and same-origin cookies. Nitro serves
the website, not production API traffic. No frontend API contract, database
migration or change to OTP limit values is needed.

This runbook is not evidence of a completed deployment. Dokploy configuration
is external to this repository. Do not enable the route until the production
backend and its business configuration have been identified and verified.

## Inspect and save the current configuration

1. Identify the production Scheduler service, matching contract revision,
   private port, ingress network and healthy instance. A stopped development
   service is not a production target. Verify the production company and
   service mapping; never reuse synthetic CI fixtures.
2. Export the relevant Dokploy domains, Traefik routers/middlewares, Spring
   proxy/CORS settings and Cloudflare cache rules to protected operator storage.
   Do not commit credentials or environment exports.
3. Inspect the actual network shared by Traefik and Spring and determine the
   direct peer address Spring sees. Do not copy an example address. Only Spring
   joins ingress; PostgreSQL and Redis remain on the private backend network.
   Do not publish Spring's port on the host.
4. Confirm Cloudflare proxies the website and origin HTTPS is authenticated
   or restricted to Cloudflare. If no protection exists, configure the provider
   firewall to allow public HTTP/HTTPS only from Cloudflare's current IPv4 and
   IPv6 ranges, preserving administrative access. Check all other hosted sites
   before applying a host-wide firewall change. Docker-published ports can bypass
   UFW; a UFW rule alone is not proof of protection.

## Prepare Spring and cache behavior

- Set `TRUSTED_PROXIES` to an anchored regex matching only the actual Traefik
  peer addresses. Never trust `.*` or an entire shared Docker network. Recheck
  addresses after network changes or container recreation.
- Set `SERVER_TOMCAT_REMOTEIP_REMOTE_IP_HEADER=CF-Connecting-IP`. The backend
  already uses native Tomcat forwarded-header handling and `remoteAddr` for
  rate limiting. The Cloudflare header is trustworthy only behind the protected
  ingress described above. Do not make the Nitro relay forward client IP headers.
- Include `https://kacosmetology.pl` in `CORS_ORIGINS`, retaining existing required
  origins. Include the HTTPS `www` origin too if it serves booking rather than
  redirecting to the canonical host. Keep explicit origins, without wildcards.
- Preserve forwarded HTTPS detection. Verify Spring produces Secure cookies
  through the deployed chain. Do not widen cookie Domain or relax CSRF.
- In Cloudflare, bypass cache for exact `/api` and paths starting `/api/` on
  each host serving booking, including any existing Cache Everything rules.
  Ensure the effective rule wins over other cache settings.
- On the API router, set response `Cache-Control: no-store`, including errors.
  Do not cache responses carrying cookies or authenticated content.

## Configure the edge route

Use Dokploy's domain management on the verified Scheduler service: website
hostname, container port `8080`, path `/api`, HTTPS enabled, Strip Path disabled
and no Internal Path rewrite. Preview the generated configuration before a
Compose redeploy. The effective route must match exact `/api` and `/api/…`,
not `/apiculture`, and have higher priority than the website's host-only route.
If the domain UI cannot express this, use Dokploy's supported custom Traefik
configuration instead; do not leave competing definitions of the API router.

The following is the required dynamic configuration shape. Replace the private
service placeholder with the verified production service DNS name. Set priority
above the inspected website router; `1000` below is an example, not a universal
priority. Use the deployment's existing TLS resolver and entrypoint names.

```yaml
http:
  routers:
    booking-api:
      rule: Host(`kacosmetology.pl`) && (Path(`/api`) || PathPrefix(`/api/`))
      priority: 1000
      entryPoints:
        - websecure
      tls:
        certResolver: letsencrypt
      service: booking-spring
      middlewares:
        - booking-no-store
  services:
    booking-spring:
      loadBalancer:
        passHostHeader: true
        servers:
          - url: http://REPLACE_WITH_PRODUCTION_SCHEDULER_SERVICE:8080
  middlewares:
    booking-no-store:
      headers:
        customResponseHeaders:
          Cache-Control: no-store
```

Apply an equivalent API rule to `www` only if that host serves booking. Keep the
existing HTTP-to-HTTPS behavior. Once on HTTPS, proxy directly without redirecting
API requests to another host. Preserve `/api`, query strings, method, body,
Cookie, Origin, `X-XSRF-TOKEN`, `X-Expected-Session-Context`, `Idempotency-Key`,
response statuses, separate `Set-Cookie` fields and `Retry-After`. No rewrite or
shared cookie jar belongs in this route. Other paths continue to Nitro.

## Acceptance checks

First exercise the same edge configuration against isolated Spring/PostgreSQL/
Redis with mock SMS. Never point fixture-writing tests at production or send
real SMS to test rate limits. Do not log codes, session cookies or request bodies.

- From two distinct source IPs, verify Spring resolves two distinct client IPs.
  Exhaust IP A's request-code allowance (10 requests per rolling 15 minutes)
  and confirm IP B is unaffected, using separate test phones to avoid the
  independent phone limit. Repeat for verification (10 per rolling 5 minutes).
  Confirm 429 retains `Retry-After`. Phone limits and the shared SMS budget remain.
- From IP A, change forged `Forwarded`, `X-Forwarded-For`, `X-Real-IP` and
  `CF-Connecting-IP` headers and confirm they cannot change the effective IP or
  reset its allowance. Confirm direct public access to origin is rejected.
- Verify OTP login/logout, CSRF refresh, separate browser sessions, host-only/
  HttpOnly/Secure/SameSite=Lax SESSION cookies, reservation creation and exact
  key/body replay after a lost response. Ensure no cookie Domain rewriting.
- Verify exact `/api` and nested API paths select Spring while a non-API path
  selects Nitro. Inspect Traefik's selected router/service; a successful response
  alone does not prove Nitro was bypassed. Check queries and writes survive.
- Verify no-store on successful and failed API responses and absence of cached
  API responses at Cloudflare. Check HTTPS recognition and CORS/CSRF errors.

Run `pnpm check` and `pnpm test` for repository changes. Existing
`pnpm test:integration` tests the Nitro transport, not this deployed edge chain;
it cannot establish that production client-IP separation works.

## Switch, monitor and roll back

Prepare origin protection, Spring trust/CORS and cache rules before enabling
the API router. Confirm the backend is healthy before switching traffic. Keep
database volumes, Redis state and unresolved booking submissions intact.

After switching, inspect selected router/service and aggregate 403, 429 and 5xx
errors without adding personal-data logging. Verify existing non-API pages and
other API clients still work. Record environment, time and acceptance results;
do not mark this deployment verified on the strength of Nitro CI tests.

On failure, restore the saved router and associated settings. If that restores
traffic through Nitro, suspend online booking until client-IP routing is fixed;
shared limits are still present on that path. Do not disable limits, trust
arbitrary headers, reset data or remove permanent submission records.

References: [Dokploy domain management](https://docs.dokploy.com/docs/core/domains),
[Compose domains](https://docs.dokploy.com/docs/core/docker-compose/domains),
[Traefik routing rules](https://doc.traefik.io/traefik/routing/routers/),
[Cloudflare IP ranges](https://www.cloudflare.com/ips/).
