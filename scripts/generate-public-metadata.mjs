import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const argumentsList = process.argv.slice(2)
if (argumentsList.some((argument) => argument !== '--check')) {
  throw new Error(
    `Unknown flag: ${argumentsList.find((argument) => argument !== '--check')}`,
  )
}
if (argumentsList.filter((argument) => argument === '--check').length > 1) {
  throw new Error('The --check flag may be provided only once')
}

const check = argumentsList.includes('--check')
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const server = await createServer({
  configFile: false,
  root,
  appType: 'custom',
  server: { middlewareMode: true },
  resolve: { tsconfigPaths: true },
  logLevel: 'silent',
})

try {
  const [{ businessProfile }, metadataModule] = await Promise.all([
    server.ssrLoadModule('/src/data/business.ts'),
    server.ssrLoadModule('/src/libs/publicMetadata.ts'),
  ])
  const rendered = metadataModule.renderPublicMetadata(businessProfile)
  const stalePaths = await metadataModule.syncPublicMetadata({
    root,
    rendered,
    check,
  })
  if (check && stalePaths.length > 0) {
    for (const stalePath of stalePaths) process.stderr.write(`${stalePath}\n`)
    process.exitCode = 1
  }
} finally {
  await server.close()
}
