// Gallery types and data

export type GalleryItem = {
  id: string
  title: string
  subtitle?: string
  src?: string
  aspect: '16/10' | '10/16' | '1/1' | '4/3'
  icon?: React.ComponentType<{ className?: string }>
  className?: string
  alt?: string
}

export const galleryItems: GalleryItem[] = [
  {
    id: 'witryna',
    title: 'Elewacja gabinetu',
    subtitle: 'Ka.Cosmetology w centrum Starogardu Gdańskiego',
    src: '/images/gallery/witryna.webp',
    aspect: '16/10',
    alt: 'Wejście do gabinetu Ka.Cosmetology',
  },
  {
    id: 'drzwi',
    title: 'Wejście do Ka.Cosmetology',
    subtitle: 'Drzwi wejściowe do gabinetu Ka.Cosmetology',
    src: '/images/gallery/drzwi.webp',
    aspect: '16/10',
    alt: 'Drzwi wejściowe do gabinetu Ka.Cosmetology',
  },
  {
    id: 'lozko',
    title: 'Stanowisko zabiegowe',
    subtitle: 'Komfortowe łóżko do zabiegów kosmetologicznych',
    src: '/images/gallery/lozko.webp',
    aspect: '16/10',
    alt: 'Stanowisko zabiegowe z łóżkiem w gabinecie',
  },
  {
    id: 'urzadzenie',
    title: 'Nowoczesny sprzęt',
    subtitle: 'Profesjonalne urządzenia do zabiegów',
    src: '/images/gallery/urzadzenie.webp',
    aspect: '16/10',
    alt: 'Nowoczesne urządzenie kosmetologiczne w gabinecie',
  },
]
