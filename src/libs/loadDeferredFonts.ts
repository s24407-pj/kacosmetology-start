const deferredFontImports = [
  () => import('@fontsource/playfair-display/latin-400.css'),
  () => import('@fontsource/playfair-display/latin-ext-400.css'),
  () => import('@fontsource/playfair-display/latin-600.css'),
  () => import('@fontsource/playfair-display/latin-ext-600.css'),
  () => import('@fontsource/crimson-text/latin-600.css'),
  () => import('@fontsource/crimson-text/latin-ext-600.css'),
  () => import('@fontsource/crimson-text/latin-400-italic.css'),
  () => import('@fontsource/crimson-text/latin-ext-400-italic.css'),
] as const

const BATCH_SIZE = 2

export async function loadDeferredFonts() {
  for (let index = 0; index < deferredFontImports.length; index += BATCH_SIZE) {
    const batch = deferredFontImports.slice(index, index + BATCH_SIZE)
    await Promise.all(batch.map((loadFont) => loadFont()))
  }
}
