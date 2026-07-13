import { describe, expect, it } from 'vitest'
import { getContactHref } from './contactLinks'

describe('getContactHref', () => {
  it('formats phone links by stripping whitespace', () => {
    expect(getContactHref('phone', '+48 726 154 460')).toBe('tel:+48726154460')
  })

  it('formats email links with mailto prefix', () => {
    expect(getContactHref('email', 'gabinet@kacosmetology.pl')).toBe(
      'mailto:gabinet@kacosmetology.pl',
    )
  })

  it('returns social links unchanged', () => {
    expect(
      getContactHref('instagram', 'https://www.instagram.com/ka.cosmetology'),
    ).toBe('https://www.instagram.com/ka.cosmetology')
    expect(
      getContactHref(
        'facebook',
        'https://www.facebook.com/profile.php?id=61579179969990',
      ),
    ).toBe('https://www.facebook.com/profile.php?id=61579179969990')
  })
})
