import { loadServiceDetail } from '@features/services/model/serviceDetail'
import { ServiceDetailPage } from '@features/services/page/ServiceDetailPage'
import { createRouteHead } from '@libs/routeMetadata'
import { createFileRoute, notFound } from '@tanstack/react-router'

export const Route = createFileRoute('/trychologia/$slug')({
  codeSplitGroupings: [['loader'], ['component']],
  loader: ({ params }) => {
    const service = loadServiceDetail('trichology', params.slug)
    if (!service) throw notFound()
    return { service }
  },
  head: ({ loaderData }) =>
    loaderData
      ? createRouteHead({
          path: `/trychologia/${loaderData.service.slug}`,
          title: loaderData.service.name,
          description: loaderData.service.shortDescription,
        })
      : {},
  component: RouteComponent,
})

function RouteComponent() {
  return <ServiceDetailPage service={Route.useLoaderData().service} />
}
