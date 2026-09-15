export {}

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
    fbq: (...args: unknown[]) => void
    oaiq: (...args: unknown[]) => void
    plausible: (
      eventName: string,
      options?: { props?: Record<string, unknown> },
    ) => void
  }

  interface ImportMetaEnv {
    readonly VITE_GA_ID?: string
    readonly VITE_META_PIXEL_ID?: string
    readonly VITE_OPENAI_PIXEL_ID?: string
  }
}
