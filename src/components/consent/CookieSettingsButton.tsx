import { actionLinkStyles } from '@components/ui'
import { useConsent } from '@libs/consent'
import { cn } from '@libs/utils'

type CookieSettingsButtonProps = {
  className?: string
}

export function CookieSettingsButton({ className }: CookieSettingsButtonProps) {
  const { openSettings } = useConsent()

  return (
    <button
      type="button"
      onClick={openSettings}
      className={cn(
        actionLinkStyles({ variant: 'text', size: 'xs' }),
        'min-h-0 px-0 py-0 text-sm font-normal text-white/65 hover:text-white',
        className,
      )}
    >
      Zarządzaj cookies
    </button>
  )
}
