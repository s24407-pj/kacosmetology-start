import { mkdir, readdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../public')

const MOBILE_WIDTHS = [360, 720, 1080]
const POSTER_WIDTHS = [360, 720]
const GALLERY_WIDTHS = [360, 720, 1080, 1440]
const SPECIALIZATION_WIDTHS = [360, 720, 1080]
const SOCIAL_IMAGE_WIDTH = 1200
const SOCIAL_IMAGE_HEIGHT = 630

async function generateVariants(inputPath, outputPrefix, widths, quality = 82) {
  for (const width of widths) {
    const output = `${outputPrefix}-${width}.webp`
    await sharp(inputPath).resize(width).webp({ quality }).toFile(output)
    globalThis.console.log(`Generated: ${output}`)
  }
}

async function generateSocialImage(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(SOCIAL_IMAGE_WIDTH, SOCIAL_IMAGE_HEIGHT, {
      fit: 'cover',
      position: 'centre',
    })
    .webp({ quality: 86 })
    .toFile(outputPath)
  globalThis.console.log(`Generated: ${outputPath}`)
}

const socialImagesDir = join(publicDir, 'images/social')
await mkdir(socialImagesDir, { recursive: true })
for (const [outputName, inputPath] of [
  ['home.webp', join(publicDir, 'images/gallery/witryna.webp')],
  ['gallery.webp', join(publicDir, 'images/gallery/lozko.webp')],
  [
    'cosmetology.webp',
    join(publicDir, 'images/specializations/cosmetology.webp'),
  ],
  [
    'eye-styling.webp',
    join(publicDir, 'images/specializations/eye-styling.webp'),
  ],
  [
    'trichology.webp',
    join(publicDir, 'images/specializations/trichology.webp'),
  ],
]) {
  await generateSocialImage(inputPath, join(socialImagesDir, outputName))
}

await generateVariants(
  join(publicDir, 'images/hero.webp'),
  join(publicDir, 'images/hero'),
  MOBILE_WIDTHS,
)

await generateVariants(
  join(publicDir, 'images/proces/o-mnie.webp'),
  join(publicDir, 'images/proces/o-mnie'),
  MOBILE_WIDTHS,
)

const specializationFiles = (
  await readdir(join(publicDir, 'images/specializations'))
).filter((name) => name.endsWith('.webp') && !/-\d+\.webp$/.test(name))

for (const image of specializationFiles) {
  const base = image.replace(/\.webp$/, '')
  await generateVariants(
    join(publicDir, 'images/specializations', image),
    join(publicDir, 'images/specializations', base),
    SPECIALIZATION_WIDTHS,
  )
}

const specializationCardFiles = (
  await readdir(join(publicDir, 'images/specialization-cards'))
).filter((name) => name.endsWith('.webp') && !/-\d+\.webp$/.test(name))

for (const image of specializationCardFiles) {
  const base = image.replace(/\.webp$/, '')
  await generateVariants(
    join(publicDir, 'images/specialization-cards', image),
    join(publicDir, 'images/specialization-cards', base),
    SPECIALIZATION_WIDTHS,
  )
}

const posterFiles = (await readdir(join(publicDir, 'movies'))).filter(
  (name) =>
    name.endsWith('-poster.webp') &&
    !name.includes('-360.') &&
    !name.includes('-720.'),
)

for (const poster of posterFiles) {
  const base = poster.replace(/\.webp$/, '')
  await generateVariants(
    join(publicDir, 'movies', poster),
    join(publicDir, 'movies', base),
    POSTER_WIDTHS,
  )
}

const galleryFiles = (await readdir(join(publicDir, 'images/gallery'))).filter(
  (name) => name.endsWith('.webp') && !/-\d+\.webp$/.test(name),
)

for (const image of galleryFiles) {
  const base = image.replace(/\.webp$/, '')
  await generateVariants(
    join(publicDir, 'images/gallery', image),
    join(publicDir, 'images/gallery', base),
    GALLERY_WIDTHS,
  )
}

const effectFiles = (
  await readdir(join(publicDir, 'images/gallery/effects'))
).filter((name) => name.endsWith('.webp') && !/-\d+\.webp$/.test(name))

for (const image of effectFiles) {
  const base = image.replace(/\.webp$/, '')
  await generateVariants(
    join(publicDir, 'images/gallery/effects', image),
    join(publicDir, 'images/gallery/effects', base),
    MOBILE_WIDTHS,
  )
}

const { optimizeVitruvianMan } = await import('./optimize-vitruvian.mjs')
await optimizeVitruvianMan()
