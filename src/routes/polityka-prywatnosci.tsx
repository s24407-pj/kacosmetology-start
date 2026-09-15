import PrivacyPolicyPage from '@features/legal/page/PrivacyPolicyPage'
import { createRouteHead, routeSocialImages } from '@libs/routeMetadata'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/polityka-prywatnosci')({
  head: () =>
    createRouteHead({
      path: '/polityka-prywatnosci',
      title: 'Polityka prywatności',
      description:
        'Informacje o ochronie danych osobowych i plikach cookies w Ka.Cosmetology.',
      socialImage: routeSocialImages.home,
    }),
  component: PrivacyPolicyPage,
})
