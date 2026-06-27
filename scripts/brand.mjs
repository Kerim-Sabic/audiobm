/**
 * Brend-pipeline: iz preuzetog logotipa pravi izvedene resurse i tačne boje.
 *  - prozirni PNG (flood-fill pozadine — bijela slova „AUDIO" ostaju neprozirna)
 *  - bijela (monohromatska) varijanta za tamni footer (slova izbušena)
 *  - set favicona iz Svijet Sluha ZIP resursa (16/32/48/96/180/192/512 + maskable)
 *  - ekstrakcija boja → public/brand/brand.json (izvor za dizajn-tokene)
 */
import sharp from 'sharp'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'assets-src/brand'
const OUT = 'public/brand'
await mkdir(OUT, { recursive: true })

// ---------- 1. Boje iz logotipa ----------
const logo = sharp(path.join(SRC, 'logo_2-original.png'))
const { width: W, height: H } = await logo.metadata()
const raw = await logo.raw().toBuffer()

let red = [0, 0, 0, 0] // r,g,b,count
let ink = [0, 0, 0, 0]
for (let i = 0; i < W * H; i++) {
  const r = raw[i * 3], g = raw[i * 3 + 1], b = raw[i * 3 + 2]
  if (r > 170 && g < 90 && b < 90) { red[0] += r; red[1] += g; red[2] += b; red[3]++ }
  else if (r < 70 && g < 70 && b < 70) { ink[0] += r; ink[1] += g; ink[2] += b; ink[3]++ }
}
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()
const brandRed = hex([red[0] / red[3], red[1] / red[3], red[2] / red[3]])
const brandInk = hex([ink[0] / ink[3], ink[1] / ink[3], ink[2] / ink[3]])
console.log('Brend crvena:', brandRed, `(${red[3]} px)`, '| tamna:', brandInk, `(${ink[3]} px)`)

// ---------- 2. Skala 50–900 (miješanje u sRGB uz blagu korekciju zasićenja) ----------
const parse = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)
const base = parse(brandRed)
const white = [255, 255, 255]
const black = [30, 8, 10] // taman kraj zadržava topli crveni ton
const scale = {
  50: mix(white, base, 0.06), 100: mix(white, base, 0.12), 200: mix(white, base, 0.25),
  300: mix(white, base, 0.45), 400: mix(white, base, 0.68), 500: mix(white, base, 0.86),
  600: base, 700: mix(base, black, 0.22), 800: mix(base, black, 0.45), 900: mix(base, black, 0.65),
}
const brandScale = Object.fromEntries(Object.entries(scale).map(([k, v]) => [k, hex(v)]))
console.log('Skala:', JSON.stringify(brandScale))

// ---------- 3. Prozirni logo (flood-fill bijele pozadine od ivica) ----------
const rgba = await sharp(path.join(SRC, 'logo_2-original.png')).ensureAlpha().raw().toBuffer()
const nearWhite = (i) => rgba[i * 4] >= 242 && rgba[i * 4 + 1] >= 242 && rgba[i * 4 + 2] >= 242
const bg = new Uint8Array(W * H)
const queue = []
for (let x = 0; x < W; x++) { queue.push(x, (H - 1) * W + x) }
for (let y = 0; y < H; y++) { queue.push(y * W, y * W + W - 1) }
while (queue.length) {
  const i = queue.pop()
  if (bg[i] || !nearWhite(i)) continue
  bg[i] = 1
  const x = i % W, y = (i / W) | 0
  if (x > 0) queue.push(i - 1)
  if (x < W - 1) queue.push(i + 1)
  if (y > 0) queue.push(i - W)
  if (y < H - 1) queue.push(i + W)
}
const transparent = Buffer.from(rgba)
const whiteVar = Buffer.alloc(W * H * 4)
for (let i = 0; i < W * H; i++) {
  if (bg[i]) {
    transparent[i * 4 + 3] = 0
  } else {
    // bijela varijanta: obojeni pikseli → bijelo; unutrašnja bijela slova → izbušena
    if (!nearWhite(i)) {
      whiteVar[i * 4] = 255; whiteVar[i * 4 + 1] = 255; whiteVar[i * 4 + 2] = 255; whiteVar[i * 4 + 3] = 255
    }
  }
}
const trimmed = sharp(transparent, { raw: { width: W, height: H, channels: 4 } }).trim()
await trimmed.png().toFile(path.join(OUT, 'logo.png'))
const meta = await sharp(path.join(OUT, 'logo.png')).metadata()
await sharp(path.join(OUT, 'logo.png')).resize({ width: 600 }).png().toFile(path.join(OUT, 'logo-600.png'))
await sharp(path.join(OUT, 'logo.png')).resize({ width: 1200 }).png().toFile(path.join(OUT, 'logo-1200.png'))
await sharp(whiteVar, { raw: { width: W, height: H, channels: 4 } }).trim().png().toFile(path.join(OUT, 'logo-bijeli.png'))
console.log(`Logo: ${meta.width}×${meta.height} (trim), + 600/1200 + bijela varijanta`)

// ---------- 4. Favicon set — Svijet Sluha ZIP resurs ----------
const faviconSource = await readFile(path.join(SRC, 'svijet-sluha_favicon_transparent.png'))
const faviconPng = (size) =>
  sharp(faviconSource)
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
const generatedIcons = new Map()
for (const size of [16, 32, 48, 96, 180, 192, 512]) {
  const png = await faviconPng(size)
  generatedIcons.set(size, png)
  await writeFile(path.join(OUT, `icon-${size}.png`), png)
}
await writeFile('public/favicon.png', generatedIcons.get(48))
await writeFile(
  'public/favicon.ico',
  icoFromPngs([16, 32, 48].map((size) => ({ size, buffer: generatedIcons.get(size) }))),
)
await writeFile(
  path.join(OUT, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><image width="512" height="512" href="data:image/png;base64,${generatedIcons.get(512).toString('base64')}"/></svg>`,
)
// maskable: ZIP znak u sigurnoj zoni na bijeloj pozadini
const mark512 = await sharp(faviconSource)
  .resize(338, 338, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#FFFFFF' } })
  .composite([{ input: mark512, gravity: 'centre' }])
  .png().toFile(path.join(OUT, 'icon-maskable-512.png'))
console.log('Favicon set: 16/32/48/96/180/192/512 + maskable + svg + root ico/png iz ZIP resursa')

// ---------- 5. Zapis brand.json ----------
await writeFile(path.join(OUT, 'brand.json'), JSON.stringify({
  izvor: 'https://audiobm.ba/cdn/shop/files/logo_2.png (ekstrahovano programski)',
  crvena: brandRed,
  tamna: brandInk,
  skala: brandScale,
  datum: new Date().toISOString(),
}, null, 2))
console.log('public/brand/brand.json zapisan')
