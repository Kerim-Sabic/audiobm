import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  CalendarCheck,
  Ear,
  MessageSquareHeart,
  Settings2,
  Stethoscope,
  ShieldCheck,
  MessagesSquare,
  ArrowRight,
} from 'lucide-react'
import heroOsoba from '@/assets/hero-osoba.png'
import {
  dajAktivneAkcije,
  dajPayload,
  dajPitanja,
  dajPocetnu,
  dajPodesavanja,
  dajPoslovnice,
  dajRecenzije,
  dajUsluge,
} from '@/lib/podaci'
import { metaStranice, pitanjaJsonLd } from '@/lib/seo'
import { HeroUlaz } from '@/components/pocetna/HeroUlaz'
import { PovratniPoziv } from '@/components/pocetna/PovratniPoziv'
import { PromoBaner } from '@/components/ui/PromoBaner'
import { DugmeLink } from '@/components/ui/Dugme'
import { TelefonLink } from '@/components/ui/TelefonLink'
import { Harmonika } from '@/components/ui/Harmonika'
import { Otkrij, OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import { Brojac } from '@/components/motion/Brojac'
import { LokacijaKartica } from '@/components/poslovnice/LokacijaKartica'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import { TIPOVI_APARATA } from '@/lib/catalog'
import type { Mediji } from '@/payload-types'

export async function generateMetadata(): Promise<Metadata> {
  const podesavanja = await dajPodesavanja()
  return metaStranice({
    naslov: podesavanja.seoNaslov ?? 'Audio BM — Slušni aparati i besplatna provjera sluha',
    opis:
      podesavanja.seoOpis ??
      'Više od 30 godina povjerenja. Besplatna provjera sluha u Sarajevu, Banjoj Luci, Gradišci, Bijeljini, Doboju i Brčkom.',
    putanja: '',
  })
}

const IKONE_USLUGA: Record<string, typeof Ear> = {
  ear: Ear,
  settings: Settings2,
  stethoscope: Stethoscope,
  chat: MessagesSquare,
  shield: ShieldCheck,
}

export default async function Pocetna() {
  const [pocetna, podesavanja, poslovnice, usluge, pitanja, recenzije, akcije, payload] =
    await Promise.all([
      dajPocetnu(),
      dajPodesavanja(),
      dajPoslovnice(),
      dajUsluge(),
      dajPitanja(),
      dajRecenzije(),
      dajAktivneAkcije(),
      dajPayload(),
    ])

  // po jedan stvarni proizvod po tipu aparata (za sekciju tipova)
  const tipovi = await Promise.all(
    (Object.keys(TIPOVI_APARATA) as (keyof typeof TIPOVI_APARATA)[]).map(async (tip) => {
      const { docs } = await payload.find({
        collection: 'proizvodi',
        where: { and: [{ tipAparata: { equals: tip } }, { aktivan: { equals: true } }] },
        limit: 1,
        depth: 1,
        draft: false,
      })
      return { tip, info: TIPOVI_APARATA[tip], primjer: docs[0] ?? null }
    }),
  )

  const pitanjaPocetna = pitanja.filter((p) => p.naPocetnoj).slice(0, 4)
  const istaknutaAkcija = akcije.find((a) => a.istaknutaNaPocetnoj) ?? akcije[0]
  const sarajevo = poslovnice.find((p) => p.slug === 'sarajevo')

  const redoslijed = (pocetna.redoslijedSekcija ?? []).map((s) => s.sekcija)

  const sekcije: Record<string, React.ReactNode> = {
    /* ——— Kako izgleda besplatna provjera sluha ——— */
    koraci: (
      <section key="koraci" className="sekcija" aria-labelledby="koraci-naslov">
        <div className="kontejner">
          <Otkrij>
            <h2 id="koraci-naslov" className="text-h2 text-center">
              Kako izgleda besplatna provjera sluha?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
              Jednostavno, bezbolno i bez ikakve obaveze — za pola sata znate na čemu ste.
            </p>
          </Otkrij>
          <OtkrijGrupu className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                ikona: CalendarCheck,
                naslov: '1. Zakažete termin',
                opis: 'Telefonom ili putem obrasca — traje dvije minute. Pozvat ćemo Vas da potvrdimo termin koji Vama odgovara.',
              },
              {
                ikona: Ear,
                naslov: '2. Provjerimo Vaš sluh',
                opis: 'Pregled uha i bezbolno mjerenje sluha u tihoj prostoriji. Sve zajedno traje 30 do 45 minuta.',
              },
              {
                ikona: MessageSquareHeart,
                naslov: '3. Dobijete jasan savjet',
                opis: 'Rezultate Vam objasnimo razumljivim jezikom i predložimo šta dalje — odluka je uvijek Vaša.',
              },
            ].map((korak) => (
              <OtkrijStavku key={korak.naslov}>
                <div className="h-full rounded-[16px] border border-neutral-200 bg-white p-7 shadow-sm">
                  <div className="grid size-14 place-items-center rounded-[12px] bg-brand-50">
                    <korak.ikona className="size-7 text-brand-600" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="text-h3 mt-5">{korak.naslov}</h3>
                  <p className="mt-2 text-neutral-600">{korak.opis}</p>
                </div>
              </OtkrijStavku>
            ))}
          </OtkrijGrupu>
          <Otkrij className="mt-10 text-center">
            <DugmeLink href="/usluge/provjera-sluha" varijanta="sekundarno">
              Saznajte više o provjeri sluha
            </DugmeLink>
          </Otkrij>
        </div>
      </section>
    ),

    /* ——— Poslovnice ——— */
    poslovnice: (
      <section key="poslovnice" className="sekcija bg-neutral-50" aria-labelledby="poslovnice-naslov">
        <div className="kontejner">
          <Otkrij>
            <h2 id="poslovnice-naslov" className="text-h2 text-center">
              Posjetite nas — sada i u Sarajevu
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
              Šest poslovnica širom Bosne i Hercegovine. Dođite na kafu i besplatnu provjeru sluha.
            </p>
          </Otkrij>
          <OtkrijGrupu className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {poslovnice.map((p) => (
              <OtkrijStavku key={p.id}>
                <LokacijaKartica
                  lokacija={{
                    slug: p.slug,
                    grad: p.grad,
                    adresa: p.adresa,
                    telefon: p.telefoni?.[0]?.broj,
                    novaPoslovnica: p.novaPoslovnica,
                  }}
                />
              </OtkrijStavku>
            ))}
          </OtkrijGrupu>
        </div>
      </section>
    ),

    /* ——— Vrste slušnih aparata ——— */
    tipovi: (
      <section key="tipovi" className="sekcija" aria-labelledby="tipovi-naslov">
        <div className="kontejner">
          <Otkrij>
            <h2 id="tipovi-naslov" className="text-h2 text-center">
              Koji slušni aparat je pravi za Vas?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-neutral-600">
              Tri osnovne vrste — od gotovo nevidljivih do snažnih. Zajedno ćemo pronaći pravi.
            </p>
          </Otkrij>
          <OtkrijGrupu className="mt-12 grid gap-6 md:grid-cols-3">
            {tipovi.map(({ tip, info, primjer }) => {
              const slika = (primjer?.slike as (Mediji | number)[] | undefined)?.[0]
              return (
                <OtkrijStavku key={tip}>
                  <Link
                    href={`/slusni-aparati/${tip}`}
                    className="group block h-full overflow-hidden rounded-[16px] border border-neutral-200 bg-white shadow-sm transition-[box-shadow,transform] duration-250 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-neutral-50 p-6">
                      {slika && typeof slika === 'object' ? (
                        <SlikaMedija
                          medij={slika}
                          fill
                          sizes="(min-width: 768px) 360px, 90vw"
                          className="!relative h-full w-full object-contain transition-transform duration-250 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-neutral-400">
                          <Ear className="size-16" strokeWidth={1.25} aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-h3">{info.naziv}</h3>
                      <p className="mt-2 text-neutral-600">{info.kratko}</p>
                      <span className="mt-3 inline-flex items-center gap-1.5 font-semibold text-brand-700">
                        Saznajte više
                        <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </OtkrijStavku>
              )
            })}
          </OtkrijGrupu>
        </div>
      </section>
    ),

    /* ——— Usluge ——— */
    usluge: (
      <section key="usluge" className="sekcija bg-neutral-50" aria-labelledby="usluge-naslov">
        <div className="kontejner">
          <Otkrij>
            <h2 id="usluge-naslov" className="text-h2 text-center">
              Naše usluge
            </h2>
          </Otkrij>
          <OtkrijGrupu className="mt-12 grid gap-6 md:grid-cols-3">
            {usluge.map((u) => {
              const Ikona = IKONE_USLUGA[u.ikona ?? 'ear'] ?? Ear
              return (
                <OtkrijStavku key={u.id}>
                  <Link
                    href={`/usluge/${u.slug}`}
                    className="group block h-full rounded-[16px] border border-neutral-200 bg-white p-7 shadow-sm transition-[box-shadow,transform] duration-250 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="grid size-14 place-items-center rounded-[12px] bg-brand-50">
                      <Ikona className="size-7 text-brand-600" strokeWidth={1.75} aria-hidden />
                    </div>
                    <h3 className="text-h3 mt-5">{u.naziv}</h3>
                    <p className="mt-2 text-neutral-600">{u.kratkiOpis}</p>
                  </Link>
                </OtkrijStavku>
              )
            })}
          </OtkrijGrupu>
        </div>
      </section>
    ),

    /* ——— Povjerenje ——— */
    povjerenje: (
      <section key="povjerenje" className="sekcija" aria-labelledby="povjerenje-naslov">
        <div className="kontejner">
          <div className="rounded-[16px] bg-charcoal px-6 py-12 text-white md:px-12 md:py-16">
            <h2 id="povjerenje-naslov" className="text-h2 text-center">
              Povjerenje koje se gradi decenijama
            </h2>
            <div className="mt-10 grid gap-8 text-center sm:grid-cols-3">
              <div>
                <p className="text-display text-brand-400">
                  <Brojac do={pocetna.povjerenje?.godineRada ?? 32} sufiks="+" />
                </p>
                <p className="mt-1 text-neutral-300">godine iskustva</p>
              </div>
              <div>
                <p className="text-display text-brand-400">
                  <Brojac do={poslovnice.length} />
                </p>
                <p className="mt-1 text-neutral-300">poslovnica u BiH</p>
              </div>
              {pocetna.povjerenje?.statistike?.[0] ? (
                <div>
                  <p className="text-display text-brand-400">{pocetna.povjerenje.statistike[0].broj}</p>
                  <p className="mt-1 text-neutral-300">{pocetna.povjerenje.statistike[0].oznaka}</p>
                </div>
              ) : (
                <div>
                  <p className="text-display text-neutral-500">[REAL_NUMBERS_PLACEHOLDER]</p>
                  <p className="mt-1 text-neutral-400 text-small">
                    brojku unosi vlasnik (Početna → Blok povjerenja)
                  </p>
                </div>
              )}
            </div>
            <div className="mt-12 border-t border-white/10 pt-8 text-center">
              <p className="text-small tracking-wide text-neutral-400 uppercase">
                Brendovi koje nudimo [CONFIRM_PARTNERSHIP_PLACEHOLDER]
              </p>
              <p className="mt-3 flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-[22px] font-bold text-neutral-200">
                <span>Bernafon</span>
                <span>Unitron</span>
                <span>Cochlear</span>
                <span>Varta</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    ),

    /* ——— Recenzije ——— */
    recenzije:
      recenzije.length > 0 ? (
        <section key="recenzije" className="sekcija" aria-labelledby="recenzije-naslov">
          <div className="kontejner">
            <Otkrij>
              <h2 id="recenzije-naslov" className="text-h2 text-center">
                Iskustva naših korisnika
              </h2>
            </Otkrij>
            <OtkrijGrupu className="mt-12 grid gap-5 md:grid-cols-3">
              {recenzije.slice(0, 6).map((r) => (
                <OtkrijStavku key={r.id}>
                  <blockquote className="h-full rounded-[16px] border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-neutral-700">„{r.tekst}"</p>
                    <footer className="mt-4 font-semibold text-neutral-900">{r.ime}</footer>
                  </blockquote>
                </OtkrijStavku>
              ))}
            </OtkrijGrupu>
          </div>
        </section>
      ) : null,

    /* ——— Aktivna akcija ——— */
    akcija: istaknutaAkcija ? (
      <section key="akcija" className="sekcija bg-neutral-50" aria-labelledby="akcija-naslov">
        <div className="kontejner">
          <Otkrij>
            <div className="overflow-hidden rounded-[16px] border border-brand-200 bg-white shadow-sm md:flex">
              <div className="flex-1 p-8 md:p-10">
                <p className="text-small font-bold tracking-wide text-brand-600 uppercase">
                  Aktuelna akcija
                </p>
                <h2 id="akcija-naslov" className="text-h2 mt-2">
                  {istaknutaAkcija.naslov}
                </h2>
                <p className="mt-3 text-neutral-600">{istaknutaAkcija.kratkiOpis}</p>
                <DugmeLink href={`/akcije/${istaknutaAkcija.slug}`} className="mt-6">
                  Pogledajte akciju
                </DugmeLink>
              </div>
              {istaknutaAkcija.slika && typeof istaknutaAkcija.slika === 'object' && (
                <div className="relative min-h-[220px] md:w-2/5">
                  <SlikaMedija medij={istaknutaAkcija.slika} fill sizes="(min-width: 768px) 480px, 100vw" />
                </div>
              )}
            </div>
          </Otkrij>
        </div>
      </section>
    ) : null,

    /* ——— Česta pitanja (4) ——— */
    pitanja:
      pitanjaPocetna.length > 0 ? (
        <section key="pitanja" className="sekcija" aria-labelledby="pitanja-naslov">
          <div className="kontejner max-w-3xl">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(
                  pitanjaJsonLd(pitanjaPocetna.map((p) => ({ pitanje: p.pitanje, odgovor: p.odgovor }))),
                ),
              }}
            />
            <Otkrij>
              <h2 id="pitanja-naslov" className="text-h2 text-center">
                Često nas pitate
              </h2>
            </Otkrij>
            <Otkrij className="mt-10">
              <Harmonika stavke={pitanjaPocetna.map((p) => ({ pitanje: p.pitanje, odgovor: p.odgovor }))} />
            </Otkrij>
            <Otkrij className="mt-8 text-center">
              <DugmeLink href="/cesta-pitanja" varijanta="sekundarno">
                Sva pitanja i odgovori
              </DugmeLink>
            </Otkrij>
          </div>
        </section>
      ) : null,

    /* ——— Kontakt traka ——— */
    kontakt: (
      <section key="kontakt" className="sekcija bg-brand-50/60" aria-labelledby="kontakt-naslov">
        <div className="kontejner grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 id="kontakt-naslov" className="text-h2">
              Niste sigurni odakle početi?
            </h2>
            <p className="mt-3 max-w-md text-neutral-700">
              Ostavite broj — nazvat ćemo Vas, odgovoriti na pitanja i pomoći da zakažete termin koji
              Vam odgovara. Bez obaveze.
            </p>
            {podesavanja.telefonGlavni && (
              <p className="mt-6 text-neutral-700">
                Ili nas pozovite odmah:{' '}
                <TelefonLink
                  broj={podesavanja.telefonGlavni}
                  lokacija="kontakt-traka"
                  className="text-[24px] text-neutral-900 hover:text-brand-700"
                />
              </p>
            )}
          </div>
          <div className="rounded-[16px] border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
            <PovratniPoziv izvor="/" />
          </div>
        </div>
      </section>
    ),
  }

  return (
    <>
      {/* Sarajevo baner — iznad pregiba */}
      {pocetna.sarajevoBaner?.aktivan && sarajevo && (
        <PromoBaner
          tekst={pocetna.sarajevoBaner.tekst ?? 'Otvorili smo poslovnicu u Sarajevu'}
          link={pocetna.sarajevoBaner.link ?? '/poslovnice/sarajevo'}
        />
      )}

      {/* ——— Hero ——— */}
      <HeroUlaz>
        <section className="relative overflow-hidden border-b border-neutral-100 bg-gradient-to-b from-neutral-50 to-white">
          <div className="kontejner grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-2xl">
              <h1 data-hero-stavka="1" className="text-display text-neutral-900">
                {pocetna.hero?.naslov ?? 'Besplatna provjera sluha — više od 30 godina povjerenja'}
              </h1>
              <p data-hero-stavka="2" className="mt-5 max-w-xl text-[19px] text-neutral-600 md:text-[20px]">
                {pocetna.hero?.podnaslov}
              </p>
              <div data-hero-stavka="3" className="mt-8 flex flex-wrap items-center gap-4">
                <DugmeLink href="/zakazivanje" velicina="veliko">
                  {pocetna.hero?.ctaTekst ?? 'Zakažite besplatnu provjeru sluha'}
                </DugmeLink>
                {podesavanja.telefonGlavni && (
                  <TelefonLink
                    broj={podesavanja.telefonGlavni}
                    lokacija="hero"
                    className="text-[24px] text-neutral-900 hover:text-brand-700"
                  />
                )}
              </div>
              <ul data-hero-stavka="4" className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-[15px] font-medium text-neutral-500">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-success-600" aria-hidden /> Besplatno i bez obaveze
                </li>
                <li className="flex items-center gap-2">
                  <Ear className="size-4 text-success-600" aria-hidden /> Više od 30 godina iskustva
                </li>
                <li className="flex items-center gap-2">
                  <CalendarCheck className="size-4 text-success-600" aria-hidden /> Termin za 2 minute
                </li>
              </ul>
            </div>
            <div data-hero-stavka="5" className="relative mx-auto hidden max-w-sm lg:block">
              <div className="absolute inset-x-4 bottom-0 top-10 rounded-[24px] bg-brand-50" aria-hidden />
              <Image
                src={heroOsoba}
                alt="Nasmijana starija žena sa slušalicama pokazuje prema pozivu za besplatnu provjeru sluha"
                priority
                placeholder="blur"
                sizes="(min-width: 1024px) 380px, 0px"
                className="relative h-auto w-full"
              />
            </div>
          </div>
        </section>
      </HeroUlaz>

      {/* sekcije po redoslijedu iz CMS-a */}
      {redoslijed.length > 0
        ? redoslijed.map((s) => sekcije[s] ?? null)
        : Object.values(sekcije)}
    </>
  )
}
