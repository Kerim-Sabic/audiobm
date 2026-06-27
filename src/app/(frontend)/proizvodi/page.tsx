import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { dajPayload } from '@/lib/podaci'
import { dajLokacije, brojPoslovnica } from '@/data/locations'
import { metaStranice } from '@/lib/seo'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
import { OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import { ProizvodKartica } from '@/components/proizvodi/ProizvodKartica'
import { KATEGORIJE, type Kategorija } from '@/lib/catalog'

export async function generateMetadata(): Promise<Metadata> {
  const poslovnice = await dajLokacije()

  return metaStranice({
    naslov: 'Proizvodi — baterije, čepovi, pribor i medicinski aparati',
    opis: `Varta baterije, čepovi za uši po mjeri, pribor za održavanje i kućni medicinski aparati. Naručite upitom ili telefonom — preuzimanje u ${brojPoslovnica(poslovnice)} poslovnica.`,
    putanja: '/proizvodi',
  })
}

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
    <>
      <ZaglavljeStranice
        mrvice={[{ naziv: 'Proizvodi' }]}
        nadnaslov="Maloprodaja i pribor"
        naslov="Proizvodi"
        uvod="Baterije, čepovi za uši, pribor za održavanje i kućni medicinski aparati. Naručujete jednostavno — upitom putem stranice ili telefonom, a preuzimate u najbližoj poslovnici."
      >
        <nav aria-label="Kategorije proizvoda" className="flex flex-wrap gap-2">
          {KATALOSKE.map((k) => (
            <Link
              key={k}
              href={`/proizvodi/kategorija/${k}`}
              className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-[14.5px] font-semibold text-neutral-700 shadow-sm transition-colors duration-150 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
            >
              {KATEGORIJE[k].naziv}
            </Link>
          ))}
        </nav>
      </ZaglavljeStranice>

      <div className="kontejner pb-16 md:pb-24">
        {KATALOSKE.map((k) => {
          const uKategoriji = proizvodi.filter((p) => p.kategorija === k)
          if (uKategoriji.length === 0) return null
          return (
            <section key={k} className="mt-14 md:mt-20" aria-labelledby={`kat-${k}`}>
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-neutral-200/70 pb-5">
                <div className="max-w-2xl">
                  <h2 id={`kat-${k}`} className="text-h2">
                    {KATEGORIJE[k].naziv}
                  </h2>
                  <p className="mt-1.5 text-neutral-600">{KATEGORIJE[k].opis}</p>
                </div>
                <Link
                  href={`/proizvodi/kategorija/${k}`}
                  className="group inline-flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-brand-700 transition-colors duration-150 hover:text-brand-800"
                >
                  Sve iz kategorije
                  <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden />
                </Link>
              </div>
              <OtkrijGrupu className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {uKategoriji.slice(0, 4).map((p) => (
                  <OtkrijStavku key={p.id} className="h-full">
                    <ProizvodKartica proizvod={p} />
                  </OtkrijStavku>
                ))}
              </OtkrijGrupu>
            </section>
          )
        })}
      </div>
    </>
  )
}
