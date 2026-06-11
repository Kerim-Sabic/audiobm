/**
 * Brend-pipeline: iz preuzetog logotipa pravi izvedene resurse i tačne boje.
 *  - prozirni PNG (flood-fill pozadine — bijela slova „AUDIO" ostaju neprozirna)
 *  - bijela (monohromatska) varijanta za tamni footer (slova izbušena)
 *  - set favicona (16/32/180/512 + maskable) — SVG rekonstrukcija znaka
 *  - ekstrakcija boja → public/brand/brand.json (izvor za dizajn-tokene)
 */
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
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

// ---------- 4. Favicon set — SVG rekonstrukcija znaka „o" ----------
// Izmjeri geometriju originalnog favicona (134×134): podjela crveno/crno, prsten
const fav = await sharp(path.join(SRC, 'favicon-original.png')).ensureAlpha().raw().toBuffer()
const FW = 134
const px = (x, y) => [fav[(y * FW + x) * 4], fav[(y * FW + x) * 4 + 1], fav[(y * FW + x) * 4 + 2], fav[(y * FW + x) * 4 + 3]]
const isRed = ([r, g]) => r > 150 && g < 90
const isBlack = ([r, g, b, a]) => r < 70 && g < 70 && b < 70 && a > 200
const isWhite = ([r, g, b, a]) => r > 200 && g > 200 && b > 200 && a > 200
// centar reda: granice prstena
const cy = Math.floor(FW / 2)
let marks = { redStart: -1, whiteOuterL: -1, redInnerL: -1, redInnerR: -1, whiteOuterR: -1, blackEnd: -1, split: -1 }
for (let x = 0; x < FW; x++) {
  const p = px(x, cy)
  if (marks.redStart < 0 && isRed(p)) marks.redStart = x
  if (marks.redStart >= 0 && marks.whiteOuterL < 0 && isWhite(p)) marks.whiteOuterL = x
  if (marks.whiteOuterL >= 0 && marks.redInnerL < 0 && isRed(p)) marks.redInnerL = x
}
for (let x = FW - 1; x >= 0; x--) {
  const p = px(x, cy)
  if (marks.blackEnd < 0 && isBlack(p)) marks.blackEnd = x
  if (marks.blackEnd >= 0 && marks.whiteOuterR < 0 && isWhite(p)) marks.whiteOuterR = x
  if (marks.whiteOuterR >= 0 && marks.redInnerR < 0 && isRed(p)) marks.redInnerR = x
}
// vertikalna podjela crveno/crno na vrhu
const ty = 6
for (let x = 0; x < FW; x++) { if (isBlack(px(x, ty))) { marks.split = x; break } }
console.log('Favicon mjere:', JSON.stringify(marks))
const S = 134
const cx = S / 2
const rOuter = (marks.whiteOuterR - marks.whiteOuterL) / 2 // vanjski radijus bijelog prstena
const rInner = (marks.redInnerR - marks.redInnerL) / 2 + (marks.redInnerL - marks.redInnerL) // unutrašnji crveni krug
const rInnerCircle = (marks.redInnerR - marks.redInnerL) / 2
const split = marks.split
const corner = 30 // vizuelno provjeriti
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}">
  <defs><clipPath id="rr"><rect width="${S}" height="${S}" rx="${corner}"/></clipPath></defs>
  <g clip-path="url(#rr)">
    <rect width="${split}" height="${S}" fill="${brandRed}"/>
    <rect x="${split}" width="${S - split}" height="${S}" fill="${brandInk}"/>
    <circle cx="${cx}" cy="${cx}" r="${rOuter}" fill="#FFFFFF"/>
    <circle cx="${cx}" cy="${cx}" r="${rInnerCircle}" fill="${brandRed}"/>
  </g>
</svg>`
await writeFile(path.join(OUT, 'favicon.svg'), faviconSvg)
for (const size of [16, 32, 48, 180, 512]) {
  await sharp(Buffer.from(faviconSvg)).resize(size, size).png().toFile(path.join(OUT, `icon-${size}.png`))
}
// maskable: znak na 66% s bijelom pozadinom (sigurna zona)
const mark512 = await sharp(Buffer.from(faviconSvg)).resize(338, 338).png().toBuffer()
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#FFFFFF' } })
  .composite([{ input: mark512, gravity: 'centre' }])
  .png().toFile(path.join(OUT, 'icon-maskable-512.png'))
console.log('Favicon set: 16/32/48/180/512 + maskable + svg')

// ---------- 5. Zapis brand.json ----------
await writeFile(path.join(OUT, 'brand.json'), JSON.stringify({
  izvor: 'https://audiobm.ba/cdn/shop/files/logo_2.png (ekstrahovano programski)',
  crvena: brandRed,
  tamna: brandInk,
  skala: brandScale,
  datum: new Date().toISOString(),
}, null, 2))
console.log('public/brand/brand.json zapisan')
