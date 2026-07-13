import App from '@app/App'
import { RenderTimeProvider } from '@context/RenderTimeProvider'
import { scheduleDeferredWork } from '@libs/scheduleDeferredWork'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  loader: () => ({ renderedAt: new Date().toISOString() }),
  component: Home,
})

function Home() {
  const { renderedAt } = Route.useLoaderData()

  useEffect(() => {
    return scheduleDeferredWork()
  }, [])

  return (
    <RenderTimeProvider initialTimestamp={renderedAt}>
      <App />
    </RenderTimeProvider>
  )
}
