import TrichologyPage from '@features/trichology/page/TrichologyPage'
import { createRouteHead, routeSocialImages } from '@libs/routeMetadata'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/trychologia/')({
  head: () =>
    createRouteHead({
      path: '/trychologia',
      title: 'Trycholog Starogard Gdański',
      description:
        'Trycholog w Starogardzie Gdańskim. Konsultacje trychologiczne, badanie skóry głowy i indywidualne terapie problemów skóry głowy oraz włosów.',
      socialImage: routeSocialImages.trichology,
    }),
  component: TrichologyPage,
})
