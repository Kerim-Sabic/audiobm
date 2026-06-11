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
  Quote,
  Star,
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
import { SekcijaZaglavlje } from '@/components/ui/SekcijaZaglavlje'
import { Otkrij, OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import { Brojac } from '@/components/motion/Brojac'
import { Tilt3D } from '@/components/motion/Tilt3D'
import { ZvucniTalasiOmot } from '@/components/motion/ZvucniTalasiOmot'
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

/** Naslov iz CMS-a: prva riječ dobija crvenu podvlaku kistom. */
function NaslovSaAkcentom({ tekst }: { tekst: string }) {
  const [prva, ...ostatak] = tekst.split(' ')
  return (
    <>
      <span className="podvlaka">{prva}</span> {ostatak.join(' ')}
    </>
  )
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
    /* ——— Kako izgleda besplatna provjera sluha — povezani koraci ——— */
    koraci: (
      <section key="koraci" className="sekcija" aria-labelledby="koraci-naslov">
        <div className="kontejner">
          <SekcijaZaglavlje
            id="koraci-naslov"
            nadnaslov="Jednostavno do boljeg sluha"
            naslov="Kako izgleda besplatna provjera sluha?"
            uvod="Bezbolno, besplatno i bez ikakve obaveze — za pola sata znate na čemu ste."
          />
          <div className="relative mt-14">
            {/* spojna linija između koraka (desktop) */}
            <div
              className="absolute top-7 right-[16%] left-[16%] hidden h-0.5 bg-[linear-gradient(90deg,transparent,var(--color-brand-200)_15%,var(--color-brand-200)_85%,transparent)] md:block"
              aria-hidden
            />
            <OtkrijGrupu className="grid gap-10 md:grid-cols-3 md:gap-6">
              {[
                {
                  ikona: CalendarCheck,
                  naslov: 'Zakažete termin',
                  opis: 'Telefonom ili putem obrasca — traje dvije minute. Pozvat ćemo Vas da potvrdimo termin koji Vama odgovara.',
                },
                {
                  ikona: Ear,
                  naslov: 'Provjerimo Vaš sluh',
                  opis: 'Pregled uha i bezbolno mjerenje sluha u tihoj prostoriji. Sve zajedno traje 30 do 45 minuta.',
                },
                {
                  ikona: MessageSquareHeart,
                  naslov: 'Dobijete jasan savjet',
                  opis: 'Rezultate Vam objasnimo razumljivim jezikom i predložimo šta dalje — odluka je uvijek Vaša.',
                },
              ].map((korak, i) => (
                <OtkrijStavku key={korak.naslov} className="relative">
                  <div className="flex h-full flex-col items-center text-center">
                    <div className="relative z-10 grid size-14 place-items-center rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[0_10px_24px_-8px_rgb(237_28_36/0.5)]">
                      <korak.ikona className="size-7" strokeWidth={1.75} aria-hidden />
                    </div>
                    <span className="nadnaslov mt-5">Korak {i + 1}</span>
                    <h3 className="text-h3 mt-2">{korak.naslov}</h3>
                    <p className="mt-2 max-w-xs text-neutral-600">{korak.opis}</p>
                  </div>
                </OtkrijStavku>
              ))}
            </OtkrijGrupu>
          </div>
          <Otkrij className="mt-12 text-center">
            <DugmeLink href="/zakazivanje" velicina="veliko">
              Zakažite svoj termin <ArrowRight className="size-5" aria-hidden />
            </DugmeLink>
          </Otkrij>
        </div>
      </section>
    ),

    /* ——— Poslovnice ——— */
    poslovnice: (
      <section
        key="poslovnice"
        className="sekcija mreza-tacaka-svijetla border-y border-neutral-100 bg-neutral-50"
        aria-labelledby="poslovnice-naslov"
      >
        <div className="kontejner">
          <SekcijaZaglavlje
            id="poslovnice-naslov"
            nadnaslov="6 gradova širom BiH"
            naslov="Posjetite nas — sada i u Sarajevu"
            uvod="Dođite na kafu i besplatnu provjeru sluha u Vama najbližu poslovnicu."
          />
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
          <SekcijaZaglavlje
            id="tipovi-naslov"
            nadnaslov="Za svako uho ponešto"
            naslov="Koji slušni aparat je pravi za Vas?"
            uvod="Tri osnovne vrste — od gotovo nevidljivih do snažnih. Zajedno ćemo pronaći pravi."
          />
          <OtkrijGrupu className="mt-12 grid gap-6 md:grid-cols-3">
            {tipovi.map(({ tip, info, primjer }, i) => {
              const slika = (primjer?.slike as (Mediji | number)[] | undefined)?.[0]
              return (
                <OtkrijStavku key={tip} className="h-full">
                  <Tilt3D className="h-full">
                    <Link
                      href={`/slusni-aparati/${tip}`}
                      className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-neutral-200 bg-white shadow-[var(--shadow-lift)] transition-[box-shadow,border-color] duration-250 hover:border-brand-200 hover:shadow-[var(--shadow-lift-lg)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-neutral-50 to-brand-50/50">
                        <span className="absolute top-4 left-4 z-10 text-[44px] leading-none font-extrabold text-brand-200/70" aria-hidden>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {slika && typeof slika === 'object' ? (
                          <div className="grid h-full w-full place-items-center p-8">
                            <SlikaMedija
                              medij={slika}
                              sizes="(min-width: 768px) 340px, 85vw"
                              className="max-h-full w-auto object-contain drop-shadow-lg transition-transform duration-250 group-hover:scale-[1.06]"
                            />
                          </div>
                        ) : (
                          <div className="grid h-full place-items-center text-neutral-300">
                            <Ear className="size-16" strokeWidth={1.25} aria-hidden />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="text-h3">{info.naziv}</h3>
                        <p className="mt-2 flex-1 text-neutral-600">{info.kratko}</p>
                        <span className="mt-4 inline-flex items-center gap-2 font-semibold text-brand-700">
                          <span className="grid size-8 place-items-center rounded-full bg-brand-50 transition-colors duration-150 group-hover:bg-brand-600 group-hover:text-white">
                            <ArrowRight className="size-4" aria-hidden />
                          </span>
                          Saznajte više
                        </span>
                      </div>
                    </Link>
                  </Tilt3D>
                </OtkrijStavku>
              )
            })}
          </OtkrijGrupu>
        </div>
      </section>
    ),

    /* ——— Usluge ——— */
    usluge: (
      <section
        key="usluge"
        className="sekcija border-y border-neutral-100 bg-neutral-50"
        aria-labelledby="usluge-naslov"
      >
        <div className="kontejner">
          <SekcijaZaglavlje
            id="usluge-naslov"
            nadnaslov="Uz Vas u svakom koraku"
            naslov="Naše usluge"
          />
          <OtkrijGrupu className="mt-12 grid gap-6 md:grid-cols-3">
            {usluge.map((u) => {
              const Ikona = IKONE_USLUGA[u.ikona ?? 'ear'] ?? Ear
              return (
                <OtkrijStavku key={u.id} className="h-full">
                  <Link
                    href={`/usluge/${u.slug}`}
                    className="group flex h-full flex-col rounded-[16px] border border-neutral-200 bg-white p-7 shadow-[var(--shadow-lift)] transition-[box-shadow,transform,border-color] duration-250 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift-lg)]"
                  >
                    <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 transition-colors duration-250 group-hover:bg-brand-600">
                      <Ikona className="size-7 text-brand-600 transition-colors duration-250 group-hover:text-white" strokeWidth={1.75} aria-hidden />
                    </div>
                    <h3 className="text-h3 mt-5">{u.naziv}</h3>
                    <p className="mt-2 flex-1 text-neutral-600">{u.kratkiOpis}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 font-semibold text-brand-700">
                      Detalji usluge
                      <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden />
                    </span>
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
          <Otkrij>
            <div className="mreza-tacaka relative overflow-hidden rounded-[24px] bg-charcoal px-6 py-14 text-white md:px-14 md:py-20">
              {/* crveni odsjaj */}
              <div
                className="absolute -top-32 -right-24 size-96 rounded-full bg-brand-600/25 blur-[120px]"
                aria-hidden
              />
              <div className="absolute -bottom-40 -left-24 size-80 rounded-full bg-brand-600/15 blur-[100px]" aria-hidden />
              <div className="relative">
                <p className="nadnaslov nadnaslov-centar justify-center !text-brand-400">Audio BM u brojkama</p>
                <h2 id="povjerenje-naslov" className="text-h2 mt-3 text-center">
                  Povjerenje koje se gradi decenijama
                </h2>
                <div className="mt-12 grid gap-10 text-center sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/10">
                  <div className="px-6">
                    <p className="text-display bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                      <Brojac do={pocetna.povjerenje?.godineRada ?? 32} sufiks="+" />
                    </p>
                    <p className="mt-2 text-[17px] text-neutral-300">godine iskustva</p>
                  </div>
                  <div className="px-6">
                    <p className="text-display bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                      <Brojac do={poslovnice.length} />
                    </p>
                    <p className="mt-2 text-[17px] text-neutral-300">poslovnica u BiH</p>
                  </div>
                  {pocetna.povjerenje?.statistike?.[0] ? (
                    <div className="px-6">
                      <p className="text-display bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                        {pocetna.povjerenje.statistike[0].broj}
                      </p>
                      <p className="mt-2 text-[17px] text-neutral-300">{pocetna.povjerenje.statistike[0].oznaka}</p>
                    </div>
                  ) : (
                    <div className="px-6">
                      <p className="text-display text-neutral-600">—</p>
                      <p className="text-small mt-2 text-neutral-500">[REAL_NUMBERS_PLACEHOLDER] — unosi vlasnik</p>
                    </div>
                  )}
                </div>
                <div className="mt-14 border-t border-white/10 pt-10 text-center">
                  <p className="text-small tracking-[0.14em] text-neutral-400 uppercase">
                    Brendovi koje nudimo <span className="text-neutral-500">[CONFIRM_PARTNERSHIP_PLACEHOLDER]</span>
                  </p>
                  <p className="mt-5 flex flex-wrap items-center justify-center gap-x-12 gap-y-3 text-[24px] font-bold tracking-tight text-white/85">
                    <span>Bernafon</span>
                    <span className="text-white/30">·</span>
                    <span>Unitron</span>
                    <span className="text-white/30">·</span>
                    <span>Cochlear</span>
                    <span className="text-white/30">·</span>
                    <span>Varta</span>
                  </p>
                </div>
              </div>
            </div>
          </Otkrij>
        </div>
      </section>
    ),

    /* ——— Recenzije ——— */
    recenzije:
      recenzije.length > 0 ? (
        <section key="recenzije" className="sekcija" aria-labelledby="recenzije-naslov">
          <div className="kontejner">
            <SekcijaZaglavlje
              id="recenzije-naslov"
              nadnaslov="Riječ naših korisnika"
              naslov="Iskustva koja nas pokreću"
            />
            <OtkrijGrupu className="mt-12 grid gap-5 md:grid-cols-3">
              {recenzije.slice(0, 6).map((r) => (
                <OtkrijStavku key={r.id} className="h-full">
                  <blockquote className="relative h-full rounded-[16px] border border-neutral-200 bg-white p-7 shadow-[var(--shadow-lift)]">
                    <Quote className="absolute top-6 right-6 size-8 text-brand-100" aria-hidden />
                    <div className="flex gap-0.5 text-warning-600" aria-label={`Ocjena ${r.ocjena} od 5`}>
                      {Array.from({ length: r.ocjena ?? 5 }).map((_, i) => (
                        <Star key={i} className="size-4 fill-current" aria-hidden />
                      ))}
                    </div>
                    <p className="mt-4 text-neutral-700">„{r.tekst}"</p>
                    <footer className="mt-5 flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-full bg-brand-50 font-bold text-brand-700">
                        {r.ime.charAt(0)}
                      </span>
                      <span className="font-semibold text-neutral-900">{r.ime}</span>
                    </footer>
                  </blockquote>
                </OtkrijStavku>
              ))}
            </OtkrijGrupu>
          </div>
        </section>
      ) : null,

    /* ——— Aktivna akcija ——— */
    akcija: istaknutaAkcija ? (
      <section key="akcija" className="sekcija pt-0" aria-labelledby="akcija-naslov">
        <div className="kontejner">
          <Otkrij>
            <div className="overflow-hidden rounded-[24px] border border-brand-200 bg-gradient-to-br from-brand-50 to-white shadow-[var(--shadow-lift)] md:flex">
              <div className="flex-1 p-8 md:p-12">
                <p className="nadnaslov">Aktuelna akcija</p>
                <h2 id="akcija-naslov" className="text-h2 mt-3">
                  {istaknutaAkcija.naslov}
                </h2>
                <p className="uvodni mt-3">{istaknutaAkcija.kratkiOpis}</p>
                <DugmeLink href={`/akcije/${istaknutaAkcija.slug}`} className="mt-7">
                  Pogledajte akciju <ArrowRight className="size-5" aria-hidden />
                </DugmeLink>
              </div>
              {istaknutaAkcija.slika && typeof istaknutaAkcija.slika === 'object' && (
                <div className="relative min-h-[240px] md:w-2/5">
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
        <section key="pitanja" className="sekcija border-t border-neutral-100" aria-labelledby="pitanja-naslov">
          <div className="kontejner max-w-3xl">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(
                  pitanjaJsonLd(pitanjaPocetna.map((p) => ({ pitanje: p.pitanje, odgovor: p.odgovor }))),
                ),
              }}
            />
            <SekcijaZaglavlje id="pitanja-naslov" nadnaslov="Imate pitanja?" naslov="Često nas pitate" />
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
      <section key="kontakt" className="sekcija bg-gradient-to-b from-white to-brand-50/60" aria-labelledby="kontakt-naslov">
        <div className="kontejner grid items-center gap-10 lg:grid-cols-2">
          <Otkrij>
            <p className="nadnaslov">Tu smo za Vas</p>
            <h2 id="kontakt-naslov" className="text-h2 mt-3">
              Niste sigurni odakle početi?
            </h2>
            <p className="uvodni mt-4 max-w-md">
              Ostavite broj — nazvat ćemo Vas, odgovoriti na pitanja i pomoći da zakažete termin koji
              Vam odgovara. Bez obaveze.
            </p>
            {podesavanja.telefonGlavni && (
              <p className="mt-7 text-neutral-700">
                Ili nas pozovite odmah:{' '}
                <TelefonLink
                  broj={podesavanja.telefonGlavni}
                  lokacija="kontakt-traka"
                  className="text-[26px] text-neutral-900 hover:text-brand-700"
                />
              </p>
            )}
          </Otkrij>
          <Otkrij delay={0.1}>
            <div className="rounded-[20px] border border-neutral-200 bg-white p-6 shadow-[var(--shadow-lift-lg)] md:p-8">
              <PovratniPoziv izvor="/" />
            </div>
          </Otkrij>
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
        <section className="relative overflow-hidden border-b border-neutral-100 bg-gradient-to-b from-neutral-50/80 via-white to-white">
          {/* 3D zvučni talasi (desktop, lijeno učitavanje) */}
          <ZvucniTalasiOmot />
          {/* mekani brend odsjaj gore desno */}
          <div
            className="pointer-events-none absolute -top-40 right-[-10%] size-[560px] rounded-full bg-brand-100/50 blur-[140px]"
            aria-hidden
          />
          <div className="kontejner relative grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
            <div className="relative z-10 max-w-2xl">
              <p data-hero-stavka="1" className="nadnaslov">
                Slušni aparati i briga o sluhu
              </p>
              <h1 data-hero-stavka="2" className="text-display mt-4 text-neutral-900">
                <NaslovSaAkcentom
                  tekst={pocetna.hero?.naslov ?? 'Besplatna provjera sluha — više od 30 godina povjerenja'}
                />
              </h1>
              <p data-hero-stavka="3" className="uvodni mt-6 max-w-xl md:text-[20px]">
                {pocetna.hero?.podnaslov}
              </p>
              <div data-hero-stavka="4" className="mt-9 flex flex-wrap items-center gap-5">
                <DugmeLink href="/zakazivanje" velicina="veliko">
                  {pocetna.hero?.ctaTekst ?? 'Zakažite besplatnu provjeru sluha'}
                  <ArrowRight className="size-5" aria-hidden />
                </DugmeLink>
                {podesavanja.telefonGlavni && (
                  <span className="flex flex-col">
                    <span className="text-small font-medium text-neutral-500">Pozovite nas direktno</span>
                    <TelefonLink
                      broj={podesavanja.telefonGlavni}
                      lokacija="hero"
                      className="text-[26px] text-neutral-900 hover:text-brand-700"
                    />
                  </span>
                )}
              </div>
              <ul data-hero-stavka="5" className="mt-10 flex flex-wrap gap-3">
                {[
                  { ikona: ShieldCheck, tekst: 'Besplatno i bez obaveze' },
                  { ikona: Ear, tekst: '30+ godina iskustva' },
                  { ikona: CalendarCheck, tekst: 'Termin za 2 minute' },
                ].map((z) => (
                  <li
                    key={z.tekst}
                    className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-[15px] font-semibold text-neutral-700 shadow-sm backdrop-blur-sm"
                  >
                    <z.ikona className="size-4.5 text-brand-600" aria-hidden />
                    {z.tekst}
                  </li>
                ))}
              </ul>
            </div>

            {/* fotografija u luku sa lebdećim karticama */}
            <div data-hero-stavka="5" className="relative mx-auto w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[400px]">
              {/* zvučni prsteni iza fotografije */}
              <svg
                viewBox="0 0 120 120"
                className="absolute top-1/2 -left-16 w-36 -translate-y-1/2 text-brand-300"
                aria-hidden
              >
                {[20, 34, 48].map((r, i) => (
                  <circle
                    key={r}
                    cx="60"
                    cy="60"
                    r={r}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${r * 1.9} ${r * 8}`}
                    strokeDashoffset={r * 5.2}
                    className="prsten-puls"
                    style={{ animationDelay: `${i * 0.5}s` }}
                  />
                ))}
              </svg>

              <div className="relative overflow-hidden rounded-t-[190px] rounded-b-[28px] bg-gradient-to-b from-brand-100 via-brand-50 to-white shadow-[var(--shadow-lift-lg)] ring-8 ring-white">
                <Image
                  src={heroOsoba}
                  alt="Nasmijana starija žena sa slušalicama pokazuje prema pozivu za besplatnu provjeru sluha"
                  priority
                  placeholder="blur"
                  sizes="(min-width: 1024px) 400px, (min-width: 640px) 360px, 300px"
                  className="relative mt-10 h-auto w-full"
                />
              </div>

              {/* lebdeće kartice povjerenja */}
              <div className="lebdi absolute -top-2 -left-8 flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-4 py-3 shadow-[var(--shadow-lift-lg)]">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-50">
                  <Ear className="size-5 text-brand-600" aria-hidden />
                </span>
                <span className="leading-tight">
                  <span className="block text-[20px] font-extrabold text-neutral-900">
                    <Brojac do={pocetna.povjerenje?.godineRada ?? 32} sufiks="+" />
                  </span>
                  <span className="text-small text-neutral-500">godine uz Vas</span>
                </span>
              </div>
              <div className="lebdi-sporije absolute -right-6 bottom-10 flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-4 py-3 shadow-[var(--shadow-lift-lg)]">
                <span className="grid size-10 place-items-center rounded-xl bg-success-50">
                  <ShieldCheck className="size-5 text-success-600" aria-hidden />
                </span>
                <span className="leading-tight">
                  <span className="block text-[16px] font-bold text-neutral-900">Provjera sluha</span>
                  <span className="text-small text-success-700">100% besplatna</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </HeroUlaz>

      {/* sekcije po redoslijedu iz CMS-a */}
      {redoslijed.length > 0 ? redoslijed.map((s) => sekcije[s] ?? null) : Object.values(sekcije)}
    </>
  )
}
