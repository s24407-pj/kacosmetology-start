import EyeStylingPage from '@features/eye-styling/page/EyeStylingPage'
import { createRouteHead } from '@libs/routeMetadata'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/oprawa-oka/')({
  head: () =>
    createRouteHead({
      path: '/oprawa-oka',
      title: 'Oprawa oka',
      description:
        'Stylizacja brwi i rzęs dopasowana do urody i oczekiwanego efektu w Starogardzie Gdańskim.',
    }),
  component: EyeStylingPage,
})
