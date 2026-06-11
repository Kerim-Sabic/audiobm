/** Snima vrh stranice (zaglavlje + hero) na svim ključnim širinama. */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const putanja = process.argv[2] ?? '/'
const prefiks = process.argv[3] ?? 'bp'
const sirine = [390, 768, 1024, 1280, 1440, 1920]

await mkdir('screenshots/bp', { recursive: true })
const browser = await chromium.launch()
for (const w of sirine) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  await page.goto(`http://localhost:3000${putanja}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `screenshots/bp/${prefiks}-${w}.png` })
  console.log(`✔ ${prefiks}-${w}`)
  await ctx.close()
}
await browser.close()
