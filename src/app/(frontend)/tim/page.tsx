import type { Metadata } from 'next'
import { Languages, MapPin, UserRound } from 'lucide-react'
import { dajPayload } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import { OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import type { Mediji, Poslovnice } from '@/payload-types'

export const metadata: Metadata = metaStranice({
  naslov: 'Naš tim — stručnjaci za sluh',
  opis: 'Upoznajte akustičare i stručnjake našeg tima u Sarajevu, Banjoj Luci, Gradišci, Bijeljini, Doboju i Brčkom.',
  putanja: '/tim',
})

export default async function TimStranica() {
  const payload = await dajPayload()
  const { docs: tim } = await payload.find({
    collection: 'tim',
    where: { aktivan: { equals: true } },
    sort: 'redoslijed',
    limit: 50,
    depth: 1,
  })

  return (
    <>
      <ZaglavljeStranice
        mrvice={[{ naziv: 'Naš tim' }]}
        nadnaslov="Ljudi iza Svijet Sluha"
        naslov="Naš tim"
        uvod="Ljudi koji će se pobrinuti za Vaš sluh — stručni, strpljivi i uvijek na Vašoj strani."
      />

      <div className="kontejner pb-16 md:pb-24">
      {tim.length > 0 ? (
        <OtkrijGrupu className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tim.map((clan) => {
            const poslovnica = clan.poslovnica as Poslovnice | number | null
            return (
              <OtkrijStavku key={clan.id}>
                <article className="povrsina povrsina-hover h-full overflow-hidden">
                  {clan.fotografija && typeof clan.fotografija === 'object' ? (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <SlikaMedija medij={clan.fotografija as Mediji} fill sizes="(min-width: 640px) 380px, 90vw" />
                    </div>
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center bg-neutral-100">
                      <UserRound className="size-16 text-neutral-300" strokeWidth={1.25} aria-hidden />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-h3">{clan.ime}</h2>
                    {clan.titula && <p className="mt-1 font-medium text-brand-700">{clan.titula}</p>}
                    {poslovnica && typeof poslovnica === 'object' && (
                      <p className="mt-2 flex items-center gap-2 text-[15px] text-neutral-600">
                        <MapPin className="size-4 text-brand-600" aria-hidden />
                        {poslovnica.grad}
                      </p>
                    )}
                    {clan.jezici && clan.jezici.length > 0 && (
                      <p className="mt-1 flex items-center gap-2 text-[15px] text-neutral-600">
                        <Languages className="size-4 text-brand-600" aria-hidden />
                        {clan.jezici.map((j) => j.jezik).join(', ')}
                      </p>
                    )}
                    {clan.biografija && <p className="mt-3 text-[15px] text-neutral-600">{clan.biografija}</p>}
                  </div>
                </article>
              </OtkrijStavku>
            )
          })}
        </OtkrijGrupu>
      ) : (
        <div className="relative mt-12 overflow-hidden rounded-[28px] border border-neutral-200/70 bg-neutral-50 p-16 text-center">
          <div className="mreza-audiogram absolute inset-0" aria-hidden />
          <div className="relative grid place-items-center">
            <UserRound className="size-12 text-neutral-300" strokeWidth={1.25} aria-hidden />
            <p className="mt-4 max-w-md text-neutral-600">
              Predstavljanje tima uskoro — u međuvremenu nas upoznajte uživo, u najbližoj
              poslovnici.
            </p>
          </div>
        </div>
      )}
      </div>
    </>
  )
}
