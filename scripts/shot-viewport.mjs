import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
let cilj = process.argv[2] ?? ''
if (cilj.includes(':')) cilj = '' // git-bash pretvori "/" u windows putanju
if (cilj && !cilj.startsWith('/')) cilj = '/' + cilj
const ime = process.argv[3] ?? 'viewport'
const skrol = Number(process.argv[4] ?? 0)
await p.goto(`http://localhost:3000${cilj}`, { waitUntil: 'networkidle' })
if (skrol) {
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), skrol)
  await p.waitForTimeout(1200)
}
await p.waitForTimeout(1800)
await p.screenshot({ path: `screenshots/${ime}.png` })
console.log('OK', ime)
await b.close()
