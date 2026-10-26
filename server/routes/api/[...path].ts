import { defineHandler, HTTPError, proxyRequest } from 'nitro/h3'

/** Fixed, operator-configured upstream. Browser cookies remain host-only on this origin. */
export default defineHandler((event) => {
  const configured = process.env.SCHEDULER_API_ORIGIN
  if (!configured)
    throw new HTTPError({
      status: 503,
      message: 'Booking API is not configured',
    })
  let origin: URL
  try {
    origin = new URL(configured)
  } catch {
    throw new HTTPError({ status: 503, message: 'Invalid booking API origin' })
  }
  if (
    !['http:', 'https:'].includes(origin.protocol) ||
    origin.username ||
    origin.password ||
    origin.pathname !== '/' ||
    origin.search ||
    origin.hash
  ) {
    throw new HTTPError({ status: 503, message: 'Invalid booking API origin' })
  }
  event.res.headers.set('Cache-Control', 'no-store')
  return proxyRequest(
    event,
    new URL(event.url.pathname + event.url.search, origin).href,
    {
      // Never promote browser-provided proxy identity into Spring's remoteAddr.
      // Deploy a trusted edge /api route when per-client IP limits are needed.
      filterHeaders: [...event.req.headers.keys()].filter(
        (name) =>
          name === 'forwarded' ||
          name === 'x-real-ip' ||
          name === 'cf-connecting-ip' ||
          name.startsWith('x-forwarded-'),
      ),
    },
  )
})
