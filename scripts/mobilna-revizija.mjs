/** Mobilna revizija: snima ključne stranice na 390/430px i provjerava
 *  horizontalni skrol, premale dodirne površine i prelijevanje elemenata. */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const STRANICE = [
  ['pocetna', '/'],
  ['online-test', '/online-test-sluha'],
  ['slusni-aparati', '/slusni-aparati'],
  ['zakazivanje', '/zakazivanje'],
  ['proizvodi', '/proizvodi'],
  ['kontakt', '/kontakt'],
  ['poslovnice', '/poslovnice'],
]

await mkdir('screenshots/mob', { recursive: true })
const browser = await chromium.launch()
let problema = 0

for (const sirina of [390, 430]) {
  const ctx = await browser.newContext({ viewport: { width: sirina, height: 844 } })
  const page = await ctx.newPage()
  for (const [naziv, putanja] of STRANICE) {
    await page.goto(`http://localhost:3000${putanja}`, { waitUntil: 'networkidle' })
    await page.evaluate(async () => {
      await new Promise((r) => {
        let y = 0
        const korak = () => {
          y += 700
          window.scrollTo(0, y)
          if (y < document.body.scrollHeight) setTimeout(korak, 50)
          else { window.scrollTo(0, 0); setTimeout(r, 350) }
        }
        korak()
      })
    })
    await page.waitForTimeout(500)

    const nalaz = await page.evaluate(() => {
      const probleme = []
      const html = document.documentElement
      if (html.scrollWidth > html.clientWidth + 1) {
        probleme.push(`horizontalni skrol: ${html.scrollWidth}px > ${html.clientWidth}px`)
        // pronađi krivce
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect()
          if (r.right > html.clientWidth + 2 && r.width > 40) {
            probleme.push(`  prelijeva: <${el.tagName.toLowerCase()} class="${(el.className || '').toString().slice(0, 60)}">`)
            if (probleme.length > 6) break
          }
        }
      }
      // premale dodirne površine (interaktivni elementi < 40px po obje ose)
      let malih = 0
      for (const el of document.querySelectorAll('a, button, input, select, [role=button], [role=tab]')) {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        if (r.height < 40 && r.width < 40) malih++
      }
      if (malih > 0) probleme.push(`premalih dodirnih površina: ${malih}`)
      return probleme
    })

    if (nalaz.length > 0) {
      problema++
      console.log(`✗ ${naziv} @ ${sirina}px:`)
      for (const n of nalaz) console.log('   ' + n)
    } else {
      console.log(`✔ ${naziv} @ ${sirina}px`)
    }
    if (sirina === 390) {
      await page.screenshot({ path: `screenshots/mob/${naziv}-390.png`, fullPage: true })
    }
  }
  await ctx.close()
}
await browser.close()
console.log(problema === 0 ? 'SVE ČISTO' : `PROBLEMA: ${problema}`)
