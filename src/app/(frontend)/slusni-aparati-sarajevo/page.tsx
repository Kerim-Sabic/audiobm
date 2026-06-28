import type { Metadata } from 'next'
import Image from 'next/image'
import { CalendarCheck, CheckCircle2, Headphones, MapPin, ShieldCheck, Sparkles } from 'lucide-react'
import { dajOcjenu } from '@/lib/podaci'
import { dajLokaciju } from '@/data/locations'
import { BREND } from '@/lib/brend'
import { OSNOVNI_URL, metaStranice, pitanjaJsonLd, poslovnicaJsonLd } from '@/lib/seo'
import { DugmeLink } from '@/components/ui/Dugme'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
import { SekcijaZaglavlje } from '@/components/ui/SekcijaZaglavlje'
import { Otkrij, OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'

export const revalidate = 3600

const PUTANJA = '/slusni-aparati-sarajevo'
const ADRESA = 'Fra Anđela Zvizdovića 1, UNITIC neboderi'

const FAQ = [
  {
    pitanje: 'Gdje mogu kupiti slušne aparate u Sarajevu?',
    odgovor:
      'Slušne aparate u Sarajevu možete pogledati i isprobati u centru Svijet Sluha, Audio BM, na adresi Fra Anđela Zvizdovića 1 u UNITIC neboderima.',
  },
  {
    pitanje: 'Da li je provjera sluha u Sarajevu besplatna?',
    odgovor:
      'Da. Provjera sluha i prvo savjetovanje u poslovnici Svijet Sluha Sarajevo su besplatni i bez obaveze kupovine.',
  },
  {
    pitanje: 'Koje brendove slušnih aparata nudite u Sarajevu?',
    odgovor:
      'U Sarajevu možete dobiti savjetovanje i izbor slušnih aparata svjetskih brendova Bernafon i Unitron, uključujući punjive, Bluetooth i diskretne modele.',
  },
  {
    pitanje: 'Kako znam koji slušni aparat je pravi za mene?',
    odgovor:
      'Pravi aparat se bira prema audiogramu, stepenu oštećenja sluha, svakodnevnim navikama, načinu rukovanja i budžetu. Zato prvo radimo provjeru sluha i razgovor.',
  },
]

export async function generateMetadata(): Promise<Metadata> {
  return metaStranice({
    naslov: 'Slušni aparati Sarajevo — besplatna provjera sluha',
    opis:
      'Slušni aparati Sarajevo: posjetite Svijet Sluha u UNITIC-u, Fra Anđela Zvizdovića 1. Besplatna provjera sluha, Bernafon i Unitron aparati.',
    putanja: PUTANJA,
    ogSlika: `${OSNOVNI_URL}/media/ulaz-svijet-sluha-sarajevo-unitic.webp`,
  })
}

function serviceJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${OSNOVNI_URL}${PUTANJA}#usluga`,
    name: 'Slušni aparati Sarajevo',
    serviceType: 'Slušni aparati i besplatna provjera sluha',
    description:
      'Savjetovanje, provjera sluha i odabir slušnih aparata Bernafon i Unitron u centru Svijet Sluha Sarajevo.',
    url: `${OSNOVNI_URL}${PUTANJA}`,
    provider: { '@type': 'Organization', '@id': `${OSNOVNI_URL}/#organizacija`, name: BREND.naziv },
    areaServed: [
      { '@type': 'City', name: 'Sarajevo' },
      { '@type': 'AdministrativeArea', name: 'Kanton Sarajevo' },
    ],
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceLocation: { '@type': 'Place', '@id': `${OSNOVNI_URL}/poslovnice/sarajevo#klinika` },
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BAM',
      name: 'Besplatna provjera sluha i savjetovanje',
      url: `${OSNOVNI_URL}/zakazivanje?poslovnica=sarajevo`,
      availability: 'https://schema.org/InStock',
    },
  }
}

export default async function SlusniAparatiSarajevoStranica() {
  const poslovnica = await dajLokaciju('sarajevo')
  const ocjena = poslovnica ? await dajOcjenu(poslovnica.id) : undefined

  return (
    <>
      {poslovnica && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(poslovnicaJsonLd(poslovnica, ocjena)) }}
        />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pitanjaJsonLd(FAQ)) }} />

      <ZaglavljeStranice
        mrvice={[{ naziv: 'Slušni aparati', putanja: '/slusni-aparati' }, { naziv: 'Sarajevo' }]}
        nadnaslov="Svijet Sluha Sarajevo"
        naslov="Slušni aparati Sarajevo"
        uvod={
          <>
            Ako tražite <strong className="font-semibold text-neutral-900">slušne aparate u Sarajevu</strong>,
            dođite u Svijet Sluha, Audio BM centar u UNITIC-u. Na jednoj adresi dobijate
            besplatnu provjeru sluha, stručno savjetovanje i izbor Bernafon i Unitron aparata.
          </>
        }
        slika={{
          src: '/media/ulaz-svijet-sluha-sarajevo-unitic.webp',
          alt: 'Ulaz u Svijet Sluha Sarajevo u UNITIC neboderima',
        }}
      >
        <div className="flex flex-wrap gap-3.5">
          <DugmeLink href="/zakazivanje?poslovnica=sarajevo" velicina="veliko">
            <CalendarCheck className="size-5" aria-hidden />
            Zakažite besplatnu provjeru
          </DugmeLink>
          <DugmeLink href="/poslovnice/sarajevo" varijanta="sekundarno" velicina="veliko">
            <MapPin className="size-5" aria-hidden />
            Poslovnica Sarajevo
          </DugmeLink>
        </div>
      </ZaglavljeStranice>

      <div className="kontejner">
        <section className="sekcija" aria-labelledby="odgovor-naslov">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Otkrij>
              <p className="nadnaslov">Kratak odgovor</p>
              <h2 id="odgovor-naslov" className="text-h2 mt-3">
                Gdje otići za slušne aparate u Sarajevu?
              </h2>
              <p className="uvodni mt-4">
                Svijet Sluha Sarajevo nalazi se na adresi {ADRESA}. Termin možete zakazati
                online, a prva provjera sluha i savjetovanje su besplatni.
              </p>
            </Otkrij>

            <OtkrijGrupu className="grid gap-4 sm:grid-cols-2">
              {[
                ['Adresa u centru grada', `${ADRESA}, Sarajevo`],
                ['Besplatna provjera sluha', 'Audiogram, razgovor i preporuka bez obaveze kupovine'],
                ['Bernafon i Unitron', 'Diskretni, punjivi, Bluetooth i snažni modeli aparata'],
                ['Isprobavanje uživo', 'Podešavanje prema Vašem nalazu i svakodnevnim navikama'],
              ].map(([naslov, opis]) => (
                <OtkrijStavku key={naslov}>
                  <div className="h-full border-l-4 border-brand-600 bg-neutral-50 p-5">
                    <h3 className="text-[18px] font-bold text-neutral-900">{naslov}</h3>
                    <p className="mt-1.5 text-[15.5px] text-neutral-650">{opis}</p>
                  </div>
                </OtkrijStavku>
              ))}
            </OtkrijGrupu>
          </div>
        </section>

        <section className="sekcija border-t border-neutral-200/70" aria-labelledby="zasto-naslov">
          <SekcijaZaglavlje
            id="zasto-naslov"
            nadnaslov="Od pregleda do podešavanja"
            naslov="Zašto odabrati Svijet Sluha u Sarajevu?"
            uvod="Slušni aparat mora odgovarati Vašem sluhu, ali i životu koji stvarno živite. Zato izbor ne svodimo samo na model i cijenu."
            centrirano={false}
          />

          <OtkrijGrupu className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                ikona: Headphones,
                naslov: 'Precizna provjera sluha',
                opis: 'Provjera pokazuje koje frekvencije slabije čujete i koliko pojačanja je potrebno za jasan govor.',
              },
              {
                ikona: Sparkles,
                naslov: 'Modeli za različite potrebe',
                opis: 'Kanalni, zaušni, punjivi i Bluetooth aparati biraju se prema nalazu, rukovanju i svakodnevnim situacijama.',
              },
              {
                ikona: ShieldCheck,
                naslov: 'Podrška nakon kupovine',
                opis: 'Podešavanje, čišćenje, baterije, filteri i servis dostupni su kroz Audio BM mrežu u Bosni i Hercegovini.',
              },
            ].map((stavka) => (
              <OtkrijStavku key={stavka.naslov} className="h-full">
                <div className="h-full border border-neutral-200 bg-white p-7 shadow-sm">
                  <div className="grid size-12 place-items-center rounded-2xl bg-brand-50">
                    <stavka.ikona className="size-6 text-brand-600" strokeWidth={1.8} aria-hidden />
                  </div>
                  <h3 className="text-h3 mt-5">{stavka.naslov}</h3>
                  <p className="mt-2 text-neutral-600">{stavka.opis}</p>
                </div>
              </OtkrijStavku>
            ))}
          </OtkrijGrupu>
        </section>

        <section className="sekcija border-t border-neutral-200/70" aria-labelledby="proces-naslov">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <Otkrij className="lg:sticky lg:top-32 lg:self-start">
              <p className="nadnaslov">Kako izgleda termin</p>
              <h2 id="proces-naslov" className="text-h2 mt-3">
                Do preporuke u četiri jasna koraka
              </h2>
              <p className="uvodni mt-4">
                Ne morate znati koji aparat Vam treba prije dolaska. Dovoljno je da zakažete
                termin i donesete pitanja koja su Vam važna.
              </p>
              <div className="mt-8 flex flex-wrap gap-3.5">
                <DugmeLink href="/zakazivanje?poslovnica=sarajevo">Zakažite termin</DugmeLink>
                <DugmeLink href="/savjeti/svijet-sluha-sarajevo-slusni-aparati-provjera-sluha" varijanta="duh">
                  Pogledajte centar
                </DugmeLink>
              </div>
            </Otkrij>

            <OtkrijGrupu>
              {[
                ['Provjera sluha', 'Mjerimo sluh i dobijamo audiogram koji jasno pokazuje stepen oštećenja.'],
                ['Razgovor o navikama', 'Važno je da li najviše razgovarate u kući, na poslu, u restoranu ili uz televizor.'],
                ['Probno podešavanje', 'Aparat se podešava prema nalazu kako biste odmah čuli razliku u govoru i prostoru.'],
                ['Jasna preporuka', 'Dobijate objašnjenje modela, održavanja, garancije, servisa i realnih očekivanja.'],
              ].map(([naslov, opis], index) => (
                <OtkrijStavku key={naslov}>
                  <div className="flex gap-5 border-b border-neutral-200/80 py-6 first:pt-0 last:border-b-0">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-brand-100 bg-brand-50 text-[17px] font-extrabold text-brand-700">
                      {index + 1}
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
      </div>

      <section className="sekcija border-y border-neutral-200/70 bg-neutral-50" aria-labelledby="prostor-naslov">
        <div className="kontejner">
          <SekcijaZaglavlje
            id="prostor-naslov"
            nadnaslov="Stvarni centar u Sarajevu"
            naslov="Pogledajte prostor u UNITIC-u"
            uvod="Google bolje razumije lokalnu uslugu kada stranica jasno poveže grad, adresu, stvarne fotografije, uslugu i zakazivanje."
            centrirano={false}
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <Otkrij className="relative min-h-[320px] overflow-hidden rounded-[24px] shadow-[var(--shadow-lift)]">
              <Image
                src="/media/interijer-centra-svijet-sluha-sarajevo.webp"
                alt="Interijer centra Svijet Sluha Sarajevo sa slušnim aparatima Bernafon i Unitron"
                fill
                sizes="(min-width: 1024px) 720px, 100vw"
                className="object-cover"
              />
            </Otkrij>
            <div className="grid gap-5">
              {[
                {
                  src: '/media/slusni-aparati-izlozba-sarajevo.webp',
                  alt: 'Izloženi slušni aparati u centru Svijet Sluha Sarajevo',
                },
                {
                  src: '/media/experience-room-svijet-sluha-sarajevo.webp',
                  alt: 'Experience Room za demonstraciju slušanja u Sarajevu',
                },
              ].map((slika) => (
                <Otkrij key={slika.src} className="relative min-h-[150px] overflow-hidden rounded-[24px] shadow-sm">
                  <Image src={slika.src} alt={slika.alt} fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" />
                </Otkrij>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="kontejner">
        <section className="sekcija" aria-labelledby="faq-naslov">
          <SekcijaZaglavlje
            id="faq-naslov"
            nadnaslov="Pitanja i odgovori"
            naslov="Najčešća pitanja za slušne aparate u Sarajevu"
            centrirano={false}
          />
          <div className="mt-9 divide-y divide-neutral-200 border-y border-neutral-200">
            {FAQ.map((stavka) => (
              <details key={stavka.pitanje} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start gap-4 text-[18px] font-bold text-neutral-900">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                  <span>{stavka.pitanje}</span>
                </summary>
                <p className="mt-3 pl-9 text-neutral-600">{stavka.odgovor}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="pb-16 md:pb-24" aria-label="Zakazivanje u Sarajevu">
          <div className="grid gap-8 border border-neutral-200 bg-neutral-950 p-7 text-white md:grid-cols-[1fr_auto] md:items-center md:p-9">
            <div>
              <p className="text-[13px] font-extrabold tracking-[0.18em] text-brand-200 uppercase">Sarajevo</p>
              <h2 className="mt-2 text-[28px] leading-tight font-extrabold md:text-[36px]">
                Zakažite besplatnu provjeru sluha u UNITIC-u
              </h2>
              <p className="mt-3 max-w-2xl text-white/78">
                Jedan termin je dovoljan za provjeru sluha, savjetovanje i preporuku aparata koji ima smisla za Vas.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <DugmeLink href="/zakazivanje?poslovnica=sarajevo" velicina="veliko">
                Zakažite termin
              </DugmeLink>
              <DugmeLink href="/slusni-aparati" varijanta="tamno" velicina="veliko">
                Vrste aparata
              </DugmeLink>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
