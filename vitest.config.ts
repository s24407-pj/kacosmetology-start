import { createRequire } from 'node:module'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

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
  plugins: [tailwindcss(), viteReact()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts?(x)', 'scripts/**/*.test.mjs'],
    exclude: ['tests/e2e/**/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        statements: 85,
        branches: 81,
        functions: 82,
        lines: 86,
      },
      exclude: [
        'src/**/*.test.ts?(x)',
        'src/router.tsx',
        'src/routeTree.gen.ts',
        'src/routes/**',
        'src/components/icons/**',
        'src/vite-env.d.ts',
      ],
    },
  },
})
