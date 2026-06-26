// Generiše PNG ikone „Svijet Sluha" iz public/brand/favicon.svg (sharp).
// Pokretanje: node scripts/generisi-ikone.mjs
import sharp from 'sharp'
import { readFileSync } from 'node:fs'

const SVG = readFileSync('public/brand/favicon.svg')
const CRVENA = '#ED1C24'
const sizes = [16, 32, 48, 96, 180, 192, 512]

for (const s of sizes) {
  await sharp(SVG, { density: 512 })
    .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(`public/brand/icon-${s}.png`)
  console.log(`✓ icon-${s}.png`)
}

// Maskable: pun crveni kvadrat (edge-to-edge) + znak u sigurnoj zoni (~70%).
const znak = await sharp(SVG, { density: 512 }).resize(360, 360).png().toBuffer()
await sharp({ create: { width: 512, height: 512, channels: 4, background: CRVENA } })
  .composite([{ input: znak, gravity: 'center' }])
  .png()
  .toFile('public/brand/icon-maskable-512.png')
console.log('✓ icon-maskable-512.png')

console.log('Gotovo — sve ikone su sada novi „Svijet Sluha" znak.')
