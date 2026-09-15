import { iconActionStyles } from '@components/ui'
import { scrollToTop } from '@libs/utils'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTopButton() {
  return (
    <button
      type="button"
      onClick={() => {
        scrollToTop()
      }}
      className={iconActionStyles({ className: 'cursor-pointer' })}
      aria-label="Przewiń na górę"
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  )
}
