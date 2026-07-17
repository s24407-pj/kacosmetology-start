import type {
  BusinessProfile,
  SalonLocation,
  SalonLocationId,
} from '@app-types/types'
import { defineOpeningSchedule } from '@libs/openingHours'

export const businessProfile = {
  brand: {
    name: 'Ka.Cosmetology',
    practitionerName: 'Katarzyna Suwalska',
    practitionerNameGenitive: 'Katarzyny Suwalskiej',
    siteUrl: 'https://kacosmetology.pl/',
    email: 'gabinet@kacosmetology.pl',
    socialMedia: {
      instagram: 'https://www.instagram.com/ka.cosmetology',
      facebook: 'https://www.facebook.com/profile.php?id=61579179969990',
    },
    logo: {
      imagePath: '/images/logo.webp',
      imageAlt: 'Logotyp Ka.Cosmetology – monogram w odcieniach burgundu',
    },
    appShortName: 'KA',
  },
  primaryLocationId: 'salon-starogard-gdanski',
  locations: [
    {
      id: 'salon-starogard-gdanski',
      displayName: 'Ka.Cosmetology',
      phone: '+48 726 154 460',
      bookingUrl: 'https://kacosmetology.booksy.com',
      address: {
        streetAddress: 'ul. Paderewskiego 11a',
        postalCode: '83-200',
        locality: 'Starogard Gdański',
        countryCode: 'PL',
      },
      coordinates: {
        latitude: 53.898941431338294,
        longitude: 18.595858632430925,
      },
      map: {
        embedUrl:
          'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d146965.76001793574!2d18.595858632430925!3d53.898941431338294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47029ddcdf06e639%3A0x22e7786a8b623b1a!2sKa.Cosmetology%20Kosmetolog%20%7C%20Trycholog!5e0!3m2!1spl!2spl!4v1757628479347!5m2!1spl!2spl',
      },
      areaServed: { type: 'City', name: 'Starogard Gdański' },
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
    },
  ],
} as const satisfies BusinessProfile

export const getSalonLocation = (
  id: SalonLocationId,
  profile: BusinessProfile = businessProfile,
): SalonLocation => {
  const matches = profile.locations.filter((location) => location.id === id)
  if (matches.length !== 1) {
    throw new Error(
      `Salon location "${id}" must resolve exactly once; found ${matches.length}`,
    )
  }
  return matches[0]
}

export const getPrimarySalonLocation = (
  profile: BusinessProfile = businessProfile,
) => getSalonLocation(profile.primaryLocationId, profile)

export const brand = businessProfile.brand
export const primarySalonLocation = getPrimarySalonLocation()
