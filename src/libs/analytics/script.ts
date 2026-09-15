/** Inject an async script once (idempotent by src). Client-only. */
export function injectAsyncScript(src: string, datasetKey?: string): void {
  if (typeof document === 'undefined') {
    return
  }

  const selector = datasetKey
    ? `script[data-analytics-script="${datasetKey}"]`
    : `script[src="${src}"]`

  if (document.querySelector(selector)) {
    return
  }

  const script = document.createElement('script')
  script.async = true
  script.src = src
  if (datasetKey) {
    script.dataset.analyticsScript = datasetKey
  }
  document.head.appendChild(script)
}
