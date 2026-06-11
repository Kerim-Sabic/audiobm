/** QA obrazaca: zakazivanje (sa provjerom grešaka), kontakt, upit za proizvod. */
import { chromium } from 'playwright'

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await ctx.newPage()
const greske = []
page.on('pageerror', (e) => greske.push(String(e)))
page.on('console', (m) => {
  if (m.type() === 'error') greske.push(m.text())
})

// ——— 1. zakazivanje: prvo greške validacije, pa uspjeh ———
await page.goto('http://localhost:3000/zakazivanje', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /Banja Luka/ }).click()
await page.waitForTimeout(400)
await page.getByRole('button', { name: 'Pošaljite zahtjev za termin' }).click()
await page.waitForTimeout(1500)
const greskaIme = await page.getByText('Molimo unesite Vaše ime i prezime.').isVisible().catch(() => false)
const greskaSaglasnost = await page.getByText(/potvrdite saglasnost/).isVisible().catch(() => false)
console.log('zakazivanje — greške uz polja:', greskaIme && greskaSaglasnost ? 'OK' : `NEISPRAVNO (ime:${greskaIme} sagl:${greskaSaglasnost})`)

await page.getByLabel('Ime i prezime').fill('QA Zakazivanje')
await page.getByLabel(/Broj telefona/).fill('065 111 222')
await page.getByText(/Saglasan\/saglasna sam/).click()
await page.getByRole('button', { name: 'Pošaljite zahtjev za termin' }).click()
await page.waitForTimeout(2000)
const zakOk = await page.getByText('Vaš zahtjev je zaprimljen').isVisible().catch(() => false)
console.log('zakazivanje — uspjeh:', zakOk ? 'OK' : 'NEISPRAVNO')
await page.screenshot({ path: 'screenshots/mob/qa-zakazivanje-uspjeh.png' })

// ——— 2. kontakt ———
await page.goto('http://localhost:3000/kontakt', { waitUntil: 'networkidle' })
await page.getByLabel('Ime i prezime').fill('QA Kontakt')
await page.getByLabel(/Broj telefona/).fill('065 333 444')
await page.getByLabel(/Vaša poruka/).fill('Testna poruka — QA provjera obrasca.')
await page.getByText(/Saglasan\/saglasna sam/).click()
await page.getByRole('button', { name: 'Pošaljite poruku' }).click()
await page.waitForTimeout(2000)
const konOk = await page.getByText('Vaša poruka je zaprimljena').isVisible().catch(() => false)
console.log('kontakt — uspjeh:', konOk ? 'OK' : 'NEISPRAVNO')

// ——— 3. upit za proizvod ———
await page.goto('http://localhost:3000/proizvodi', { waitUntil: 'networkidle' })
const prviProizvod = page.locator('article a').first()
await prviProizvod.click()
await page.waitForLoadState('networkidle')
await page.getByLabel('Ime i prezime').fill('QA Proizvod')
await page.getByLabel(/Broj telefona/).fill('065 555 666')
await page.getByText(/Saglasan\/saglasna sam/).click()
await page.getByRole('button', { name: 'Pošaljite upit' }).click()
await page.waitForTimeout(2000)
const proOk = await page.getByText('Vaš upit je zaprimljen').isVisible().catch(() => false)
console.log('proizvod — uspjeh:', proOk ? 'OK' : 'NEISPRAVNO (' + page.url() + ')')

console.log('konzolne greške:', greske.length === 0 ? 'nema' : greske.slice(0, 5).join(' | '))
await browser.close()
process.exit(zakOk && konOk && proOk && greske.length === 0 ? 0 : 1)
