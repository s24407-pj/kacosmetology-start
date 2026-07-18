You are working in the GitHub repository:

`s24407-pj/kacosmetology-start`

The project is a server-rendered website built with TanStack Start, TanStack Router, React 19, Vite, Tailwind CSS 4, Nitro, TypeScript, Vitest, and Playwright.

Your task is to restructure the website so that **Kosmetologia** and **Trychologia** become two clearly separated service areas under one Ka.Cosmetology brand and one domain.

The implementation must improve:

* information architecture,
* user navigation,
* service discovery,
* SEO landing-page structure,
* route-level code splitting,
* homepage performance,
* future extensibility for the blog,
* future replaceability of Booksy with a custom reservation service.

Do not create:

* a second website,
* a second repository,
* a second frontend application,
* a subdomain,
* separate branding,
* duplicated business data.

The result must remain one coherent Ka.Cosmetology website.

Work on a dedicated branch:

```text
feature/cosmetology-trichology-split
```

# Repository preparation

Before changing code:

1. Read and follow:

   * `AGENTS.md`
   * `DESIGN.md`
   * `RUNBOOK.md`
   * existing route conventions
   * feature-directory conventions
   * testing conventions
   * accessibility conventions
2. Inspect:

   * the current homepage composition,
   * navigation and hash-based scrolling,
   * the service catalog and service IDs,
   * service categories,
   * promotion logic,
   * price-history logic,
   * contact and Booksy links,
   * analytics events,
   * responsive-image helpers,
   * public metadata generation,
   * sitemap generation,
   * current TanStack Router code-splitting configuration.
3. Reuse existing abstractions where appropriate.
4. Do not rewrite unrelated code.
5. Preserve the current visual identity, typography, spacing, colors, accessibility standards, and component conventions.
6. Do not duplicate canonical business facts such as practitioner name, location, contact details, domain, or Booksy URL.

# Main objective

Replace the current long single-page structure with a route-oriented architecture.

Implement these primary routes:

```text
/
/kosmetologia
/trychologia
/rezerwacja
```

Support dedicated detail routes:

```text
/kosmetologia/$slug
/trychologia/$slug
```

Use the repository’s actual TanStack Router file conventions.

The conceptual route tree should resemble:

```text
/
├── /kosmetologia
│   ├── /kosmetologia/konsultacja-kosmetologiczna
│   └── /kosmetologia/$slug
├── /trychologia
│   ├── /trychologia/konsultacja-trychologiczna
│   └── /trychologia/$slug
└── /rezerwacja
```

Do not create a hardcoded route file for every service when a clean typed dynamic route can be used.

# Architectural principles

Kosmetologia and Trychologia must be clearly separated in:

* navigation,
* landing pages,
* public URLs,
* content organization,
* service listings,
* page metadata,
* booking context,
* internal linking.

They must continue to share:

* one brand,
* one design system,
* one contact model,
* one location model,
* one service catalog source,
* one promotion engine,
* one price-history mechanism,
* one analytics integration,
* one Booksy configuration,
* one future blog,
* one deployment,
* one sitemap generator.

Do not create separate copies of shared components or business data.

# Homepage redesign

Convert `/` into a focused brand landing page.

The homepage should answer:

* who the practitioner is,
* where the salon is located,
* what the two specializations are,
* why the visitor should trust the salon,
* where the visitor should continue,
* how to book through Booksy.

The homepage should contain approximately:

1. Hero section.
2. Short trust or credibility section.
3. Two prominent specialization cards:

   * Kosmetologia
   * Trychologia
4. Short practitioner introduction.
5. Selected reviews or trust signals.
6. Main reservation CTA.
7. Lightweight location or contact summary where appropriate.

Remove the complete service catalog from the homepage.

The homepage must not import or hydrate:

* the full services UI,
* all service cards,
* all promotion details,
* all service-detail content,
* cosmetology route implementation,
* trichology route implementation,
* reservation-page implementation.

The two specialization cards should be among the most prominent elements below the hero.

Suggested copy direction:

```text
Kosmetologia

Indywidualne terapie skóry, zabiegi pielęgnacyjne i świadoma
opieka kosmetologiczna.

Poznaj ofertę kosmetologiczną
```

```text
Trychologia

Diagnostyka skóry głowy, konsultacje trychologiczne i wsparcie
w problemach dotyczących włosów.

Poznaj ofertę trychologiczną
```

Adapt the final copy to the established Polish tone of the website.

Each specialization card must:

* have an accessible heading,
* include a short description,
* contain a real internal link,
* not use a click handler on a non-interactive element,
* not rely only on color to communicate its specialization,
* preserve visible keyboard focus,
* use an existing or properly optimized image only when useful.

# Main navigation

Update the primary navigation to reflect the new architecture.

Expected top-level navigation:

```text
Kosmetologia
Trychologia
O mnie
Blog
Rezerwacja
```

If the blog route is not implemented yet:

* do not add a broken link,
* do not create a fake placeholder blog,
* keep an obvious insertion point for it in the navigation architecture.

The reservation action should remain visually distinct.

Requirements:

* desktop and mobile navigation,
* keyboard-accessible mobile menu,
* current route indication using `aria-current`,
* visible focus styles,
* minimum touch-target sizes,
* no dependency on homepage hashes for primary service navigation,
* homepage hashes may remain only for sections still present on `/`,
* no dead links to removed section IDs.

Audit and update:

* header links,
* mobile navigation,
* footer links,
* hero CTAs,
* service CTAs,
* voucher links,
* promotion CTAs,
* existing hash navigation,
* Playwright selectors,
* analytics placement values.

# Service data model

Inspect the current service types before modifying them.

Preserve stable service IDs already introduced by the repository.

Each public service should support the concepts below:

```ts
type ServiceArea = 'kosmetologia' | 'trychologia'

interface Service {
  id: ServiceId
  slug: string
  area: ServiceArea
  category: ServiceCategory
  name: string
  shortDescription: string
  description?: string
  price: number
  duration: number
  featured?: boolean
  isPublished?: boolean
}
```

Adapt this model to current repository conventions rather than replacing existing types blindly.

Requirements:

* display names must not act as identifiers,
* `id` must remain stable when presentation copy changes,
* public URLs must use slugs,
* `area` must be explicit,
* categories must not be inferred from translated UI labels,
* promotion applicability must continue using stable IDs,
* price-history logic must continue using stable IDs,
* public links must be generated from typed source data,
* slugs must be deterministic and validated,
* no service may accidentally appear under both areas,
* unpublished services must not receive public detail routes.

Do not create separate duplicated cosmetology and trichology service arrays unless the existing architecture explicitly requires it.

Prefer one canonical catalog with typed filtering.

# Validation

Create or extend production-data validation.

Validate at least:

* unique service IDs,
* unique public slugs within each specialization,
* valid slug format,
* valid service area,
* valid category,
* valid area/category relationship,
* non-empty public name,
* non-empty short description,
* positive price where applicable,
* positive duration where applicable,
* valid related-service references,
* no duplicate related-service IDs,
* all related services exist,
* no self-referencing related-service entries,
* published detail entries can resolve their slug,
* no slug belongs to the wrong specialization,
* homepage featured references resolve correctly,
* no service appears publicly under both specializations unintentionally.

Validation failures must:

* fail tests or the build,
* identify the offending service,
* include actionable messages,
* never silently skip invalid production data.

# Cosmetology landing page

Create `/kosmetologia`.

It should include:

* unique H1,
* concise introduction,
* explanation of the cosmetology approach,
* featured treatments,
* service groups,
* relevant skin concerns,
* explanation of consultation or treatment process,
* trust signals,
* visible FAQ content where supported,
* primary Booksy reservation CTA,
* links to individual cosmetology detail pages.

Possible content organization:

```text
Kosmetologia
├── Konsultacja kosmetologiczna
├── Problemy skórne
│   ├── trądzik
│   ├── przebarwienia
│   ├── skóra wrażliwa
│   └── oznaki starzenia
├── Zabiegi
│   ├── terapie skóry
│   ├── zabiegi pielęgnacyjne
│   └── oprawa oka
└── Umów wizytę
```

Use only content and services supported by repository-controlled data.

Do not fabricate treatments or customer-facing claims.

# Trichology landing page

Create `/trychologia`.

Organize this page primarily around visitor concerns, consultation, and scalp diagnostics rather than only formal treatment names.

It should include:

* unique H1,
* introduction to the trichology offering,
* explanation of consultation,
* explanation of scalp examination where supported,
* common concerns,
* available trichology services,
* consultation process,
* visible FAQ content where supported,
* primary Booksy reservation CTA,
* links to individual trichology detail pages.

Possible information structure:

```text
Trychologia
├── Konsultacja trychologiczna
├── Badanie skóry głowy
├── Najczęstsze problemy
│   ├── wypadanie włosów
│   ├── przerzedzenie włosów
│   ├── łupież
│   ├── łojotok
│   └── świąd skóry głowy
├── Plan postępowania
└── Umów konsultację
```

Use cautious Polish wording.

Requirements:

* distinguish educational content from diagnosis,
* do not promise cures,
* do not guarantee treatment outcomes,
* do not fabricate medical advice,
* do not introduce unsupported medical statistics,
* clearly state where individual consultation is necessary.

# Detail routes

Implement:

```text
/kosmetologia/$slug
/trychologia/$slug
```

Choose and document one consistent model for what a detail page represents.

Prefer actual services or clearly modeled public service/problem pages.

Do not combine unrelated entity types in an untyped object.

Each detail page should include, where data exists:

* breadcrumbs,
* unique H1,
* short lead,
* relevant image,
* intended audience,
* addressed needs or concerns,
* description of the consultation or treatment,
* approximate duration,
* price,
* preparation information,
* appropriate caution or disclaimer,
* related services,
* reservation CTA,
* link back to the parent specialization.

Do not invent:

* contraindications,
* medical instructions,
* preparation requirements,
* guaranteed effects,
* treatment outcomes.

Unknown slugs must use the repository’s standard not-found behavior.

# Current reservation model

Booksy is currently the only reservation system.

A custom reservation service may be built later, but it does not exist yet.

Do not implement or simulate:

* appointment availability,
* appointment slots,
* calendars,
* booking persistence,
* reservation APIs,
* customer accounts,
* payments,
* deposits,
* cancellation,
* rescheduling,
* confirmation emails,
* SMS notifications,
* synchronization with Booksy,
* Booksy API integration,
* Booksy scraping,
* fake booking data.

Do not create speculative abstractions such as:

```text
ReservationProvider
AvailabilityRepository
BookingService
CalendarGateway
PaymentProvider
ReservationRepository
```

Do not create speculative:

* server functions,
* database models,
* API clients,
* domain services,
* webhook endpoints,
* booking-provider interfaces.

The current implementation should remain simple.

# Reservation page

Create or restructure `/rezerwacja` as a lightweight gateway to Booksy.

Its purpose is to:

* explain that booking is handled externally by Booksy,
* help visitors choose the appropriate specialization,
* provide clear outbound Booksy links,
* track booking intent,
* provide contact alternatives for uncertain visitors.

Suggested structure:

```text
Umów wizytę

Wybierz obszar:
- Kosmetologia
- Trychologia
- Konsultacja online
- Voucher

Krótka informacja o wyborze

Przejdź do Booksy

Nie wiesz, co wybrać?
- telefon
- e-mail
- kontakt
```

Display only options currently supported by the service and business data.

The page must explicitly communicate that:

* the visitor is leaving the website,
* Booksy manages appointment selection and confirmation,
* the website itself does not display live availability.

# Canonical Booksy integration

Use the canonical Booksy URL from existing business data.

Do not hardcode or duplicate it inside route components.

All Booksy links must:

* use canonical business configuration,
* remain usable without JavaScript,
* use descriptive Polish link text,
* follow existing external-link conventions,
* use `rel="noopener noreferrer"` when opening a new tab,
* preserve Plausible analytics,
* never transmit personal information to analytics.

Example CTA labels:

```text
Umów wizytę przez Booksy
Zarezerwuj konsultację trychologiczną
Zobacz dostępne terminy w Booksy
Przejdź do rezerwacji
```

Do not use wording suggesting that the Ka.Cosmetology website confirms or stores the reservation.

# Reservation query context

Support lightweight query parameters:

```text
/rezerwacja?area=kosmetologia
/rezerwacja?area=trychologia
/rezerwacja?service=<public-service-slug>
```

These parameters may only:

* highlight a specialization,
* customize page heading or explanatory copy,
* display a matching service summary,
* customize the CTA label,
* attach stable analytics context.

They must not:

* fetch Booksy availability,
* redirect automatically,
* build undocumented Booksy deep links,
* attempt to preselect a Booksy service without a verified supported URL,
* expose internal-only identifiers when a public slug exists.

Example:

```text
/rezerwacja?area=trychologia
```

May render:

```text
Umów konsultację trychologiczną

Wybierz dogodny termin w zewnętrznym systemie Booksy.

Przejdź do Booksy
```

Requirements:

* validate query parameters,
* handle unknown values gracefully,
* unknown values must not crash the page,
* unknown values must not produce a public error,
* SSR output must remain useful,
* no essential content should depend on `useEffect`.

# Booking navigation flow

Primary specialization CTAs should normally use the internal gateway:

```text
/kosmetologia
→ /rezerwacja?area=kosmetologia

/trychologia
→ /rezerwacja?area=trychologia

/kosmetologia/<slug>
→ /rezerwacja?area=kosmetologia&service=<slug>

/trychologia/<slug>
→ /rezerwacja?area=trychologia&service=<slug>
```

The internal reservation page then provides the final Booksy link.

This centralizes:

* booking copy,
* booking analytics,
* canonical URL ownership,
* future provider replacement.

Direct Booksy links may remain only where the existing UX clearly requires them.

Do not create a generic multi-provider booking architecture until a real second provider exists.

# Analytics

Preserve the current Plausible integration.

Use stable event names and properties.

Suggested events:

```text
Specialization Click
Service Detail View
Reservation Area Selected
Booksy Click
Related Service Click
```

Suggested properties:

```text
placement
area
serviceId
serviceSlug
target
```

Requirements:

* use stable service IDs where appropriate,
* do not use mutable display names as analytics identity,
* never send personal data,
* never send customer names,
* never send phone numbers,
* never send email addresses,
* never send dates selected in Booksy,
* fire outbound booking events only on intentional Booksy actions,
* avoid duplicate events from nested handlers,
* do not fire Booksy events merely when rendering `/rezerwacja`.

Suggested placement values:

```text
header
homepage
cosmetology-landing
trichology-landing
service-detail
reservation-page
footer
```

# Promotions and price history

Existing promotion and price-history behavior must continue working.

Promotions may appear:

* on the relevant specialization landing page,
* on matching service detail pages,
* on `/rezerwacja`,
* optionally as a lightweight homepage announcement.

Requirements:

* promotion applicability continues using stable service IDs,
* effective-price calculation remains centralized,
* price-history disclosure remains correct,
* only relevant promotions appear in each specialization,
* route components must not duplicate promotion resolution,
* promotion data must not force the homepage to import the full service catalog UI.

Add tests for promotion visibility across the new routes.

# Code splitting and performance

This restructure must improve homepage performance.

Requirements:

* the homepage must not import the complete service catalog UI,
* cosmetology route code must not load on `/`,
* trichology route code must not load on `/`,
* reservation-page code must not load on `/`,
* detail-route code should be route split,
* article bodies must not be imported if the blog already exists,
* below-the-fold homepage sections should be lazy where appropriate,
* essential SSR content must remain server-rendered,
* avoid hydration-heavy components for static content,
* avoid large client-side dependencies,
* avoid animation libraries,
* avoid state-management libraries,
* do not ship development tools in production.

Use TanStack Router automatic code splitting according to the project’s current supported conventions.

After implementation, inspect the production build and report:

* homepage initial client chunks,
* cosmetology route chunks,
* trichology route chunks,
* reservation route chunks,
* detail route chunks,
* whether the full service catalog remains excluded from the homepage client bundle,
* whether duplicate modules were introduced.

Do not invent a Lighthouse or PageSpeed score.

Report only measured output.

# Server rendering

Preserve TanStack Start SSR.

Important content for these routes must exist in the server-rendered HTML:

```text
/
/kosmetologia
/trychologia
/kosmetologia/$slug
/trychologia/$slug
/rezerwacja
```

Avoid patterns where primary text appears only after client effects.

Do not add server functions for static repository-controlled content unless a concrete need exists.

# SEO

Create unique metadata for every primary route.

## Homepage

Include:

* brand-focused title,
* description covering both specializations,
* canonical `/`,
* Open Graph metadata.

## Kosmetologia

Include:

* unique title,
* unique description,
* canonical `/kosmetologia`,
* Open Graph metadata.

## Trychologia

Include:

* unique title,
* unique description,
* canonical `/trychologia`,
* Open Graph metadata.

## Reservation

Include:

* unique title,
* description explaining Booksy booking,
* canonical `/rezerwacja`,
* appropriate robots behavior.

## Detail routes

Include:

* unique title,
* unique description,
* canonical URL,
* specialization context,
* image where available,
* Open Graph metadata.

Do not keyword-stuff titles.

Reuse canonical brand, practitioner, URL, and location data.

# Structured data

Preserve the existing BeautySalon JSON-LD.

Add structured data only where it matches visible content.

Appropriate additions may include:

* `BreadcrumbList`,
* `Service`,
* `FAQPage` only when visible FAQ content exists.

Requirements:

* structured data must match rendered content,
* do not fabricate reviews,
* do not fabricate ratings,
* do not use unsupported medical schema,
* do not generate hidden FAQ content,
* avoid duplicate entities,
* use canonical business data.

# Internal linking

Implement deliberate internal linking.

Homepage:

```text
/
→ /kosmetologia
→ /trychologia
→ /rezerwacja
```

Cosmetology:

```text
/kosmetologia
→ cosmetology detail pages
→ /rezerwacja?area=kosmetologia
→ relevant blog content when the blog exists
```

Trichology:

```text
/trychologia
→ trichology detail pages
→ /rezerwacja?area=trychologia
→ relevant blog content when the blog exists
```

Detail pages:

```text
detail route
→ parent specialization
→ related services
→ /rezerwacja
```

Do not link to nonexistent future pages.

If the blog already exists:

* show only relevant category content,
* do not import all article bodies into specialization routes,
* use only lightweight article metadata for previews.

# Suggested reusable components

Inspect existing components before adding new ones.

Possible new reusable components:

```text
SpecializationCard
SpecializationHero
SpecializationCTA
ServiceCard
ServiceGrid
ProblemCard
ConsultationProcess
ServiceDetailHeader
ServiceFacts
RelatedServices
ReservationAreaCard
Breadcrumbs
BooksyCTA
```

Do not create a parallel design system.

Shared elements must live in an appropriate shared feature or UI layer.

Area-specific copy and data should remain close to their feature or canonical content configuration.

# Suggested route structure

Adapt this to the actual repository:

```text
src/routes/
├── index.tsx
├── kosmetologia/
│   ├── index.tsx
│   └── $slug.tsx
├── trychologia/
│   ├── index.tsx
│   └── $slug.tsx
└── rezerwacja.tsx
```

Possible feature structure:

```text
src/features/
├── specializations/
│   ├── components/
│   ├── data/
│   ├── validation/
│   └── types.ts
├── cosmetology/
│   ├── components/
│   └── pages/
├── trichology/
│   ├── components/
│   └── pages/
└── reservation/
    ├── components/
    └── pages/
```

Do not force this structure when it conflicts with stronger existing repository conventions.

# Content migration

Reuse current content from:

* the homepage,
* services catalog,
* process section,
* practitioner section,
* promotions,
* contact section,
* existing FAQs,
* booking CTAs.

Map content into the new routes.

Do not rewrite all copy unnecessarily.

Requirements:

* shared content remains shared,
* specialization-specific content appears only in the relevant area,
* avoid duplicated filler paragraphs,
* preserve existing factual accuracy,
* do not introduce unsupported medical content.

# Images

Reuse existing responsive-image helpers.

Requirements:

* explicit image dimensions or aspect-ratio reservation,
* WebP or AVIF where appropriate,
* responsive `srcSet`,
* correct `sizes`,
* lazy-load below-the-fold images,
* do not lazy-load a true LCP image,
* prevent layout shift,
* meaningful alt text,
* decorative images must use empty alt text,
* do not add large placeholder images.

# Accessibility

Meet the repository’s established accessibility standards.

At minimum:

* one H1 per route,
* logical heading hierarchy,
* valid landmarks,
* semantic navigation,
* accessible breadcrumbs,
* `aria-current` for current navigation,
* keyboard-operable mobile navigation,
* visible focus indicators,
* descriptive links,
* no nested interactive elements,
* no clickable non-interactive cards,
* specialization differences not communicated by color alone,
* decorative icons hidden from screen readers,
* external Booksy links clearly described,
* minimum target sizes,
* reduced-motion preferences respected.

Extend axe-based tests to the new routes.

# Sitemap and generated public metadata

Inspect the current generated-metadata pipeline.

Extend sitemap generation to include:

```text
/
/kosmetologia
/trychologia
/rezerwacja
/kosmetologia/<published-slug>
/trychologia/<published-slug>
```

Requirements:

* generate detail URLs from typed source data,
* do not maintain a duplicated manual URL list,
* exclude hidden or unpublished entries,
* preserve deterministic generation,
* preserve generated-file drift checks,
* update sitemap tests,
* update `llms.txt` only when consistent with existing conventions.

Audit old public service hashes.

Where practical:

* preserve compatibility,
* redirect or map meaningful old links,
* do not silently leave dead URLs.

# Unit tests

Add or update tests covering at least:

* service filtering by specialization,
* slug resolution,
* unknown slug behavior,
* unique slug validation,
* valid and invalid service areas,
* area/category validation,
* related-service validation,
* featured homepage references,
* reservation query parsing,
* reservation area context,
* reservation service context,
* unknown reservation area,
* unknown reservation service,
* canonical Booksy URL ownership,
* promotion filtering by specialization,
* sitemap route generation.

# Component and route tests

Cover:

* homepage specialization cards,
* cosmetology landing page,
* trichology landing page,
* cosmetology detail page,
* trichology detail page,
* reservation page,
* reservation context rendering,
* breadcrumbs,
* active navigation state,
* Booksy external-link attributes,
* unknown detail slug not found,
* no internal appointment calendar,
* no fake availability UI.

# Analytics tests

Verify:

* specialization clicks use correct area,
* service detail events use stable identity,
* Booksy events fire once,
* Booksy events fire only on click,
* reservation-page rendering does not fire a Booksy event,
* no personal data is included,
* placement values are stable and meaningful.

# Playwright tests

Add or update E2E coverage for:

1. Homepage loads.
2. Homepage navigates to Kosmetologia.
3. Homepage navigates to Trychologia.
4. A cosmetology detail page opens.
5. A trichology detail page opens.
6. `/rezerwacja` loads.
7. Cosmetology reservation context loads.
8. Trichology reservation context loads.
9. Booksy CTA points to the canonical external URL.
10. Mobile navigation works.
11. Browser back and forward navigation works.
12. Direct route refresh works.
13. Unknown detail slug returns not found.
14. Unknown reservation query values do not break the page.
15. Main routes have no serious axe violations.

Reuse existing page objects and test helpers.

Avoid selectors based only on CSS classes.

# Documentation

Update repository documentation to explain:

* the new route architecture,
* how services are assigned to Kosmetologia or Trychologia,
* how to add a new public service,
* how to choose a slug,
* how related services work,
* how homepage featured services are configured,
* how Booksy links are centrally owned,
* how `/rezerwacja` query context works,
* how a future custom reservation service could replace the final Booksy boundary,
* how sitemap URLs are generated,
* which validation commands to run.

Do not document a reservation backend that does not exist.

# Non-goals

Do not implement:

* a second domain,
* separate branding,
* a second frontend,
* CMS integration,
* native reservations,
* Booksy API integration,
* booking availability,
* appointment calendars,
* customer accounts,
* authentication,
* payments,
* deposits,
* booking persistence,
* booking webhooks,
* reservation database tables,
* reservation emails or SMS,
* video consultations,
* multilingual content,
* medical records,
* unrelated analytics migration,
* unrelated promotion-engine rewrite,
* a complete visual redesign,
* blog implementation unless it already exists.

# Implementation order

Proceed in this order:

1. Inspect repository conventions.
2. Audit the current homepage, routes, hashes, and links.
3. Audit service IDs, categories, promotions, and price history.
4. Define the specialization and slug model.
5. Add or extend validation.
6. Add the new route structure.
7. Refactor navigation.
8. Simplify the homepage.
9. Build `/kosmetologia`.
10. Build `/trychologia`.
11. Build detail routes.
12. Build the lightweight `/rezerwacja` Booksy gateway.
13. Update internal CTAs.
14. Preserve promotions and price history.
15. Update analytics.
16. Update SEO and structured data.
17. Extend sitemap and generated metadata.
18. Add and update tests.
19. Run the full validation suite.
20. Inspect production code splitting.
21. Produce a detailed implementation report.

# Required commands

Run the repository’s actual validation commands.

At minimum, run the closest available equivalents of:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm run validate
```

Run focused tests during development before the complete suite.

Do not claim a command passed unless it was actually executed.

When blocked by the environment, report:

* the exact command,
* the exact error,
* whether it is a code or environment issue,
* which subset completed successfully.

# Performance verification

After the production build:

1. Inspect emitted client assets.
2. Confirm that `/` does not contain the complete service catalog UI.
3. Confirm that cosmetology code is route split.
4. Confirm that trichology code is route split.
5. Confirm that reservation-page code is route split.
6. Confirm that detail-route code is split where supported.
7. Check for duplicated modules.
8. Verify development tools are absent from production.
9. Verify the hero image remains correctly preloaded.
10. Verify specialization cards do not introduce layout shift.

Do not invent performance scores.

# Acceptance criteria

The task is complete only when:

* `/` is a focused brand homepage,
* `/kosmetologia` exists,
* `/trychologia` exists,
* `/rezerwacja` exists,
* `/rezerwacja` clearly states that booking is handled by Booksy,
* specialization detail routes resolve from typed data,
* unknown slugs return not found,
* the full service catalog is removed from the homepage,
* navigation uses routes instead of obsolete service hashes,
* canonical service IDs remain stable,
* promotions continue to work,
* price-history logic continues to work,
* reservation query context works,
* unknown reservation queries are handled safely,
* all primary Booksy CTAs use canonical business data,
* Booksy analytics fire exactly once,
* no fake reservation UI exists,
* no speculative reservation backend exists,
* SEO metadata is unique,
* structured data matches visible content,
* sitemap routes are generated,
* accessibility tests cover the new routes,
* route code splitting is confirmed,
* build and validation commands pass,
* documentation is updated,
* no unrelated regressions are introduced.

# Final implementation report

After completing the work, provide:

1. Architecture summary.
2. Previous and new route structure.
3. Created, modified, and removed files.
4. Service data-model changes.
5. Slug and validation rules.
6. Homepage changes.
7. Kosmetologia implementation.
8. Trychologia implementation.
9. Reservation and Booksy integration.
10. URL compatibility decisions.
11. Promotion and price-history impact.
12. SEO and structured-data changes.
13. Sitemap and public-metadata changes.
14. Analytics changes.
15. Accessibility changes.
16. Tests added and updated.
17. Commands run and exact results.
18. Production build and code-splitting observations.
19. Remaining limitations.
20. Recommended next step.

Do not stop after producing a proposal.

Inspect the repository, implement the changes, run the available tests, and report the actual results.
