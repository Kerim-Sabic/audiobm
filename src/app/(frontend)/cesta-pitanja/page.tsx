import type { Metadata } from 'next'
import { dajPitanja } from '@/lib/podaci'
import { metaStranice, pitanjaJsonLd } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
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
    <div className="kontejner py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            pitanjaJsonLd(pitanja.map((p) => ({ pitanje: p.pitanje, odgovor: p.odgovor }))),
          ),
        }}
      />
      <Mrvice stavke={[{ naziv: 'Česta pitanja' }]} />
      <h1 className="text-h1 mt-6">Česta pitanja</h1>
      <p className="mt-3 max-w-2xl text-[18px] text-neutral-600">
        Sve što nas najčešće pitate — na jednom mjestu. Ne nalazite odgovor? Pozovite nas ili
        pošaljite poruku.
      </p>

      <div className="mt-12 space-y-12">
        {GRUPE_PITANJA.map((grupa) => {
          const uGrupi = pitanja.filter((p) => p.grupa === grupa.value)
          if (uGrupi.length === 0) return null
          return (
            <Otkrij key={grupa.value} as="section">
              <h2 className="text-h2 mb-5">{grupa.label}</h2>
              <Harmonika
                stavke={uGrupi.map((p) => ({ pitanje: p.pitanje, odgovor: p.odgovor }))}
              />
            </Otkrij>
          )
        })}
      </div>

      <div className="mt-16 rounded-[16px] bg-neutral-50 p-8 text-center md:p-12">
        <h2 className="text-h2">Imate dodatno pitanje?</h2>
        <p className="mx-auto mt-3 max-w-xl text-neutral-600">
          Pitajte nas direktno — odgovaramo isti radni dan.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <DugmeLink href="/kontakt" velicina="veliko">
            Postavite pitanje
          </DugmeLink>
          <DugmeLink href="/zakazivanje" varijanta="sekundarno" velicina="veliko">
            Zakažite provjeru sluha
          </DugmeLink>
        </div>
      </div>
    </div>
  )
}
