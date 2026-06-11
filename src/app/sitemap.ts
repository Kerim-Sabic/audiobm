import type { MetadataRoute } from 'next'
import { dajPayload, dajPoslovnice, dajUsluge } from '@/lib/podaci'
import { OSNOVNI_URL } from '@/lib/seo'
import { TIPOVI_APARATA } from '@/lib/catalog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await dajPayload()
  const [poslovnice, usluge, proizvodi, objave, akcije] = await Promise.all([
    dajPoslovnice(),
    dajUsluge(),
    payload.find({ collection: 'proizvodi', where: { aktivan: { equals: true } }, limit: 300, depth: 0, draft: false }),
    payload.find({ collection: 'objave', limit: 300, depth: 0, draft: false }),
    payload.find({ collection: 'akcije', limit: 100, depth: 0, draft: false }),
  ])

  const url = (putanja: string, prioritet = 0.7, frekvencija: 'daily' | 'weekly' | 'monthly' = 'weekly') => ({
    url: `${OSNOVNI_URL}${putanja}`,
    lastModified: new Date(),
    changeFrequency: frekvencija,
    priority: prioritet,
  })

  return [
    url('', 1, 'daily'),
    url('/zakazivanje', 0.9),
    url('/online-test-sluha', 0.9),
    url('/slusni-aparati', 0.9),
    url('/poslovnice', 0.9),
    url('/proizvodi', 0.8),
    url('/usluge', 0.8),
    url('/cijene-i-finansiranje', 0.8),
    url('/kontakt', 0.8),
    url('/cesta-pitanja', 0.7),
    url('/o-nama', 0.6),
    url('/tim', 0.5),
    url('/akcije', 0.7, 'daily'),
    url('/savjeti', 0.6),
    url('/politika-privatnosti', 0.2, 'monthly'),
    url('/uslovi-koristenja', 0.2, 'monthly'),
    ...Object.keys(TIPOVI_APARATA).map((tip) => url(`/slusni-aparati/${tip}`, 0.8)),
    ...poslovnice.map((p) => url(`/poslovnice/${p.slug}`, 0.9)),
    ...usluge.map((u) => url(`/usluge/${u.slug}`, 0.8)),
    ...proizvodi.docs.map((p) =>
      url(
        p.kategorija === 'slusni-aparati' ? `/slusni-aparati/modeli/${p.slug}` : `/proizvodi/${p.slug}`,
        0.6,
      ),
    ),
    ...objave.docs.map((o) => url(`/savjeti/${o.slug}`, 0.5, 'monthly')),
    ...akcije.docs.map((a) => url(`/akcije/${a.slug}`, 0.6, 'daily')),
  ]
}
