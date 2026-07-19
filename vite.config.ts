import { createRequire } from 'node:module'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

const require = createRequire(import.meta.url)

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: [
      // Workaround: bare import fails without package exports/main.
      // https://github.com/plausible/analytics/issues/5879
      {
        find: /^@plausible-analytics\/tracker$/,
        replacement: require.resolve(
          '@plausible-analytics/tracker/plausible.js',
        ),
      },
    ],
  },
  plugins: [nitro(), tailwindcss(), tanstackStart(), viteReact()],
})
