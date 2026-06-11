/**
 * Priprema hero fotografije: uklanja ravnu crvenu pozadinu sa preuzete
 * kampanjske fotografije (flood-fill od ivica) → prozirni PNG + WebP,
 * obrezano na osobu. Original ostaje netaknut u assets-src/marketing/.
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const IZVOR = 'assets-src/marketing/besplatan-pregled-sluha-slide-red-v2.jpg'
await mkdir('src/assets', { recursive: true })

const slika = sharp(IZVOR)
const { width: W, height: H } = await slika.metadata()
const rgba = await slika.ensureAlpha().raw().toBuffer()

const jeCrvena = (i) => {
  const r = rgba[i * 4], g = rgba[i * 4 + 1], b = rgba[i * 4 + 2]
  return r > 150 && g < 80 && b < 80 && r - g > 90 && r - b > 90
}

// flood-fill pozadine od ivica (koža i usne nisu spojene s pozadinom)
const bg = new Uint8Array(W * H)
const red = []
for (let x = 0; x < W; x++) red.push(x, (H - 1) * W + x)
for (let y = 0; y < H; y++) red.push(y * W, y * W + W - 1)
while (red.length) {
  const i = red.pop()
  if (bg[i] || !jeCrvena(i)) continue
  bg[i] = 1
  const x = i % W, y = (i / W) | 0
  if (x > 0) red.push(i - 1)
  if (x < W - 1) red.push(i + 1)
  if (y > 0) red.push(i - W)
  if (y < H - 1) red.push(i + W)
}

// omekšaj ivice: pikseli uz pozadinu dobiju polu-prozirnost i skini crveni odsjaj
const out = Buffer.from(rgba)
for (let i = 0; i < W * H; i++) {
  if (bg[i]) {
    out[i * 4 + 3] = 0
    continue
  }
  const x = i % W, y = (i / W) | 0
  let uzBg = 0
  for (const d of [-1, 1, -W, W]) {
    const j = i + d
    if (j >= 0 && j < W * H && bg[j]) uzBg++
  }
  if (uzBg > 0) {
    out[i * 4 + 3] = uzBg >= 2 ? 90 : 170
    // neutrališi crveni rub
    const r = out[i * 4], g = out[i * 4 + 1], b = out[i * 4 + 2]
    if (r - g > 60) {
      out[i * 4] = Math.round((g + b) / 2 + 30)
    }
  }
}

const izrezano = sharp(out, { raw: { width: W, height: H, channels: 4 } }).trim()
await izrezano.clone().png().toFile('src/assets/hero-osoba.png')
const meta = await sharp('src/assets/hero-osoba.png').metadata()
console.log(`hero-osoba.png: ${meta.width}×${meta.height}`)
