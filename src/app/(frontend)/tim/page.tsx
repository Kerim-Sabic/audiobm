import type { Metadata } from 'next'
import { BadgeCheck, CalendarCheck, Languages, MapPin, Settings2, Stethoscope, UserRound } from 'lucide-react'
import { dajPayload } from '@/lib/podaci'
import { metaStranice, timJsonLd } from '@/lib/seo'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
import { DugmeLink } from '@/components/ui/Dugme'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import { OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import type { Mediji, Poslovnice } from '@/payload-types'

export const metadata: Metadata = metaStranice({
  naslov: 'Naš tim — stručnjaci za sluh',
  opis: 'Upoznajte stručni tim za provjeru sluha, izbor, podešavanje i servis slušnih aparata u sedam poslovnica u BiH.',
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
      {tim.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              timJsonLd(
                tim.map((c) => ({ ime: c.ime, titula: c.titula, biografija: c.biografija, jezici: c.jezici })),
              ),
            ),
          }}
        />
      )}
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
                    {poslovnica && typeof poslovnica === 'object' && (
                      <DugmeLink
                        href={`/zakazivanje?poslovnica=${poslovnica.slug}`}
                        varijanta="sekundarno"
                        className="mt-5 w-full"
                      >
                        Zakažite termin
                      </DugmeLink>
                    )}
                  </div>
                </article>
              </OtkrijStavku>
            )
          })}
        </OtkrijGrupu>
      ) : (
        <div className="relative mt-12 overflow-hidden rounded-[28px] border border-neutral-200/70 bg-neutral-50 p-7 md:p-10">
          <div className="mreza-audiogram absolute inset-0" aria-hidden />
          <div className="relative">
            <div className="mx-auto max-w-2xl text-center">
              <BadgeCheck className="mx-auto size-12 text-brand-600" strokeWidth={1.75} aria-hidden />
              <h2 className="text-h2 mt-5">Stručni tim u svakoj poslovnici</h2>
              <p className="mt-3 text-neutral-600">
                U poslovnici Vas dočekuje tim za provjeru sluha, izbor slušnog aparata, fino
                podešavanje i servis. Svaki termin počinje razgovorom i jasnim objašnjenjem nalaza,
                bez pritiska na kupovinu.
              </p>
            </div>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {[
                {
                  ikona: Stethoscope,
                  naslov: 'Provjera sluha',
                  opis: 'Razgovor, otoskopski pregled i audiometrija u tihoj prostoriji, uz objašnjenje rezultata.',
                },
                {
                  ikona: Settings2,
                  naslov: 'Podešavanje aparata',
                  opis: 'Izbor tipa i tehnologije prema nalazu, navikama, rukovanju i svakodnevnim situacijama.',
                },
                {
                  ikona: CalendarCheck,
                  naslov: 'Kontrole i servis',
                  opis: 'Redovne kontrole, čišćenje, filteri, cjevčice i podrška nakon kupovine aparata.',
                },
              ].map((stavka) => (
                <div key={stavka.naslov} className="rounded-[18px] border border-neutral-200 bg-white p-5">
                  <stavka.ikona className="size-6 text-brand-600" strokeWidth={1.75} aria-hidden />
                  <h3 className="mt-4 text-[18px] font-bold text-neutral-900">{stavka.naslov}</h3>
                  <p className="mt-2 text-[15px] text-neutral-600">{stavka.opis}</p>
                </div>
              ))}
            </div>
            <div className="mt-9 text-center">
              <DugmeLink href="/zakazivanje" velicina="veliko">
                Zakažite termin sa stručnim timom
              </DugmeLink>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
}
