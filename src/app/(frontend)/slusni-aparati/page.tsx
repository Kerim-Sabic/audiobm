import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BatteryCharging, Bluetooth, Tv } from 'lucide-react'
import { dajPayload } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
import { DugmeLink } from '@/components/ui/Dugme'
import { Otkrij, OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import { ProizvodKartica } from '@/components/proizvodi/ProizvodKartica'
import { UhoVizualizacija } from '@/components/slusni-aparati/UhoVizualizacija'
import { TIPOVI_APARATA } from '@/lib/catalog'

export const metadata: Metadata = metaStranice({
  naslov: 'Slušni aparati — vrste, brendovi i kako odabrati',
  opis: 'Kanalni, zaušni i snažni slušni aparati Bernafon i Unitron. Saznajte koji je pravi za Vas — uz besplatno savjetovanje u 6 gradova BiH.',
  putanja: '/slusni-aparati',
})

export default async function SlusniAparatiStranica() {
  const payload = await dajPayload()
  const { docs: aparati } = await payload.find({
    collection: 'proizvodi',
    where: { and: [{ kategorija: { equals: 'slusni-aparati' } }, { aktivan: { equals: true } }] },
    sort: 'naziv',
    limit: 30,
    depth: 1,
    draft: false,
  })

  return (
    <div className="kontejner py-10 md:py-14">
      <Mrvice stavke={[{ naziv: 'Slušni aparati' }]} />
      <div className="mt-6 max-w-3xl">
        <p className="nadnaslov">Edukativni vodič</p>
        <h1 className="text-h1 mt-3">Slušni aparati</h1>
        <p className="uvodni mt-4">
          Audio BM već više od 30 godina sarađuje sa svjetski poznatim brendovima — švajcarskim{' '}
          <strong>Bernafonom</strong> i kanadskim <strong>Unitronom</strong>. Naši akustičari će Vam
          pomoći da odaberete aparat prilagođen Vašem sluhu, navikama i budžetu.
        </p>
      </div>

      {/* animirana vizualizacija rada aparata */}
      <Otkrij className="mt-12">
        <UhoVizualizacija />
      </Otkrij>

      {/* vrste aparata */}
      <section className="sekcija" aria-labelledby="vrste-naslov">
        <Otkrij>
          <h2 id="vrste-naslov" className="text-h2">
            Koje vrste slušnih aparata postoje?
          </h2>
        </Otkrij>
        <OtkrijGrupu className="mt-8 grid gap-6 md:grid-cols-3">
          {(Object.keys(TIPOVI_APARATA) as (keyof typeof TIPOVI_APARATA)[]).map((tip) => {
            const info = TIPOVI_APARATA[tip]
            const opisi: Record<string, string> = {
              kanalni:
                'Skoro nevidljivi aparati, postavljeni unutar uha i napravljeni po mjeri. Zovu ih i „bubice" — sva elektronika je u ušnom umetku. Odlični za one koji nose naočale i žele diskretan izgled.',
              zausni:
                'Tanka žica vodi od aparata preko ušne školjke u ušni kanal. Pogodni za sve stepene oštećenja sluha, sa Bluetooth povezivanjem i punjivim baterijama.',
              'zausni-snazni':
                'Glasniji zvuk, bolje razumijevanje govora i jednostavno rukovanje — za osobe sa teškim ili izrazito teškim gubitkom sluha.',
            }
            return (
              <OtkrijStavku key={tip}>
                <Link
                  href={`/slusni-aparati/${tip}`}
                  className="group flex h-full flex-col rounded-[16px] border border-neutral-200 bg-white p-7 shadow-sm transition-[box-shadow,transform] duration-250 hover:-translate-y-1 hover:shadow-lg"
                >
                  <h3 className="text-h3">{info.naziv}</h3>
                  <p className="mt-1 font-medium text-brand-700">{info.kratko}</p>
                  <p className="mt-3 text-[16px] text-neutral-600">{opisi[tip]}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-semibold text-brand-700">
                    Pogledajte modele
                    <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </OtkrijStavku>
            )
          })}
        </OtkrijGrupu>
      </section>

      {/* moderna svojstva: punjivi / bluetooth / tv */}
      <section className="sekcija border-y border-neutral-100 bg-neutral-50 -mx-4 px-4 sm:-mx-6 sm:px-6" aria-labelledby="svojstva-naslov">
        <div className="mx-auto max-w-[1200px]">
          <Otkrij>
            <h2 id="svojstva-naslov" className="text-h2">
              Savremeni aparati — više od pojačanog zvuka
            </h2>
          </Otkrij>
          <OtkrijGrupu className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                ikona: BatteryCharging,
                naslov: 'Punjivi aparati',
                opis: 'Umjesto sitnih jednokratnih baterija — litijum-jonska baterija koja se puni preko noći, kao mobitel. Nekoliko sati punjenja dovoljno je za cijeli dan slušanja. Praktičnije, jeftinije na duge staze i bolje za okolinu.',
              },
              {
                ikona: Bluetooth,
                naslov: 'Bluetooth povezivanje',
                opis: 'Telefonski razgovori, muzika i video-pozivi sa unucima — direktno u Vašim aparatima, čisto i jasno. Aparat se povezuje sa pametnim telefonom kao slušalice.',
              },
              {
                ikona: Tv,
                naslov: 'TV adapter',
                opis: 'Zvuk televizora ide bežično pravo u Vaše aparate, kristalno čist. Vi čujete savršeno — a ukućani gledaju program na normalnoj glasnoći. Kraj prepirkama oko daljinskog.',
              },
            ].map((s) => (
              <OtkrijStavku key={s.naslov}>
                <div className="h-full rounded-[16px] border border-neutral-200 bg-white p-7 shadow-sm">
                  <div className="grid size-14 place-items-center rounded-[12px] bg-brand-50">
                    <s.ikona className="size-7 text-brand-600" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="text-h3 mt-5">{s.naslov}</h3>
                  <p className="mt-2 text-neutral-600">{s.opis}</p>
                </div>
              </OtkrijStavku>
            ))}
          </OtkrijGrupu>
        </div>
      </section>

      {/* kako odabrati */}
      <section className="sekcija" aria-labelledby="odabir-naslov">
        <Otkrij>
          <h2 id="odabir-naslov" className="text-h2">
            Kako odabrati pravi aparat?
          </h2>
          <ol className="mt-8 max-w-2xl space-y-5">
            {[
              ['Dođite na besplatnu provjeru sluha', 'Audiogram pokazuje tačno koje tonove i koliko slabije čujete — to je osnova svega.'],
              ['Razgovaramo o Vašoj svakodnevici', 'Gledate li puno televiziju? Idete li na porodična okupljanja? Nosite li naočale? Sve to utiče na izbor.'],
              ['Probate aparat uživo', 'Aparat podesimo prema Vašem nalazu i čujete razliku odmah, u poslovnici.'],
              ['Odlučujete bez pritiska', 'Dobijete jasnu ponudu i sve informacije — odluku donosite Vi, svojim tempom.'],
            ].map(([naslov, opis], i) => (
              <li key={naslov} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-600 font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold text-neutral-900">{naslov}</h3>
                  <p className="mt-1 text-neutral-600">{opis}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-4">
            <DugmeLink href="/zakazivanje" velicina="veliko">
              Zakažite besplatno savjetovanje
            </DugmeLink>
            <DugmeLink href="/cijene-i-finansiranje" varijanta="sekundarno" velicina="veliko">
              Cijene i finansiranje
            </DugmeLink>
          </div>
        </Otkrij>
      </section>

      {/* svi modeli */}
      <section className="sekcija border-t border-neutral-100" aria-labelledby="modeli-naslov">
        <Otkrij>
          <h2 id="modeli-naslov" className="text-h2">
            Naši modeli
          </h2>
          <p className="mt-2 text-neutral-600">
            Pregled modela koje nudimo — za tačnu preporuku i cijenu dođite na besplatno savjetovanje.
          </p>
        </Otkrij>
        <OtkrijGrupu className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {aparati.map((p) => (
            <OtkrijStavku key={p.id}>
              <ProizvodKartica proizvod={p} />
            </OtkrijStavku>
          ))}
        </OtkrijGrupu>
      </section>
    </div>
  )
}
