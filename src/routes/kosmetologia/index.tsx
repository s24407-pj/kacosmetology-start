import CosmetologyPage from '@features/cosmetology/page/CosmetologyPage'
import { createRouteHead } from '@libs/routeMetadata'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/kosmetologia/')({
  head: () =>
    createRouteHead({
      path: '/kosmetologia',
      title: 'Kosmetologia',
      description:
        'Indywidualne terapie skóry i zabiegi kosmetologiczne w Starogardzie Gdańskim.',
    }),
  component: CosmetologyPage,
})
