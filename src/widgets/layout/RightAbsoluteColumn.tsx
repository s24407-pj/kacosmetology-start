import FacebookSVG from '@components/icons/FacebookSVG'
import InstagramSVG from '@components/icons/InstagramSVG'
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
        className="inline-flex h-10 w-10 items-center justify-center text-text-secondary hover:text-action transition-colors hover:bg-surface-muted rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40"
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
          className="inline-flex h-10 w-10 items-center justify-center text-text-secondary hover:text-action transition-colors hover:bg-surface-muted rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40"
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
    <aside className="fixed bottom-20 right-3 z-40 flex flex-col items-center gap-2 rounded-lg border border-border-default bg-surface p-2 shadow-subtle min-[810px]:bottom-8">
      <SocialLinks placement="right_column" />
      <PhoneButton />
      <div
        inert={!show}
        className={cn(
          'flex justify-center transition-all duration-300 ease-out',
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
