import { dajPoslovnice, dajUsluge } from '@/lib/podaci'
import { BREND, nazivPoslovnice } from '@/lib/brend'
import { OSNOVNI_URL } from '@/lib/seo'
import { stvarno } from '@/lib/tekst'

// llms.txt — sažet, činjeničan opis za AI asistente (ChatGPT, Claude, Perplexity, Gemini).
// Generiše se iz CMS-a (poslovnice, usluge) i osvježava jednom dnevno.
export const revalidate = 86400

export async function GET() {
  const [poslovnice, usluge] = await Promise.all([dajPoslovnice(), dajUsluge()])
  const l: string[] = []

  l.push(`# ${BREND.naziv}`, '')
  l.push(
    `> ${BREND.naziv} — ${BREND.tagline}. Web prisustvo audiološke kuće Audio BM (osnovana ${BREND.provajderOd}), s više od 30 godina iskustva u Bosni i Hercegovini. Besplatna provjera sluha, slušni aparati (Bernafon, Unitron, Cochlear), baterije, čepovi za uši i servis.`,
    '',
  )
  l.push(`Sajt: ${OSNOVNI_URL}`, '')

  l.push('## Poslovnice (6 gradova u BiH)')
  for (const p of poslovnice) {
    const adresa = stvarno(p.adresa)
    const tel = stvarno(p.telefoni?.[0]?.broj)
    l.push(
      `- ${nazivPoslovnice(p.grad)}${adresa ? `, ${adresa}` : ''}${tel ? ` — tel: ${tel}` : ''} — ${OSNOVNI_URL}/poslovnice/${p.slug}`,
    )
  }
  l.push('')

  l.push('## Usluge')
  for (const u of usluge) {
    l.push(`- ${u.naziv}: ${u.kratkiOpis} — ${OSNOVNI_URL}/usluge/${u.slug}`)
  }
  l.push('')

  l.push('## Ključne stranice')
  l.push(`- Zakazivanje besplatne provjere sluha: ${OSNOVNI_URL}/zakazivanje`)
  l.push(`- Online test sluha (besplatno, 5 min): ${OSNOVNI_URL}/online-test-sluha`)
  l.push(`- Slušni aparati — vrste i modeli: ${OSNOVNI_URL}/slusni-aparati`)
  l.push(`- Cijene i finansiranje: ${OSNOVNI_URL}/cijene-i-finansiranje`)
  l.push(`- Česta pitanja: ${OSNOVNI_URL}/cesta-pitanja`)
  l.push(`- Kontakt: ${OSNOVNI_URL}/kontakt`)
  l.push('')

  l.push('## Kako zakazati')
  l.push(
    `Besplatna provjera sluha zakazuje se online na ${OSNOVNI_URL}/zakazivanje ili telefonom. Pregled je bezbolan, traje 30–45 minuta i ne obavezuje na kupovinu.`,
  )

  return new Response(l.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
