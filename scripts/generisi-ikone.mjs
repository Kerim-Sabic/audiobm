// Generiše PNG/ICO ikone iz Svijet Sluha ZIP resursa (sharp).
// Pokretanje: node scripts/generisi-ikone.mjs
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'node:fs'

const FAVICON = readFileSync('assets-src/brand/svijet-sluha_favicon_transparent.png')
const sizes = [16, 32, 48, 96, 180, 192, 512]
const png = (size) =>
  sharp(FAVICON)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

const icoFromPngs = (images) => {
  const headerBytes = 6 + images.length * 16
  const totalBytes = headerBytes + images.reduce((sum, image) => sum + image.buffer.length, 0)
  const ico = Buffer.alloc(totalBytes)

  ico.writeUInt16LE(0, 0)
  ico.writeUInt16LE(1, 2)
  ico.writeUInt16LE(images.length, 4)

  let imageOffset = headerBytes
  images.forEach((image, index) => {
    const entryOffset = 6 + index * 16
    ico.writeUInt8(image.size === 256 ? 0 : image.size, entryOffset)
    ico.writeUInt8(image.size === 256 ? 0 : image.size, entryOffset + 1)
    ico.writeUInt8(0, entryOffset + 2)
    ico.writeUInt8(0, entryOffset + 3)
    ico.writeUInt16LE(1, entryOffset + 4)
    ico.writeUInt16LE(32, entryOffset + 6)
    ico.writeUInt32LE(image.buffer.length, entryOffset + 8)
    ico.writeUInt32LE(imageOffset, entryOffset + 12)
    image.buffer.copy(ico, imageOffset)
    imageOffset += image.buffer.length
  })

  return ico
}

const generated = new Map()

for (const s of sizes) {
  const buffer = await png(s)
  generated.set(s, buffer)
  writeFileSync(`public/brand/icon-${s}.png`, buffer)
  console.log(`✓ icon-${s}.png`)
}

writeFileSync('public/favicon.png', generated.get(48))
writeFileSync(
  'public/favicon.ico',
  icoFromPngs([16, 32, 48].map((size) => ({ size, buffer: generated.get(size) }))),
)
writeFileSync(
  'public/brand/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><image width="512" height="512" href="data:image/png;base64,${generated.get(512).toString('base64')}"/></svg>`,
)
console.log('✓ favicon.png / favicon.ico / favicon.svg')

// Maskable: ZIP znak u sigurnoj zoni na bijeloj pozadini.
const znak = await sharp(FAVICON)
  .resize(338, 338, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#FFFFFF' } })
  .composite([{ input: znak, gravity: 'center' }])
  .png()
  .toFile('public/brand/icon-maskable-512.png')
console.log('✓ icon-maskable-512.png')

console.log('Gotovo — sve ikone su generisane iz Svijet Sluha ZIP resursa.')
