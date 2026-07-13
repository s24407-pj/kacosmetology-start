import { Buffer } from 'node:buffer'
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../public')
const svg = resolve(publicDir, 'favicon.svg')

const pngSizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
]

for (const { name, size } of pngSizes) {
  const out = resolve(publicDir, name)
  await sharp(svg).resize(size, size).png().toFile(out)
  globalThis.console.log(`Generated: ${name}`)
}

const png32 = await sharp(svg).resize(32, 32).png().toBuffer()
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(1, 4)
const entry = Buffer.alloc(16)
entry[0] = 32
entry[1] = 32
entry[4] = 1
entry[5] = 32
entry.writeUInt32LE(png32.length, 8)
entry.writeUInt32LE(22, 12)
writeFileSync(
  resolve(publicDir, 'favicon.ico'),
  Buffer.concat([header, entry, png32]),
)
globalThis.console.log('Generated: favicon.ico')
