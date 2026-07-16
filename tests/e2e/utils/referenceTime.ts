import { PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY } from '../../../src/libs/renderTime'

export function homepageUrlAt(referenceTime: string) {
  const search = new URLSearchParams({
    [PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY]: referenceTime,
  })

  return `/?${search.toString()}`
}
