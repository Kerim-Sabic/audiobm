/** Snima ekrane ključnih stranica radi dizajnerske revizije. */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const stranice = process.argv[2]
  ? [[process.argv[2].replaceAll('/', '_') || 'custom', process.argv[2]]]
  : [
      ['pocetna', '/'],
      ['slusni-aparati', '/slusni-aparati'],
      ['proizvodi', '/proizvodi'],
      ['poslovnice', '/poslovnice'],
      ['zakazivanje', '/zakazivanje'],
      ['poslovnica-sarajevo', '/poslovnice/sarajevo'],
      ['model', '/slusni-aparati/modeli/entra-1-slusni-aparat'],
    ]

await mkdir('screenshots', { recursive: true })
const browser = await chromium.launch()

for (const mobilno of [false, true]) {
  const ctx = await browser.newContext({
    viewport: mobilno ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })
  const page = await ctx.newPage()
  for (const [naziv, putanja] of stranice) {
    await page.goto(`http://localhost:3000${putanja}`, { waitUntil: 'networkidle' })
    // sačekaj da animacije pri ulasku završe i skrolaj da se otkriju sekcije
    await page.evaluate(async () => {
      await new Promise((r) => {
        let y = 0
        const korak = () => {
          y += 600
          window.scrollTo(0, y)
          if (y < document.body.scrollHeight) setTimeout(korak, 60)
          else { window.scrollTo(0, 0); setTimeout(r, 400) }
        }
        korak()
      })
    })
    await page.waitForTimeout(600)
    await page.screenshot({ path: `screenshots/${naziv}${mobilno ? '-mob' : ''}.png`, fullPage: true })
    console.log(`✔ ${naziv}${mobilno ? '-mob' : ''}`)
  }
  await ctx.close()
}
await browser.close()
