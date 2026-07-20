import { createRequire } from 'node:module'
import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import remarkFrontmatter from 'remark-frontmatter'
import { defineConfig } from 'vite'
import { blogMdxPolicy } from './src/libs/blogMdxPolicy'

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
  plugins: [
    nitro(),
    tailwindcss(),
    tanstackStart(),
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkFrontmatter, blogMdxPolicy],
      }),
    },
    viteReact({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
  ],
})
