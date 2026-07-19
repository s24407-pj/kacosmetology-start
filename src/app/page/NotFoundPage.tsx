import { actionLinkStyles, PageHero } from '@components/ui'
import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <PageHero
      align="center"
      className="flex-1"
      maxWidth="medium"
      eyebrow="Błąd 404"
      title="Nie znaleziono strony"
      description="Adres mógł się zmienić albo strona nie jest już dostępna."
      actions={
        <Link to="/" className={actionLinkStyles()}>
          Wróć na stronę główną
        </Link>
      }
    />
  )
}
