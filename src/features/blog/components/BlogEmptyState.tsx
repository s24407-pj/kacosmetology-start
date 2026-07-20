export function BlogEmptyState() {
  return (
    <div
      className="rounded-md border border-border-default bg-surface-muted px-6 py-10"
      role="status"
    >
      <p className="font-display text-xl text-text-primary">
        Brak artykułów do wyświetlenia
      </p>
      <p className="mt-3 text-text-secondary">
        Nie znaleziono opublikowanych wpisów dla wybranych filtrów. Wyczyść
        filtry albo zajrzyj ponownie wkrótce.
      </p>
    </div>
  )
}
