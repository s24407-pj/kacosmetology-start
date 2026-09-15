import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { captureAttribution, getAttributionContext } from './attribution'

const STORAGE_KEY = 'analytics.attribution'

describe('attribution', () => {
  beforeEach(() => {
    sessionStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    sessionStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  it('captures utm and click ids from the URL', () => {
    window.history.replaceState(
      {},
      '',
      '/?utm_source=google&utm_medium=cpc&gclid=g123&fbclid=f456',
    )

    captureAttribution()

    expect(getAttributionContext()).toMatchObject({
      utm_source: 'google',
      utm_medium: 'cpc',
      gclid: 'g123',
      fbclid: 'f456',
    })
  })

  it('does not overwrite existing values with empty params on later pages', () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ utm_source: 'google', gclid: 'keep-me' }),
    )
    window.history.replaceState({}, '', '/uslugi')

    captureAttribution()

    expect(getAttributionContext()).toEqual({
      utm_source: 'google',
      gclid: 'keep-me',
    })
  })

  it('merges new non-empty params into the existing session context', () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ utm_source: 'google' }),
    )
    window.history.replaceState({}, '', '/?utm_campaign=spring&fbclid=new')

    captureAttribution()

    expect(getAttributionContext()).toEqual({
      utm_source: 'google',
      utm_campaign: 'spring',
      fbclid: 'new',
    })
  })
})
