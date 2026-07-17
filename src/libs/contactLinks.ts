import type {
  BrandProfile,
  ContactLinkData,
  ContactLinkType,
  SalonLocation,
} from '@app-types/types'

export const createContactLinks = (
  brand: BrandProfile,
  location: SalonLocation,
): ContactLinkData[] => [
  {
    type: 'phone',
    label: 'Telefon',
    text: location.phone,
    value: location.phone,
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
  ...(brand.socialMedia.facebook
    ? [
        {
          type: 'facebook' as const,
          label: 'Facebook',
          text: brand.name,
          value: brand.socialMedia.facebook,
          external: true,
        },
      ]
    : []),
]

export const getContactHref = (type: ContactLinkType, value: string) => {
  if (type === 'phone') {
    return `tel:${value.replace(/\s+/g, '')}`
  }

  if (type === 'email') {
    return `mailto:${value}`
  }

  return value
}
