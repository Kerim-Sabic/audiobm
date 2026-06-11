import type { Metadata } from 'next'
import { dajPoslovnice } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
import { MapaBiH } from '@/components/poslovnice/MapaBiH'
import { LokacijaKartica } from '@/components/poslovnice/LokacijaKartica'
import { Otkrij, OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
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
      <div className="mt-6 max-w-2xl">
        <p className="nadnaslov">Uvijek blizu Vas</p>
        <h1 className="text-h1 mt-3">Naše poslovnice</h1>
        <p className="uvodni mt-4">
          Dobro došli u šest gradova širom Bosne i Hercegovine — od sada i u Sarajevu.
        </p>
      </div>

      <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <Otkrij className="lg:sticky lg:top-28">
          <div className="rounded-[24px] border border-neutral-200 bg-gradient-to-b from-white to-neutral-50 p-6 shadow-[var(--shadow-lift)] md:p-9">
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
        </Otkrij>

        <OtkrijGrupu className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {poslovnice.map((p) => (
            <OtkrijStavku key={p.id} className="h-full">
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

      <Otkrij className="mreza-tacaka-svijetla mt-16 rounded-[24px] border border-neutral-100 bg-neutral-50 p-8 text-center md:p-12">
        <h2 className="text-h2">Niste sigurni koja Vam je poslovnica najbliža?</h2>
        <p className="uvodni mx-auto mt-3 max-w-xl">
          Zakažite termin, a mi ćemo Vas pozvati i pomoći da odaberete.
        </p>
        <DugmeLink href="/zakazivanje" velicina="veliko" className="mt-7">
          Zakažite besplatnu provjeru sluha
        </DugmeLink>
      </Otkrij>
    </div>
  )
}
