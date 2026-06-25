import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BatteryCharging, Bluetooth, Tv } from 'lucide-react'
import { dajPayload } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
import { DugmeLink } from '@/components/ui/Dugme'
import { SekcijaZaglavlje } from '@/components/ui/SekcijaZaglavlje'
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
    <>
      <ZaglavljeStranice
        mrvice={[{ naziv: 'Slušni aparati' }]}
        nadnaslov="Edukativni vodič"
        naslov="Slušni aparati"
        uvod={
          <>
            Uz Audio BM već više od 30 godina sarađujemo sa svjetski poznatim brendovima — švajcarskim{' '}
            <strong className="font-semibold text-neutral-800">Bernafonom</strong> i kanadskim{' '}
            <strong className="font-semibold text-neutral-800">Unitronom</strong>. Naši akustičari će
            Vam pomoći da odaberete aparat prilagođen Vašem sluhu, navikama i budžetu.
          </>
        }
        slika={{
          src: '/media/site-refresh/hearing-aids-page.png',
          alt: 'Audiologinja pokazuje savremeni slušni aparat korisniku tokom savjetovanja',
        }}
      />

      <div className="kontejner">
        {/* animirana vizualizacija rada aparata */}
        <Otkrij className="mt-12 md:mt-16">
          <UhoVizualizacija />
        </Otkrij>

        {/* vrste aparata */}
        <section className="sekcija" aria-labelledby="vrste-naslov">
          <SekcijaZaglavlje
            id="vrste-naslov"
            nadnaslov="Tri osnovne vrste"
            naslov="Koje vrste slušnih aparata postoje?"
            centrirano={false}
          />
          <OtkrijGrupu className="mt-10 grid gap-5 md:grid-cols-3">
            {(Object.keys(TIPOVI_APARATA) as (keyof typeof TIPOVI_APARATA)[]).map((tip, i) => {
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
                <OtkrijStavku key={tip} className="h-full">
                  <Link
                    href={`/slusni-aparati/${tip}`}
                    className="povrsina povrsina-hover group flex h-full flex-col p-7"
                  >
                    <span className="text-[13px] font-extrabold tracking-[0.2em] text-neutral-300" aria-hidden>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-h3 mt-3">{info.naziv}</h3>
                    <p className="mt-1.5 font-medium text-brand-700">{info.kratko}</p>
                    <p className="mt-3 flex-1 text-[16px] text-neutral-600">{opisi[tip]}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 font-semibold text-brand-700">
                      Pogledajte modele
                      <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden />
                    </span>
                  </Link>
                </OtkrijStavku>
              )
            })}
          </OtkrijGrupu>
        </section>
      </div>

      {/* moderna svojstva: punjivi / bluetooth / tv — puna traka */}
      <section
        className="sekcija relative overflow-hidden border-y border-neutral-200/60 bg-neutral-50"
        aria-labelledby="svojstva-naslov"
      >
        <div className="mreza-audiogram absolute inset-0" aria-hidden />
        <div className="kontejner relative">
          <SekcijaZaglavlje
            id="svojstva-naslov"
            nadnaslov="Savremena tehnologija"
            naslov="Savremeni aparati — više od pojačanog zvuka"
            centrirano={false}
          />
          <OtkrijGrupu className="mt-10 grid gap-5 md:grid-cols-3">
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
              <OtkrijStavku key={s.naslov} className="h-full">
                <div className="povrsina h-full p-7">
                  <div className="grid size-13 place-items-center rounded-2xl bg-brand-50">
                    <s.ikona className="size-6.5 text-brand-600" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="text-h3 mt-5">{s.naslov}</h3>
                  <p className="mt-2 text-neutral-600">{s.opis}</p>
                </div>
              </OtkrijStavku>
            ))}
          </OtkrijGrupu>
        </div>
      </section>

      <div className="kontejner">
        {/* kako odabrati */}
        <section className="sekcija" aria-labelledby="odabir-naslov">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <Otkrij className="lg:sticky lg:top-36 lg:self-start">
              <p className="nadnaslov">Bez pritiska, Vašim tempom</p>
              <h2 id="odabir-naslov" className="text-h2 mt-3.5">
                Kako odabrati pravi aparat?
              </h2>
              <p className="uvodni mt-4">
                Pravi aparat nije najskuplji, nego onaj koji odgovara Vašem sluhu i navikama. Do
                njega dolazimo zajedno, u četiri koraka.
              </p>
              <div className="mt-8 flex flex-wrap gap-3.5">
                <DugmeLink href="/zakazivanje" velicina="veliko">
                  Zakažite besplatno savjetovanje
                </DugmeLink>
                <DugmeLink href="/cijene-i-finansiranje" varijanta="sekundarno" velicina="veliko">
                  Cijene i finansiranje
                </DugmeLink>
              </div>
            </Otkrij>
            <OtkrijGrupu>
              {[
                ['Dođite na besplatnu provjeru sluha', 'Audiogram pokazuje tačno koje tonove i koliko slabije čujete — to je osnova svega.'],
                ['Razgovaramo o Vašoj svakodnevici', 'Gledate li puno televiziju? Idete li na porodična okupljanja? Nosite li naočale? Sve to utiče na izbor.'],
                ['Probate aparat uživo', 'Aparat podesimo prema Vašem nalazu i čujete razliku odmah, u poslovnici.'],
                ['Odlučujete bez pritiska', 'Dobijete jasnu ponudu i sve informacije — odluku donosite Vi, svojim tempom.'],
              ].map(([naslov, opis], i) => (
                <OtkrijStavku key={naslov}>
                  <div className="flex gap-5 border-b border-neutral-200/80 py-6 first:pt-0 last:border-b-0">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-brand-100 bg-brand-50 text-[17px] font-extrabold text-brand-700">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-[18px] font-bold text-neutral-900">{naslov}</h3>
                      <p className="mt-1 text-neutral-600">{opis}</p>
                    </div>
                  </div>
                </OtkrijStavku>
              ))}
            </OtkrijGrupu>
          </div>
        </section>

        {/* svi modeli */}
        {aparati.length > 0 && (
          <section className="sekcija border-t border-neutral-200/60 pt-14 md:pt-20" aria-labelledby="modeli-naslov">
            <SekcijaZaglavlje
              id="modeli-naslov"
              nadnaslov="Katalog"
              naslov="Naši modeli"
              uvod="Pregled modela koje nudimo — za tačnu preporuku i cijenu dođite na besplatno savjetovanje."
              centrirano={false}
            />
            <OtkrijGrupu className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {aparati.map((p) => (
                <OtkrijStavku key={p.id} className="h-full">
                  <ProizvodKartica proizvod={p} />
                </OtkrijStavku>
              ))}
            </OtkrijGrupu>
          </section>
        )}
      </div>
    </>
  )
}
