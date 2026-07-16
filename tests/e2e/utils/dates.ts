/**
 * Shared fixed dates for e2e tests.
 * Date-sensitive scenarios pass these through the reference-time navigation
 * contract so SSR and hydration use the same instant.
 */

/** Monday 2024-03-04 at 12:00 Warsaw time (CET, UTC+1) — salon is open (09:00–17:00). */
export const OPEN_WEEKDAY_DATE = '2024-03-04T12:00:00+01:00'

/** 2025-09-15 — "all services –20%" promotion is active. */
export const SEPTEMBER_PROMOTION_DATE = '2025-09-15T12:00:00.000Z'

/** 2025-10-15 — "oczyszczanie wodorowe –20%" promotion is active. */
export const OCTOBER_PROMOTION_DATE = '2025-10-15T12:00:00.000Z'
