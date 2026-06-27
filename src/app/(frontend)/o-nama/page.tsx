import type { Metadata } from 'next'
import { Award, HeartHandshake, MapPin, ArrowRight } from 'lucide-react'
import { dajLokacije, brojPoslovnica, opisGradova } from '@/data/locations'
import { metaStranice } from '@/lib/seo'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
import { DugmeLink } from '@/components/ui/Dugme'
import { Otkrij, OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import { Brojac } from '@/components/motion/Brojac'

export async function generateMetadata(): Promise<Metadata> {
  const poslovnice = await dajLokacije()

  return metaStranice({
    naslov: 'O nama — više od 30 godina brige o sluhu',
    opis: `Svijet Sluha — u saradnji s Audio BM. Od prvog dana do ${brojPoslovnica(poslovnice)} poslovnica u BiH: misija, vrijednosti i brendovi sa kojima sarađujemo.`,
    putanja: '/o-nama',
  })
}

export default async function ONamaStranica() {
  const poslovnice = await dajLokacije()
  const ukupanBrojPoslovnica = brojPoslovnica(poslovnice)
  const gradoviOpis = opisGradova(poslovnice)

  return (
    <>
      <ZaglavljeStranice
        mrvice={[{ naziv: 'O nama' }]}
        nadnaslov="Naša priča"
        naslov="Više od 30 godina slušamo — Vas"
        uvod="Svijet Sluha je centar za zdravlje sluha koji, u saradnji s Audio BM-om — audiološkom kućom s više od 30 godina iskustva — brine da ljudi u Bosni i Hercegovini čuju bolje i žive punije. Od prvog audiograma do svakodnevnog održavanja aparata, uz naše korisnike smo godinama, ne samo na dan kupovine."
      />

      <div className="kontejner pb-16 md:pb-24">
        {/* brojke */}
        <OtkrijGrupu className="mt-12 grid gap-5 sm:grid-cols-3">
          {[
            { broj: 32, sufiks: '+', oznaka: 'godine iskustva' },
            { broj: ukupanBrojPoslovnica, sufiks: '', oznaka: 'poslovnica u BiH' },
            { broj: 4, sufiks: '', oznaka: 'zemlje regiona (Audio BM grupa)' },
          ].map((s) => (
            <OtkrijStavku key={s.oznaka} className="h-full">
              <div className="povrsina h-full p-7 text-center">
                <p className="text-[56px] leading-none font-extrabold tracking-tight text-brand-600">
                  <Brojac do={s.broj} sufiks={s.sufiks} />
                </p>
                <p className="mt-2.5 text-neutral-600">{s.oznaka}</p>
              </div>
            </OtkrijStavku>
          ))}
        </OtkrijGrupu>

        {/* misija i vrijednosti */}
        <section className="sekcija !pb-0" aria-labelledby="misija-naslov">
          <Otkrij>
            <p className="nadnaslov">Šta nas vodi</p>
            <h2 id="misija-naslov" className="text-h2 mt-3.5">
              Naša misija
            </h2>
          </Otkrij>
          <OtkrijGrupu className="mt-9 grid gap-5 md:grid-cols-3">
            {[
              {
                ikona: HeartHandshake,
                naslov: 'Strpljenje prije svega',
                opis: 'Gubitak sluha je osjetljiva tema. Zato kod nas nema žurbe ni pritiska — samo razgovor, provjera i jasan savjet.',
              },
              {
                ikona: Award,
                naslov: 'Vrhunska tehnologija',
                opis: 'Nudimo aparate svjetskih proizvođača i držimo korak sa tehnologijom — punjive baterije, Bluetooth, TV adapteri.',
              },
              {
                ikona: MapPin,
                naslov: 'Blizu Vas',
                opis: `${ukupanBrojPoslovnica} poslovnica širom BiH znači da su servis, baterije i podrška uvijek na dohvat ruke — godinama nakon kupovine.`,
              },
            ].map((v) => (
              <OtkrijStavku key={v.naslov} className="h-full">
                <div className="povrsina h-full p-7">
                  <div className="grid size-13 place-items-center rounded-2xl bg-brand-50">
                    <v.ikona className="size-6.5 text-brand-600" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="text-h3 mt-5">{v.naslov}</h3>
                  <p className="mt-2 text-neutral-600">{v.opis}</p>
                </div>
              </OtkrijStavku>
            ))}
          </OtkrijGrupu>
        </section>

        {/* naš put — samo provjerene činjenice */}
        <section className="sekcija !pb-0" aria-labelledby="put-naslov">
          <div className="relative overflow-hidden rounded-[32px] bg-charcoal px-7 py-12 text-white md:px-14 md:py-16">
            <svg
              viewBox="0 0 1200 300"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M0 220 C 200 200, 320 110, 480 120 S 760 220, 920 180 S 1120 80, 1200 70"
                fill="none"
                stroke="white"
                strokeOpacity="0.06"
                strokeWidth="70"
                strokeLinecap="round"
              />
            </svg>
            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
              <div>
                <p className="nadnaslov !text-brand-400">Naš put</p>
                <h2 id="put-naslov" className="text-h2 mt-3.5">
                  Od prvog audiograma do {gradoviOpis}
                </h2>
                <p className="mt-5 leading-relaxed text-neutral-300">
                  Više od tri decenije gradimo povjerenje — strpljivo, pregled po pregled. Danas smo
                  prisutni u {gradoviOpis} Bosne i Hercegovine. Audio BM grupa djeluje i u Srbiji,
                  Sloveniji, Crnoj Gori i Makedoniji.
                </p>
              </div>
              <div className="border-t border-white/10 pt-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-16">
                <p className="text-[12.5px] font-bold tracking-[0.18em] text-neutral-400 uppercase">
                  Brendovi koje nudimo
                </p>
                <p className="mt-4 flex flex-wrap items-center gap-x-10 gap-y-2 text-[21px] font-bold tracking-tight text-white/80">
                  <span>Bernafon</span>
                  <span>Unitron</span>
                  <span>Cochlear</span>
                  <span>Varta</span>
                </p>
                <p className="mt-5 text-[15px] leading-relaxed text-neutral-400">
                  Saradnja sa švajcarskim Bernafonom i kanadskim Unitronom donosi najsavremeniju
                  tehnologiju sluha našim korisnicima.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Otkrij className="mt-16 text-center">
          <DugmeLink href="/zakazivanje" velicina="veliko">
            Upoznajte nas — zakažite besplatnu provjeru sluha
            <ArrowRight className="size-5" aria-hidden />
          </DugmeLink>
        </Otkrij>
      </div>
    </>
  )
}
