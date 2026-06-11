/** E2E provjera online testa sluha: priprema → upitnik → tonovi → rezultat → slanje. */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const mobilno = process.argv[2] === 'mob'
await mkdir('screenshots/test-sluha', { recursive: true })

const browser = await chromium.launch({
  args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
})
const ctx = await browser.newContext({
  viewport: mobilno ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  permissions: ['microphone'],
})
const page = await ctx.newPage()
const greske = []
page.on('console', (msg) => {
  if (msg.type() === 'error') greske.push(msg.text())
})
page.on('pageerror', (e) => greske.push(String(e)))

const suf = mobilno ? '-mob' : ''
const shot = (n) => page.screenshot({ path: `screenshots/test-sluha/${n}${suf}.png`, fullPage: false })

await page.goto('http://localhost:3000/online-test-sluha', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await shot('01-uvod')

// 1) uvod
await page.getByRole('button', { name: /Počnite pripremu/ }).click()
await page.waitForTimeout(400)
await shot('02-slusalice')

// 2) slušalice — pusti ton pa potvrdi za oba uha
for (const uho of ['lijevo', 'desno']) {
  await page.getByRole('button', { name: new RegExp(`Pustite ton \\(${uho}\\)`) }).click()
  await page.waitForTimeout(2200)
  await page.getByRole('button', { name: new RegExp(`^Čujem ${uho}$`) }).click()
}
await page.getByRole('button', { name: /^Nastavite$/ }).click()
await page.waitForTimeout(400)
await shot('03-glasnoca')

// 3) glasnoća
await page.getByRole('button', { name: /Pustite referentni ton/ }).click()
await page.waitForTimeout(2200)
await page.getByText('Ton je tih ali jasan').click()
await page.getByRole('button', { name: /^Nastavite$/ }).click()
await page.waitForTimeout(400)

// 4) tišina — mikrofonска provjera (lažni uređaj) pa potvrda
await page.getByRole('button', { name: /Provjerite buku mikrofonom/ }).click()
await page.waitForTimeout(3500)
await shot('04-tisina')
await page.getByText('Potvrđujem da sam u tihoj prostoriji').click()
await page.getByRole('button', { name: /Nastavite na upitnik/ }).click()
await page.waitForTimeout(400)
await shot('05-upitnik')

// 5) upitnik — prvi ponuđeni odgovor na svako pitanje + „ništa od navedenog"
for (const grupa of await page.getByRole('radio').all()) {
  // klikćemo prvi radio u svakoj grupi: preskačemo već označene
}
const fieldsetovi = await page.locator('fieldset').all()
for (const fs of fieldsetovi) {
  const radio = fs.getByRole('radio').first()
  if ((await radio.count()) > 0) await radio.click()
}
await page.getByText('Ništa od navedenog').click()
await page.getByRole('button', { name: /Nastavite na slušanje/ }).click()
await page.waitForTimeout(400)
await shot('06-test-start')

// 6) tonovi — uvijek „Čujem" (najbrži put; catch pokušaji će zabilježiti lažne potvrde)
await page.getByRole('button', { name: /Počnite slušanje/ }).click()
const pocetak = Date.now()
let snimljenoSlusanje = false
while (Date.now() - pocetak < 240000) {
  if (await page.getByRole('button', { name: /Nastavite — lijevo uho/ }).isVisible().catch(() => false)) {
    await shot('07-pauza-uha')
    await page.getByRole('button', { name: /Nastavite — lijevo uho/ }).click()
    continue
  }
  if (await page.getByText('Rezultat testa').isVisible().catch(() => false)) break
  const cujem = page.getByRole('button', { name: /^Čujem$/ })
  if (await cujem.isVisible().catch(() => false)) {
    if (!snimljenoSlusanje) {
      await page.waitForTimeout(800)
      await shot('07-slusanje')
      snimljenoSlusanje = true
    }
    await cujem.click().catch(() => {})
  }
  await page.waitForTimeout(350)
}

await page.waitForTimeout(800)
await shot('08-rezultat')

// 7) slanje rezultata
await page.getByRole('button', { name: /Pošaljite rezultat Audio BM timu/ }).click()
await page.waitForTimeout(400)
await page.getByLabel(/Ime i prezime/).fill('E2E Test Korisnik')
await page.getByLabel(/Broj telefona/).fill('065 123 456')
await page.getByText(/Saglasan\/saglasna sam/).click()
await shot('09-obrazac')
await page.getByRole('button', { name: /^Pošaljite rezultat$/ }).click()
await page.waitForTimeout(2500)
await shot('10-poslano')

const uspjeh = await page.getByText(/Vaš rezultat je zaprimljen/).isVisible().catch(() => false)
console.log('SLANJE:', uspjeh ? 'USPJEŠNO' : 'NIJE USPJELO')
console.log('KONZOLNE GREŠKE:', greske.length === 0 ? 'nema' : greske.slice(0, 8).join('\n'))

await browser.close()
process.exit(uspjeh && greske.length === 0 ? 0 : 1)
