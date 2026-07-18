import { Section, SectionHeader } from '@components/ui'
import { type GalleryItem, galleryItems } from '@data/gallery'
import {
  GALLERY_WIDTHS,
  IMAGE_SIZES,
  webpFallbackSrc,
  webpSrcSet,
} from '@libs/responsiveImage'
import { cn } from '@libs/utils'

export default function GallerySection() {
  return (
    <Section
      id="gabinet"
      background="white"
      containerClassName="xl:max-w-[85rem]"
    >
      <SectionHeader
        title="Galeria"
        eyebrow="Gabinet"
        subtitle="Zobacz wnętrze profesjonalnego gabinetu."
        gradient
        className="mb-10 sm:mb-14"
      />

      <div
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 items-start gap-4 sm:gap-6 lg:gap-8"
        aria-label="Galeria zdjęć"
      >
        {galleryItems.map((item) => (
          <figure
            key={item.id}
            className={cn(
              'group relative self-start overflow-hidden rounded-lg border border-border-default bg-surface shadow-subtle transition-colors duration-200 hover:border-action/40',
              item.className ?? '',
            )}
          >
            <div className={cn('overflow-hidden', getAspectClass(item.aspect))}>
              {item.src ? (
                <img
                  src={webpFallbackSrc(item.src)}
                  srcSet={webpSrcSet(item.src, GALLERY_WIDTHS)}
                  sizes={IMAGE_SIZES.gallery}
                  alt={item.alt ?? item.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <Placeholder
                  aspect={item.aspect}
                  title={item.title}
                  Icon={item.icon}
                />
              )}
            </div>
          </figure>
        ))}
      </div>
    </Section>
  )
}

function Placeholder({
  aspect,
  title,
  Icon,
}: {
  aspect: GalleryItem['aspect']
  title: string
  Icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div
      className={cn(
        getAspectClass(aspect),
        'bg-surface-strong flex items-center justify-center',
      )}
    >
      <div className="text-center text-text-muted">
        {Icon ? (
          <Icon className="w-10 h-10 mx-auto mb-2 text-action/60" />
        ) : null}
        <p className="text-sm font-medium">{title}</p>
      </div>
    </div>
  )
}

function getAspectClass(a: GalleryItem['aspect']) {
  switch (a) {
    case '16/10':
      return 'aspect-[16/10]'
    case '10/16':
      return 'aspect-[10/16]'
    case '1/1':
      return 'aspect-square'
    case '4/3':
      return 'aspect-[4/3]'
    default:
      return 'aspect-video'
  }
}
