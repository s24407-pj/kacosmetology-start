import { describe, expect, it } from 'vitest'
import { loadServiceDetail } from './serviceDetail'

describe('loadServiceDetail', () => {
  it('resolves stationary services only in their own area', () => {
    expect(loadServiceDetail('cosmetology', 'oczyszczanie-wodorowe')?.id).toBe(
      'service-oczyszczanie-wodorowe',
    )
    expect(
      loadServiceDetail('trichology', 'oczyszczanie-wodorowe'),
    ).toBeUndefined()
  })

  it('does not expose online services as detail pages', () => {
    expect(
      loadServiceDetail('trichology', 'konsultacja-trychologiczna-online'),
    ).toBeUndefined()
  })

  it('resolves eye styling only through its presentation specialization', () => {
    expect(loadServiceDetail('eye-styling', 'henna-brwi-z-regulacja')?.id).toBe(
      'service-henna-brwi-z-regulacja',
    )
    expect(
      loadServiceDetail('cosmetology', 'henna-brwi-z-regulacja'),
    ).toBeUndefined()
  })
})
