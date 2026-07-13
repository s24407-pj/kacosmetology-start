import {
  createContext,
  type PropsWithChildren,
  use,
  useEffect,
  useState,
} from 'react'

const RenderTimeContext = createContext<Date | null>(null)

export function RenderTimeProvider({
  initialTimestamp,
  children,
}: PropsWithChildren<{ initialTimestamp: string }>) {
  const [renderTime, setRenderTime] = useState(() => new Date(initialTimestamp))

  useEffect(() => {
    setRenderTime(new Date())
  }, [])

  return <RenderTimeContext value={renderTime}>{children}</RenderTimeContext>
}

export function useRenderTime() {
  return use(RenderTimeContext) ?? new Date()
}
