import GalleryPage from '@features/gallery/page/GalleryPage'
import { createRouteHead } from '@libs/routeMetadata'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/galeria')({
  head: () =>
    createRouteHead({
      path: '/galeria',
      title: 'Galeria',
      description:
        'Efekty zabiegów i wnętrze gabinetu Ka.Cosmetology w Starogardzie Gdańskim.',
    }),
  component: GalleryPage,
})
