import { loadServiceDetail } from '@features/services/model/serviceDetail'
import { ServiceDetailPage } from '@features/services/page/ServiceDetailPage'
import { createRouteHead } from '@libs/routeMetadata'
import { createFileRoute, notFound, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/kosmetologia/$slug')({
  codeSplitGroupings: [['loader'], ['component']],
  loader: ({ params }) => {
    const service = loadServiceDetail('cosmetology', params.slug)
    if (!service && loadServiceDetail('eye-styling', params.slug)) {
      throw redirect({
        to: '/oprawa-oka/$slug',
        params: { slug: params.slug },
        replace: true,
      })
    }
    if (!service) throw notFound()
    return { service }
  },
  head: ({ loaderData }) =>
    loaderData
      ? createRouteHead({
          path: `/kosmetologia/${loaderData.service.slug}`,
          title: loaderData.service.name,
          description: loaderData.service.shortDescription,
        })
      : {},
  component: RouteComponent,
})

function RouteComponent() {
  return <ServiceDetailPage service={Route.useLoaderData().service} />
}
