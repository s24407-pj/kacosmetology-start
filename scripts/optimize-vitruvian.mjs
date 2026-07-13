import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { argv } from 'node:process'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'
import { optimize } from 'svgo'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sourcePath = join(__dirname, 'assets/vitruvian-man.source.svg')
const publicImagesDir = join(__dirname, '../public/images')

const WIDTHS = [320, 640]
const WEBP_QUALITY = 72
const RENDER_DENSITY = 288
const SHARPEN = { sigma: 0.6, m1: 0.8, m2: 0.4, x1: 2, y2: 10, y3: 20 }

function optimizeSvg(source) {
  return optimize(source, {
    multipass: true,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            convertPathData: { floatPrecision: 0, transformPrecision: 0 },
          },
        },
      },
      {
        name: 'cleanupNumericValues',
        params: { floatPrecision: 0 },
      },
    ],
  }).data
}

export async function optimizeVitruvianMan() {
  const source = readFileSync(sourcePath, 'utf8')
  const optimizedSvg = optimizeSvg(source)
  const svgBuffer = Buffer.from(optimizedSvg)

  for (const width of WIDTHS) {
    const output = join(publicImagesDir, `vitruvian-man-${width}.webp`)
    await sharp(svgBuffer, { density: RENDER_DENSITY })
      .resize(width, width, { kernel: sharp.kernel.lanczos3 })
      .sharpen(SHARPEN)
      .webp({ quality: WEBP_QUALITY, alphaQuality: WEBP_QUALITY })
      .toFile(output)
    globalThis.console.log(`Generated: ${output}`)
  }
}

const isDirectRun = fileURLToPath(import.meta.url) === resolve(argv[1] ?? '')

if (isDirectRun) {
  await optimizeVitruvianMan()
}
