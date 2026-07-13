import type { Contact, ContactLinkData } from '@app-types/types'

export const contact: Contact = {
  phone: '+48 726 154 460',
  email: 'gabinet@kacosmetology.pl',
  address: {
    street: 'ul. Paderewskiego 11a',
    city: 'Starogard Gdański',
    postalCode: '83-200',
  },
  openingHours: {
    poniedziałek: '09:00 - 17:00',
    wtorek: '09:00 - 17:00',
    środa: '09:00 - 17:00',
    czwartek: '10:00 - 18:00',
    piątek: '10:00 - 18:00',
    sobota: '09:00 - 14:00',
    niedziela: 'Zamknięte',
  },
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
