import type { Contact, ContactLinkData } from '@app-types/types'
import { defineOpeningSchedule } from '@libs/openingHours'

export const contact: Contact = {
  phone: '+48 726 154 460',
  email: 'gabinet@kacosmetology.pl',
  address: {
    street: 'ul. Paderewskiego 11a',
    city: 'Starogard Gdański',
    postalCode: '83-200',
  },
  openingSchedule: defineOpeningSchedule({
    timeZone: 'Europe/Warsaw',
    days: {
      monday: {
        status: 'open',
        slots: [{ opens: '09:00', closes: '17:00' }],
      },
      tuesday: {
        status: 'open',
        slots: [{ opens: '09:00', closes: '17:00' }],
      },
      wednesday: {
        status: 'open',
        slots: [{ opens: '09:00', closes: '17:00' }],
      },
      thursday: {
        status: 'open',
        slots: [{ opens: '10:00', closes: '18:00' }],
      },
      friday: {
        status: 'open',
        slots: [{ opens: '10:00', closes: '18:00' }],
      },
      saturday: {
        status: 'open',
        slots: [{ opens: '09:00', closes: '14:00' }],
      },
      sunday: { status: 'closed' },
    },
  }),
  socialMedia: {
    instagram: 'https://www.instagram.com/ka.cosmetology',
    facebook: 'https://www.facebook.com/profile.php?id=61579179969990',
  },
  booksy: 'https://kacosmetology.booksy.com',
}

export const contactLinks: ContactLinkData[] = [
  {
    type: 'phone',
    label: 'Telefon',
    text: contact.phone,
    value: contact.phone,
  },
  {
    type: 'email',
    label: 'Email',
    text: contact.email,
    value: contact.email,
  },
  {
    type: 'instagram',
    label: 'Instagram',
    text: '@ka.cosmetology',
    value: contact.socialMedia.instagram,
    external: true,
  },
  ...(contact.socialMedia.facebook
    ? [
        {
          type: 'facebook' as const,
          label: 'Facebook',
          text: 'Ka.Cosmetology',
          value: contact.socialMedia.facebook,
          external: true,
        },
      ]
    : []),
]
