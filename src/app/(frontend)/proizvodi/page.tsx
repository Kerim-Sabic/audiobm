import type { Metadata } from 'next'
import Link from 'next/link'
import { dajPayload } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
import { OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import { ProizvodKartica } from '@/components/proizvodi/ProizvodKartica'
import { KATEGORIJE, type Kategorija } from '@/lib/catalog'

export const metadata: Metadata = metaStranice({
  naslov: 'Proizvodi — baterije, čepovi, pribor i medicinski aparati',
  opis: 'Varta baterije, čepovi za uši po mjeri, pribor za održavanje i kućni medicinski aparati. Naručite upitom ili telefonom — preuzimanje u 6 poslovnica.',
  putanja: '/proizvodi',
})

// maloprodajni katalog — slušni aparati imaju vlastitu edukativnu stranicu
const KATALOSKE: Kategorija[] = [
  'baterije',
  'cepovi-za-usi',
  'pribor-i-odrzavanje',
  'kucni-medicinski-aparati',
  'slusni-implanti',
  'profesionalna-oprema',
]

export default async function ProizvodiStranica() {
  const payload = await dajPayload()
  const { docs: proizvodi } = await payload.find({
    collection: 'proizvodi',
    where: {
      and: [{ kategorija: { in: KATALOSKE.join(',') } }, { aktivan: { equals: true } }],
    },
    sort: 'kategorija',
    limit: 100,
    depth: 1,
    draft: false,
  })

  return (
    <div className="kontejner py-10 md:py-14">
      <Mrvice stavke={[{ naziv: 'Proizvodi' }]} />
      <h1 className="text-h1 mt-6">Proizvodi</h1>
      <p className="mt-3 max-w-2xl text-[18px] text-neutral-600">
        Baterije, čepovi za uši, pribor za održavanje i kućni medicinski aparati. Naručujete
        jednostavno — upitom putem stranice ili telefonom, a preuzimate u najbližoj poslovnici.
      </p>

      <nav aria-label="Kategorije proizvoda" className="mt-8 flex flex-wrap gap-2">
        {KATALOSKE.map((k) => (
          <Link
            key={k}
            href={`/proizvodi/kategorija/${k}`}
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-[15px] font-medium text-neutral-700 transition-colors duration-150 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
          >
            {KATEGORIJE[k].naziv}
          </Link>
        ))}
      </nav>

      {KATALOSKE.map((k) => {
        const uKategoriji = proizvodi.filter((p) => p.kategorija === k)
        if (uKategoriji.length === 0) return null
        return (
          <section key={k} className="mt-14" aria-labelledby={`kat-${k}`}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 id={`kat-${k}`} className="text-h2">
                {KATEGORIJE[k].naziv}
              </h2>
              <Link
                href={`/proizvodi/kategorija/${k}`}
                className="shrink-0 text-[15px] font-semibold text-brand-700 hover:underline"
              >
                Sve iz kategorije
              </Link>
            </div>
            <p className="mt-1 text-neutral-600">{KATEGORIJE[k].opis}</p>
            <OtkrijGrupu className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {uKategoriji.slice(0, 4).map((p) => (
                <OtkrijStavku key={p.id}>
                  <ProizvodKartica proizvod={p} />
                </OtkrijStavku>
              ))}
            </OtkrijGrupu>
          </section>
        )
      })}
    </div>
  )
}
