import type { Metadata } from 'next'
import { Award, HeartHandshake, MapPin } from 'lucide-react'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
import { DugmeLink } from '@/components/ui/Dugme'
import { Otkrij, OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import { Brojac } from '@/components/motion/Brojac'

export const metadata: Metadata = metaStranice({
  naslov: 'O nama — više od 30 godina brige o sluhu',
  opis: 'Audio BM priča: od prvog dana do šest poslovnica u BiH. Misija, vrijednosti i brendovi sa kojima sarađujemo.',
  putanja: '/o-nama',
})

// Provjerene činjenice: 32 godine rada (sa stare stranice), 6 poslovnica.
// Ostale prekretnice mora potvrditi vlasnik.
const PREKRETNICE = [
  {
    godina: '1990-e',
    naslov: 'Počeci',
    opis: '[OWNER_INPUT_PLACEHOLDER: godina i mjesto osnivanja, kako je sve počelo — kratka priča osnivača]',
  },
  {
    godina: '[GODINA]',
    naslov: 'Širenje mreže poslovnica',
    opis: '[OWNER_INPUT_PLACEHOLDER: redoslijed otvaranja poslovnica — Banja Luka, Gradiška, Bijeljina, Doboj, Brčko]',
  },
  {
    godina: '[GODINA]',
    naslov: 'Saradnja sa svjetskim brendovima',
    opis: 'Saradnja sa švajcarskim brendom Bernafon i kanadskim Unitronom donosi najsavremeniju tehnologiju našim korisnicima. [CONFIRM_PARTNERSHIP_PLACEHOLDER]',
  },
  {
    godina: '2026',
    naslov: 'Dolazak u Sarajevo',
    opis: 'Otvaramo šestu poslovnicu — prvu u Sarajevu. [ADRESA_PLACEHOLDER]',
  },
]

export default function ONamaStranica() {
  return (
    <div className="kontejner py-10 md:py-14">
      <Mrvice stavke={[{ naziv: 'O nama' }]} />
      <div className="mt-6 max-w-3xl">
        <h1 className="text-h1">Više od 30 godina slušamo — Vas</h1>
        <p className="mt-4 text-[18px] text-neutral-600">
          Audio BM je porodica stručnjaka posvećenih jednom cilju: da ljudi u Bosni i Hercegovini
          čuju bolje i žive punije. Od prvog audiograma do svakodnevnog održavanja aparata — uz naše
          korisnike smo godinama, ne samo na dan kupovine.
        </p>
      </div>

      {/* brojke */}
      <OtkrijGrupu className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          { broj: 32, sufiks: '+', oznaka: 'godine iskustva' },
          { broj: 6, sufiks: '', oznaka: 'poslovnica u BiH' },
          { broj: 4, sufiks: '', oznaka: 'zemlje regiona (Audio BM grupa)' },
        ].map((s) => (
          <OtkrijStavku key={s.oznaka}>
            <div className="rounded-[16px] border border-neutral-200 bg-white p-7 text-center shadow-sm">
              <p className="text-display text-brand-600">
                <Brojac do={s.broj} sufiks={s.sufiks} />
              </p>
              <p className="mt-1 text-neutral-600">{s.oznaka}</p>
            </div>
          </OtkrijStavku>
        ))}
      </OtkrijGrupu>

      {/* misija i vrijednosti */}
      <section className="sekcija" aria-labelledby="misija-naslov">
        <Otkrij>
          <h2 id="misija-naslov" className="text-h2">
            Naša misija
          </h2>
        </Otkrij>
        <OtkrijGrupu className="mt-8 grid gap-6 md:grid-cols-3">
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
              opis: 'Šest poslovnica širom BiH znači da su servis, baterije i podrška uvijek na dohvat ruke — godinama nakon kupovine.',
            },
          ].map((v) => (
            <OtkrijStavku key={v.naslov}>
              <div className="h-full rounded-[16px] border border-neutral-200 bg-white p-7 shadow-sm">
                <div className="grid size-14 place-items-center rounded-[12px] bg-brand-50">
                  <v.ikona className="size-7 text-brand-600" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="text-h3 mt-5">{v.naslov}</h3>
                <p className="mt-2 text-neutral-600">{v.opis}</p>
              </div>
            </OtkrijStavku>
          ))}
        </OtkrijGrupu>
      </section>

      {/* historijat */}
      <section className="sekcija border-t border-neutral-100" aria-labelledby="historijat-naslov">
        <h2 id="historijat-naslov" className="text-h2">
          Naš put
        </h2>
        <ol className="relative mt-10 max-w-2xl space-y-10 border-l-2 border-brand-200 pl-8">
          {PREKRETNICE.map((p) => (
            <Otkrij key={p.naslov} as="li" className="relative">
              <span className="absolute top-1 -left-[41px] grid size-5 place-items-center rounded-full border-2 border-brand-600 bg-white" aria-hidden>
                <span className="size-2 rounded-full bg-brand-600" />
              </span>
              <p className="text-small font-bold tracking-wide text-brand-700 uppercase">{p.godina}</p>
              <h3 className="text-h3 mt-1">{p.naslov}</h3>
              <p className="mt-2 text-neutral-600">{p.opis}</p>
            </Otkrij>
          ))}
        </ol>
      </section>

      {/* certifikati */}
      <Otkrij className="rounded-[16px] bg-neutral-50 p-8">
        <h2 className="text-h3">Certifikati i licence</h2>
        <p className="mt-2 text-neutral-600">
          [PLACEHOLDER: certifikati, licence i članstva — dostavlja vlasnik]
        </p>
      </Otkrij>

      <div className="mt-14 text-center">
        <DugmeLink href="/zakazivanje" velicina="veliko">
          Upoznajte nas — zakažite besplatnu provjeru sluha
        </DugmeLink>
      </div>
    </div>
  )
}
