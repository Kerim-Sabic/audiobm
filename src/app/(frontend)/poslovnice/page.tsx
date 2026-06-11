import type { Metadata } from 'next'
import { dajPoslovnice } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
import { MapaBiH } from '@/components/poslovnice/MapaBiH'
import { LokacijaKartica } from '@/components/poslovnice/LokacijaKartica'
import { OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import { DugmeLink } from '@/components/ui/Dugme'

export const metadata: Metadata = metaStranice({
  naslov: 'Poslovnice — Sarajevo, Banja Luka, Gradiška, Bijeljina, Doboj, Brčko',
  opis: 'Audio BM poslovnice u šest gradova BiH. Pronađite najbližu, pozovite ili zakažite besplatnu provjeru sluha.',
  putanja: '/poslovnice',
})

export default async function PoslovniceStranica() {
  const poslovnice = await dajPoslovnice()

  return (
    <div className="kontejner py-10 md:py-14">
      <Mrvice stavke={[{ naziv: 'Poslovnice' }]} />
      <h1 className="text-h1 mt-6">Naše poslovnice</h1>
      <p className="mt-3 max-w-2xl text-[18px] text-neutral-600">
        Dobro došli u šest gradova širom Bosne i Hercegovine — od sada i u Sarajevu.
      </p>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-2">
        <div className="rounded-[16px] border border-neutral-200 bg-white p-6">
          <MapaBiH
            lokacije={poslovnice.map((p) => ({
              slug: p.slug,
              grad: p.grad,
              geoSirina: p.geoSirina,
              geoDuzina: p.geoDuzina,
              novaPoslovnica: p.novaPoslovnica,
            }))}
          />
        </div>

        <OtkrijGrupu className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {poslovnice.map((p) => (
            <OtkrijStavku key={p.id}>
              <LokacijaKartica
                lokacija={{
                  slug: p.slug,
                  grad: p.grad,
                  adresa: p.adresa,
                  telefon: p.telefoni?.[0]?.broj,
                  novaPoslovnica: p.novaPoslovnica,
                }}
              />
            </OtkrijStavku>
          ))}
        </OtkrijGrupu>
      </div>

      <div className="mt-14 rounded-[16px] bg-neutral-50 p-8 text-center md:p-12">
        <h2 className="text-h2">Niste sigurni koja Vam je poslovnica najbliža?</h2>
        <p className="mx-auto mt-3 max-w-xl text-neutral-600">
          Zakažite termin, a mi ćemo Vas pozvati i pomoći da odaberete.
        </p>
        <DugmeLink href="/zakazivanje" velicina="veliko" className="mt-6">
          Zakažite besplatnu provjeru sluha
        </DugmeLink>
      </div>
    </div>
  )
}
