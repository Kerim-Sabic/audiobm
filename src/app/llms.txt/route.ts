import { dajPoslovnice, dajUsluge } from '@/lib/podaci'
import { BREND, nazivPoslovnice } from '@/lib/brend'
import { OSNOVNI_URL } from '@/lib/seo'
import { stvarno } from '@/lib/tekst'

// llms.txt po llmstxt.org spec-u: H1 naslov + blockquote sažetak + H2 sekcije sa
// Markdown linkovima „[naslov](url): opis". Generiše se iz CMS-a, osvježava se dnevno.
export const revalidate = 86400

export async function GET() {
  const [poslovnice, usluge] = await Promise.all([dajPoslovnice(), dajUsluge()])
  const l: string[] = []

  l.push(`# ${BREND.naziv}`, '')
  l.push(
    `> ${BREND.naziv} — ${BREND.tagline}, u saradnji s Audio BM (osnovan ${BREND.provajderOd}, više od 30 godina iskustva). Besplatna provjera sluha, slušni aparati (Bernafon, Unitron, Cochlear), baterije, čepovi za uši po mjeri i servis, u šest gradova Bosne i Hercegovine.`,
    '',
  )

  l.push('## Ključne stranice', '')
  l.push(
    `- [Zakazivanje besplatne provjere sluha](${OSNOVNI_URL}/zakazivanje): bezbolno, traje 30–45 minuta, bez obaveze`,
  )
  l.push(`- [Online test sluha](${OSNOVNI_URL}/online-test-sluha): besplatan informativni test sluha za 5 minuta`)
  l.push(`- [Slušni aparati](${OSNOVNI_URL}/slusni-aparati): vrste, modeli i kako odabrati pravi aparat`)
  l.push(`- [Cijene i finansiranje](${OSNOVNI_URL}/cijene-i-finansiranje): cijene i pokrivenost preko FZO/RFZO`)
  l.push(`- [Usluge](${OSNOVNI_URL}/usluge): provjera sluha, prilagođavanje i servis, kohlearni implanti`)
  l.push(`- [Poslovnice](${OSNOVNI_URL}/poslovnice): adrese, telefoni i radno vrijeme po gradu`)
  l.push(`- [Česta pitanja](${OSNOVNI_URL}/cesta-pitanja): odgovori o provjeri, aparatima i servisu`)
  l.push(`- [Savjeti](${OSNOVNI_URL}/savjeti): članci o sluhu i slušnim aparatima`)
  l.push(`- [Kontakt](${OSNOVNI_URL}/kontakt): telefoni i obrazac za upit`)
  l.push('')

  l.push('## Poslovnice (6 gradova u BiH)', '')
  for (const p of poslovnice) {
    const adresa = stvarno(p.adresa)
    const tel = stvarno(p.telefoni?.[0]?.broj)
    const opis = [adresa, tel ? `tel: ${tel}` : ''].filter(Boolean).join(', ')
    l.push(`- [${nazivPoslovnice(p.grad)}](${OSNOVNI_URL}/poslovnice/${p.slug})${opis ? `: ${opis}` : ''}`)
  }
  l.push('')

  l.push('## Usluge', '')
  for (const u of usluge) {
    l.push(`- [${u.naziv}](${OSNOVNI_URL}/usluge/${u.slug}): ${u.kratkiOpis}`)
  }
  l.push('')

  l.push('## Kako zakazati', '')
  l.push(
    `Besplatna provjera sluha zakazuje se online na [stranici za zakazivanje](${OSNOVNI_URL}/zakazivanje) ili telefonom. Pregled je bezbolan, traje 30–45 minuta i ne obavezuje na kupovinu.`,
  )

  return new Response(l.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
