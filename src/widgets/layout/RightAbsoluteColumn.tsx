import FacebookSVG from '@components/icons/FacebookSVG'
import InstagramSVG from '@components/icons/InstagramSVG'
import { iconActionStyles, surfaceCardStyles } from '@components/ui'
import { useUI } from '@context/UIContext'
import { brand } from '@data/business'
import { trackPlausibleEvent } from '@libs/analytics'
import { cn } from '@libs/utils'
import PhoneButton from '@widgets/actions/PhoneButton'
import ScrollToTopButton from './ScrollToTopButton'

function SocialLinks({ placement }: { placement: string }) {
  return (
    <>
      <a
        href={brand.socialMedia.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className={iconActionStyles()}
        onClick={() =>
          trackPlausibleEvent('Social Media Click', {
            platform: 'instagram',
            placement,
          })
        }
      >
        <InstagramSVG className="w-6 h-6" />
      </a>
      {brand.socialMedia.facebook && (
        <a
          href={brand.socialMedia.facebook}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className={iconActionStyles()}
          onClick={() =>
            trackPlausibleEvent('Social Media Click', {
              platform: 'facebook',
              placement,
            })
          }
        >
          <FacebookSVG className="w-6 h-6" />
        </a>
      )}
    </>
  )
}

export default function RightAbsoluteColumn() {
  const { showScrollToTop: show } = useUI()

  return (
    <aside
      className={surfaceCardStyles({
        className:
          'fixed bottom-20 right-3 z-40 flex flex-col items-center gap-2 p-2 shadow-raised min-[810px]:bottom-8',
      })}
    >
      <SocialLinks placement="right_column" />
      <PhoneButton />
      <div
        inert={!show}
        className={cn(
          'flex justify-center motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out motion-reduce:transition-none',
          show
            ? 'opacity-100 translate-y-0 pointer-events-auto max-h-20'
            : 'opacity-0 translate-y-2 pointer-events-none max-h-0 overflow-hidden',
        )}
      >
        <ScrollToTopButton />
      </div>
    </aside>
  )
}
