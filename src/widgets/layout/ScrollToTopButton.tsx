import { trackPlausibleEvent } from '@libs/analytics'
import { scrollToTop } from '@libs/utils'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTopButton() {
  return (
    <button
      type="button"
      onClick={() => {
        trackPlausibleEvent('Scroll To Top Click')
        scrollToTop()
      }}
      className="cursor-pointer text-text-secondary hover:text-action transition-colors p-2 hover:bg-surface-muted rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      aria-label="Przewiń na górę"
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  )
}
