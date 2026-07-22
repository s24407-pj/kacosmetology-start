import GalleryPage from '@features/gallery/page/GalleryPage'
import { createRouteHead, routeSocialImages } from '@libs/routeMetadata'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/galeria')({
  head: () =>
    createRouteHead({
      path: '/galeria',
      title: 'Galeria',
      description:
        'Efekty zabiegów i wnętrze gabinetu Ka.Cosmetology w Starogardzie Gdańskim.',
      socialImage: routeSocialImages.gallery,
    }),
  component: GalleryPage,
})
