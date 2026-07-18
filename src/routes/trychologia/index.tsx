import TrichologyPage from '@features/trichology/page/TrichologyPage'
import { createRouteHead } from '@libs/routeMetadata'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/trychologia/')({
  head: () =>
    createRouteHead({
      path: '/trychologia',
      title: 'Trychologia',
      description:
        'Konsultacje trychologiczne, badanie skóry głowy i indywidualny plan postępowania.',
    }),
  component: TrichologyPage,
})
