import { brand, primarySalonLocation } from '@data/business'
import { describe, expect, it } from 'vitest'
import { createContactLinks, getContactHref } from './contactLinks'

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

describe('createContactLinks', () => {
  it('projects location and brand channels in stable order', () => {
    expect(createContactLinks(brand, primarySalonLocation)).toEqual([
      {
        type: 'phone',
        label: 'Telefon',
        text: primarySalonLocation.phone,
        value: primarySalonLocation.phone,
      },
      {
        type: 'email',
        label: 'Email',
        text: brand.email,
        value: brand.email,
      },
      {
        type: 'instagram',
        label: 'Instagram',
        text: '@ka.cosmetology',
        value: brand.socialMedia.instagram,
        external: true,
      },
      {
        type: 'facebook',
        label: 'Facebook',
        text: brand.name,
        value: brand.socialMedia.facebook,
        external: true,
      },
    ])
  })

  it('omits an absent optional Facebook channel', () => {
    const withoutFacebook = {
      ...brand,
      socialMedia: { instagram: brand.socialMedia.instagram },
    }
    expect(
      createContactLinks(withoutFacebook, primarySalonLocation).map(
        ({ type }) => type,
      ),
    ).toEqual(['phone', 'email', 'instagram'])
  })
})
