import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
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
const contentDirectory = join(root, 'src/content/blog')
const outputPath = join(root, 'src/data/blogPosts.generated.ts')

const readExistingGeneratedAt = async () => {
  try {
    const existing = await readFile(outputPath, 'utf8')
    const match = existing.match(
      /export const blogContentGeneratedAt = ('[^']+'|"[^"]+") as const/,
    )
    if (!match) return { existing, contentGeneratedAt: null }
    return {
      existing,
      contentGeneratedAt: JSON.parse(match[1].replaceAll("'", '"')),
    }
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return { existing: null, contentGeneratedAt: null }
    }
    throw error
  }
}

const server = await createServer({
  configFile: false,
  root,
  appType: 'custom',
  server: { middlewareMode: true },
  resolve: { tsconfigPaths: true },
  logLevel: 'silent',
})

try {
  const pipeline = await server.ssrLoadModule(
    '/src/libs/blogContentPipeline.ts',
  )

  let entries = []
  try {
    entries = await readdir(contentDirectory, { withFileTypes: true })
  } catch (error) {
    if (
      typeof error !== 'object' ||
      error === null ||
      !('code' in error) ||
      error.code !== 'ENOENT'
    ) {
      throw error
    }
  }

  const files = []
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.mdx')) continue
    if (entry.name.startsWith('_')) continue
    const source = await readFile(join(contentDirectory, entry.name), 'utf8')
    files.push({ fileName: entry.name, source })
  }
  files.sort((left, right) => left.fileName.localeCompare(right.fileName))

  const { existing, contentGeneratedAt: existingGeneratedAt } =
    await readExistingGeneratedAt()

  if (check && !existingGeneratedAt) {
    process.stderr.write('src/data/blogPosts.generated.ts\n')
    process.exitCode = 1
  } else {
    const contentGeneratedAt = check
      ? existingGeneratedAt
      : new Date().toISOString()

    const { payload, errors } = await pipeline.buildBlogManifest({
      files,
      contentGeneratedAt,
    })

    if (errors.length > 0) {
      for (const error of errors) process.stderr.write(`${error}\n`)
      process.exitCode = 1
    } else {
      const rendered = pipeline.renderBlogPostsGeneratedModule(payload)
      if (existing === rendered) {
        process.stdout.write('blog content manifest is up to date\n')
      } else if (check) {
        process.stderr.write('src/data/blogPosts.generated.ts\n')
        process.exitCode = 1
      } else {
        await mkdir(dirname(outputPath), { recursive: true })
        const temporaryPath = `${outputPath}.tmp-${process.pid}`
        await writeFile(temporaryPath, rendered)
        await rename(temporaryPath, outputPath)
        process.stdout.write('wrote src/data/blogPosts.generated.ts\n')
      }
    }
  }
} finally {
  await server.close()
}
