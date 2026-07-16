import type { RenderTimeSnapshot } from '@libs/renderTime'
import {
  createContext,
  type PropsWithChildren,
  use,
  useEffect,
  useMemo,
  useState,
} from 'react'

const RenderTimeContext = createContext<Date | null>(null)
const CLIENT_READY_ATTRIBUTE = 'data-react-client-ready'

export function RenderTimeProvider({
  snapshot,
  children,
}: PropsWithChildren<{ snapshot: RenderTimeSnapshot }>) {
  const snapshotKey = `${snapshot.mode}:${snapshot.timestamp}`
  const snapshotTime = useMemo(
    () => new Date(snapshot.timestamp),
    [snapshot.timestamp],
  )
  const [liveTime, setLiveTime] = useState<{
    snapshotKey: string
    value: Date
  } | null>(null)
  const renderTime =
    snapshot.mode === 'live' && liveTime?.snapshotKey === snapshotKey
      ? liveTime.value
      : snapshotTime

  useEffect(() => {
    const rootElement = document.documentElement
    rootElement.setAttribute(CLIENT_READY_ATTRIBUTE, 'true')

    return () => rootElement.removeAttribute(CLIENT_READY_ATTRIBUTE)
  }, [])

  useEffect(() => {
    if (snapshot.mode === 'live') {
      setLiveTime({ snapshotKey, value: new Date() })
      return
    }

    setLiveTime(null)
  }, [snapshot.mode, snapshotKey])

  return <RenderTimeContext value={renderTime}>{children}</RenderTimeContext>
}

export function useRenderTime() {
  return use(RenderTimeContext) ?? new Date()
}
