import type { Metadata } from 'next'
import { dajPoslovnice } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
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
    <>
      <ZaglavljeStranice
        mrvice={[{ naziv: 'Poslovnice' }]}
        nadnaslov="Uvijek blizu Vas"
        naslov="Naše poslovnice"
        uvod="Dobro došli u šest gradova širom Bosne i Hercegovine — od sada i u Sarajevu."
      />

      <div className="kontejner pb-16 md:pb-24">
        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <Otkrij className="lg:sticky lg:top-32">
            <div className="povrsina !rounded-[28px] bg-gradient-to-b from-white to-neutral-50 p-6 md:p-9">
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

        <Otkrij className="relative mt-16 overflow-hidden rounded-[28px] border border-neutral-200/70 bg-neutral-50 p-8 text-center md:p-12">
          <div className="mreza-audiogram absolute inset-0" aria-hidden />
          <div className="relative">
            <h2 className="text-h2">Niste sigurni koja Vam je poslovnica najbliža?</h2>
            <p className="uvodni mx-auto mt-3 max-w-xl">
              Zakažite termin, a mi ćemo Vas pozvati i pomoći da odaberete.
            </p>
            <DugmeLink href="/zakazivanje" velicina="veliko" className="mt-7">
              Zakažite besplatnu provjeru sluha
            </DugmeLink>
          </div>
        </Otkrij>
      </div>
    </>
  )
}
