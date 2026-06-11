import type { Metadata } from 'next'
import { Languages, MapPin, UserRound } from 'lucide-react'
import { dajPayload } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import { OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import type { Mediji, Poslovnice } from '@/payload-types'

export const metadata: Metadata = metaStranice({
  naslov: 'Naš tim — stručnjaci za sluh',
  opis: 'Upoznajte akustičare i stručnjake Audio BM tima u Sarajevu, Banjoj Luci, Gradišci, Bijeljini, Doboju i Brčkom.',
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
    <div className="kontejner py-10 md:py-14">
      <Mrvice stavke={[{ naziv: 'Naš tim' }]} />
      <h1 className="text-h1 mt-6">Naš tim</h1>
      <p className="mt-3 max-w-2xl text-[18px] text-neutral-600">
        Ljudi koji će se pobrinuti za Vaš sluh — stručni, strpljivi i uvijek na Vašoj strani.
      </p>

      {tim.length > 0 ? (
        <OtkrijGrupu className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tim.map((clan) => {
            const poslovnica = clan.poslovnica as Poslovnice | number | null
            return (
              <OtkrijStavku key={clan.id}>
                <article className="h-full overflow-hidden rounded-[16px] border border-neutral-200 bg-white shadow-sm transition-[box-shadow,transform] duration-250 hover:-translate-y-1 hover:shadow-lg">
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
        <div className="mt-12 grid place-items-center rounded-[16px] border-2 border-dashed border-neutral-300 bg-neutral-50 p-16 text-center">
          <UserRound className="size-12 text-neutral-300" strokeWidth={1.25} aria-hidden />
          <p className="mt-4 max-w-md font-medium text-neutral-600">[ALL_STAFF_DATA_PLACEHOLDER]</p>
          <p className="text-small mt-2 max-w-md text-neutral-500">
            Podaci o zaposlenima (imena, titule, fotografije, poslovnice, jezici) unose se u
            administraciji: Sadržaj → Tim.
          </p>
        </div>
      )}
    </div>
  )
}
