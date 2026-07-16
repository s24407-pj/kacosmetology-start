import App from '@app/App'
import { RenderTimeProvider } from '@context/RenderTimeProvider'
import {
  PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY,
  resolveRenderTimeSnapshot,
} from '@libs/renderTime'
import { scheduleDeferredWork } from '@libs/scheduleDeferredWork'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useEffect } from 'react'

interface HomeSearch {
  [key: string]: unknown
  [PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY]?: string
}

function validateHomeSearch(search: unknown): HomeSearch {
  const values =
    typeof search === 'object' && search !== null
      ? (search as Record<string, unknown>)
      : {}
  const requestedReferenceTime =
    typeof values[PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY] === 'string'
      ? values[PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY]
      : undefined

  return {
    ...values,
    [PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY]: requestedReferenceTime,
  }
}

const getRenderTimeSnapshot = createServerFn({ method: 'GET' })
  .validator((requestedReferenceTime: string | undefined) => {
    return requestedReferenceTime
  })
  .handler(({ data: requestedReferenceTime }) => {
    return resolveRenderTimeSnapshot({
      now: new Date(),
      requestedReferenceTime,
      allowReferenceTime: process.env.PLAYWRIGHT_TEST_MODE === '1',
    })
  })

export const Route = createFileRoute('/')({
  validateSearch: validateHomeSearch,
  loaderDeps: ({ search }) => ({
    requestedReferenceTime:
      search[PLAYWRIGHT_REFERENCE_TIME_QUERY_KEY] ?? undefined,
  }),
  loader: async ({ deps }) => ({
    renderTimeSnapshot: await getRenderTimeSnapshot({
      data: deps.requestedReferenceTime,
    }),
  }),
  component: Home,
})

function Home() {
  const { renderTimeSnapshot } = Route.useLoaderData()

  useEffect(() => {
    return scheduleDeferredWork()
  }, [])

  return (
    <RenderTimeProvider snapshot={renderTimeSnapshot}>
      <App />
    </RenderTimeProvider>
  )
}
