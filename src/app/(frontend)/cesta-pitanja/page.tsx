import type { Metadata } from 'next'
import { dajPitanja } from '@/lib/podaci'
import { metaStranice, pitanjaJsonLd } from '@/lib/seo'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
import { Harmonika } from '@/components/ui/Harmonika'
import { DugmeLink } from '@/components/ui/Dugme'
import { Otkrij } from '@/components/motion/Otkrij'
import { GRUPE_PITANJA } from '@/collections/CestaPitanja'

export const metadata: Metadata = metaStranice({
  naslov: 'Česta pitanja — provjera sluha, cijene, aparati, servis',
  opis: 'Odgovori na pitanja o prvoj posjeti, cijenama i refundaciji, vrstama slušnih aparata, održavanju, servisu i garanciji.',
  putanja: '/cesta-pitanja',
})

export default async function CestaPitanjaStranica() {
  const pitanja = await dajPitanja()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            pitanjaJsonLd(pitanja.map((p) => ({ pitanje: p.pitanje, odgovor: p.odgovor }))),
          ),
        }}
      />
      <ZaglavljeStranice
        mrvice={[{ naziv: 'Česta pitanja' }]}
        nadnaslov="Pitanja i odgovori"
        naslov="Česta pitanja"
        uvod="Sve što nas najčešće pitate — na jednom mjestu. Ne nalazite odgovor? Pozovite nas ili pošaljite poruku."
      />

      <div className="kontejner max-w-4xl pb-16 md:pb-24">
        <div className="mt-12 space-y-14">
          {GRUPE_PITANJA.map((grupa) => {
            const uGrupi = pitanja.filter((p) => p.grupa === grupa.value)
            if (uGrupi.length === 0) return null
            return (
              <Otkrij key={grupa.value} as="section">
                <h2 className="text-h3 mb-5 flex items-center gap-3">
                  <span className="h-6 w-1 rounded-full bg-brand-600" aria-hidden />
                  {grupa.label}
                </h2>
                <Harmonika
                  stavke={uGrupi.map((p) => ({ pitanje: p.pitanje, odgovor: p.odgovor }))}
                  prvaOtvorena={false}
                />
              </Otkrij>
            )
          })}
        </div>

        <Otkrij className="relative mt-16 overflow-hidden rounded-[28px] border border-neutral-200/70 bg-neutral-50 p-8 text-center md:p-12">
          <div className="mreza-audiogram absolute inset-0" aria-hidden />
          <div className="relative">
            <h2 className="text-h2">Imate dodatno pitanje?</h2>
            <p className="mx-auto mt-3 max-w-xl text-neutral-600">
              Pitajte nas direktno — odgovaramo isti radni dan.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3.5">
              <DugmeLink href="/kontakt" velicina="veliko">
                Postavite pitanje
              </DugmeLink>
              <DugmeLink href="/zakazivanje" varijanta="sekundarno" velicina="veliko">
                Zakažite provjeru sluha
              </DugmeLink>
            </div>
          </div>
        </Otkrij>
      </div>
    </>
  )
}
