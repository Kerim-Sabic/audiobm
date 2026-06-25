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
  MapPin,
  Check,
  Headphones,
  Clock,
} from 'lucide-react'
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
import { stvarno, ocisti } from '@/lib/tekst'
import { metaStranice, pitanjaJsonLd } from '@/lib/seo'
import { HeroUlaz } from '@/components/pocetna/HeroUlaz'
import { PovratniPoziv } from '@/components/pocetna/PovratniPoziv'
import { Audiogram } from '@/components/pocetna/Audiogram'
import { PromoBaner } from '@/components/ui/PromoBaner'
import { DugmeLink } from '@/components/ui/Dugme'
import { TelefonLink } from '@/components/ui/TelefonLink'
import { Harmonika } from '@/components/ui/Harmonika'
import { SekcijaZaglavlje } from '@/components/ui/SekcijaZaglavlje'
import { Otkrij, OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import { Brojac } from '@/components/motion/Brojac'
import { ZvucniTalasiOmot } from '@/components/motion/ZvucniTalasiOmot'
import { MapaBiH } from '@/components/poslovnice/MapaBiH'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import { TIPOVI_APARATA } from '@/lib/catalog'
import type { Mediji } from '@/payload-types'

export async function generateMetadata(): Promise<Metadata> {
  const podesavanja = await dajPodesavanja()
  return metaStranice({
    naslov: podesavanja.seoNaslov ?? 'Svijet Sluha — slušni aparati i besplatna provjera sluha',
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

/** Naslov iz CMS-a: prva riječ u brend crvenoj — miran, samouvjeren akcenat. */
function NaslovSaAkcentom({ tekst }: { tekst: string }) {
  const [prva, ...ostatak] = tekst.split(' ')
  return (
    <>
      <span className="text-brand-600">{prva}</span> {ostatak.join(' ')}
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

  // po jedan stvarni proizvod po tipu aparata (za uporedni prikaz tipova)
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
  const redoslijed = (pocetna.redoslijedSekcija ?? []).map((s) => s.sekcija)
  const telefon = stvarno(podesavanja.telefonGlavni)
  const godine = pocetna.povjerenje?.godineRada ?? 32
  // samo stvarne statistike — placeholderi se ne prikazuju
  const statistike = (pocetna.povjerenje?.statistike ?? []).filter(
    (s) => stvarno(s.broj) && stvarno(s.oznaka),
  )

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
          <div className="relative mt-16">
            {/* isprekidana spojnica između koraka (desktop) */}
            <div
              className="absolute top-[26px] right-[17%] left-[17%] hidden border-t-2 border-dashed border-brand-200/80 md:block"
              aria-hidden
            />
            <OtkrijGrupu className="grid gap-12 md:grid-cols-3 md:gap-8">
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
                    <div className="relative z-10 grid size-[52px] place-items-center rounded-2xl border border-brand-100 bg-white text-brand-600 shadow-[var(--shadow-lift)] ring-8 ring-white">
                      <korak.ikona className="size-6" strokeWidth={1.75} aria-hidden />
                    </div>
                    <span className="nadnaslov mt-6">Korak {i + 1}</span>
                    <h3 className="text-h3 mt-2.5">{korak.naslov}</h3>
                    <p className="mt-2.5 max-w-xs text-neutral-600">{korak.opis}</p>
                  </div>
                </OtkrijStavku>
              ))}
            </OtkrijGrupu>
          </div>
          <Otkrij className="mt-14 flex flex-col items-center gap-3 text-center">
            <DugmeLink href="/zakazivanje" velicina="veliko">
              Zakažite svoj termin <ArrowRight className="size-5" aria-hidden />
            </DugmeLink>
            <p className="text-small text-neutral-500">Traje 30–45 minuta · besplatno i bez obaveze</p>
          </Otkrij>
        </div>
      </section>
    ),

    /* ——— Poslovnice — mapa + uredan popis umjesto mreže kartica ——— */
    poslovnice: (
      <section
        key="poslovnice"
        className="sekcija relative overflow-hidden border-y border-neutral-200/60 bg-neutral-50"
        aria-labelledby="poslovnice-naslov"
      >
        <div className="mreza-audiogram absolute inset-0" aria-hidden />
        <div className="kontejner relative grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <Otkrij>
              <p className="nadnaslov">{poslovnice.length} gradova širom BiH</p>
              <h2 id="poslovnice-naslov" className="text-h2 mt-3.5">
                Posjetite nas — sada i u Sarajevu
              </h2>
              <p className="uvodni mt-4 max-w-lg">
                Dođite na kafu i besplatnu provjeru sluha u Vama najbližu poslovnicu.
              </p>
            </Otkrij>
            <OtkrijGrupu className="mt-9 divide-y divide-neutral-200/80 border-y border-neutral-200/80">
              {poslovnice.map((p) => {
                const adresa = stvarno(p.adresa)
                const brojTel = stvarno(p.telefoni?.[0]?.broj)
                return (
                  <OtkrijStavku key={p.id}>
                    <div className="group relative flex items-center gap-4 py-3.5 transition-colors duration-150 hover:bg-white/70">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-neutral-200 bg-white text-brand-600 shadow-sm transition-colors duration-250 group-hover:bg-brand-600 group-hover:text-white">
                        <MapPin className="size-4.5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 font-bold text-neutral-900">
                          <Link href={`/poslovnice/${p.slug}`} className="after:absolute after:inset-0">
                            {p.grad}
                          </Link>
                          {p.novaPoslovnica && (
                            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10.5px] font-bold tracking-wide text-white uppercase">
                              Novo
                            </span>
                          )}
                        </span>
                        {adresa && <span className="text-small block truncate text-neutral-500">{adresa}</span>}
                      </span>
                      {brojTel && (
                        <span className="telefon hidden text-[15px] text-neutral-600 sm:block">{brojTel}</span>
                      )}
                      <ArrowRight
                        className="size-4.5 shrink-0 text-neutral-300 transition-[color,transform] duration-150 group-hover:translate-x-1 group-hover:text-brand-600"
                        aria-hidden
                      />
                    </div>
                  </OtkrijStavku>
                )
              })}
            </OtkrijGrupu>
            <Otkrij className="mt-7">
              <DugmeLink href="/poslovnice" varijanta="sekundarno">
                Sve poslovnice i radna vremena
              </DugmeLink>
            </Otkrij>
          </div>
          <Otkrij delay={0.1} className="hidden lg:block">
            <div className="povrsina !rounded-[28px] p-8 md:p-10">
              <MapaBiH
                lokacije={poslovnice.map((p) => ({
                  slug: p.slug,
                  grad: p.grad,
                  geoSirina: p.geoSirina,
                  geoDuzina: p.geoDuzina,
                  novaPoslovnica: p.novaPoslovnica,
                }))}
              />
            </div>
          </Otkrij>
        </div>
      </section>
    ),

    /* ——— Vrste slušnih aparata — jedna uporedna površina ——— */
    tipovi: (
      <section key="tipovi" className="sekcija" aria-labelledby="tipovi-naslov">
        <div className="kontejner">
          <SekcijaZaglavlje
            id="tipovi-naslov"
            nadnaslov="Za svako uho ponešto"
            naslov="Koji slušni aparat je pravi za Vas?"
            uvod="Tri osnovne vrste — od gotovo nevidljivih do snažnih. Zajedno ćemo pronaći pravi."
          />
          <Otkrij className="mt-14">
            <div className="povrsina grid overflow-hidden !rounded-[28px] divide-y divide-neutral-200/70 md:grid-cols-3 md:divide-x md:divide-y-0">
              {tipovi.map(({ tip, info, primjer }, i) => {
                const slika = (primjer?.slike as (Mediji | number)[] | undefined)?.[0]
                return (
                  <div
                    key={tip}
                    className="group relative flex flex-col p-7 transition-colors duration-250 hover:bg-neutral-50/70 lg:p-9"
                  >
                    <span className="text-[13px] font-extrabold tracking-[0.2em] text-neutral-300" aria-hidden>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="my-6 grid h-40 place-items-center lg:h-44">
                      {slika && typeof slika === 'object' ? (
                        <SlikaMedija
                          medij={slika}
                          altRezerva={`${info.naziv} — slušni aparat`}
                          sizes="(min-width: 768px) 320px, 80vw"
                          className="max-h-full w-auto object-contain drop-shadow-lg transition-transform duration-250 group-hover:scale-[1.07]"
                        />
                      ) : (
                        <Ear className="size-16 text-neutral-200" strokeWidth={1.25} aria-hidden />
                      )}
                    </div>
                    <h3 className="text-h3">
                      <Link href={`/slusni-aparati/${tip}`} className="after:absolute after:inset-0">
                        {info.naziv}
                      </Link>
                    </h3>
                    <p className="mt-2 flex-1 text-neutral-600">{info.kratko}</p>
                    <span className="mt-5 inline-flex items-center gap-2.5 font-semibold text-brand-700">
                      <span className="grid size-8 place-items-center rounded-full bg-brand-50 transition-colors duration-150 group-hover:bg-brand-600 group-hover:text-white">
                        <ArrowRight className="size-4" aria-hidden />
                      </span>
                      Saznajte više
                    </span>
                  </div>
                )
              })}
            </div>
          </Otkrij>
          <Otkrij className="mt-8 text-center">
            <p className="text-neutral-600">
              Niste sigurni koji je pravi za Vas?{' '}
              <Link
                href="/zakazivanje"
                className="font-semibold text-brand-700 underline decoration-brand-200 decoration-2 underline-offset-4 transition-colors duration-150 hover:text-brand-800 hover:decoration-brand-400"
              >
                Pomoći ćemo Vam — besplatno
              </Link>
            </p>
          </Otkrij>
        </div>
      </section>
    ),

    /* ——— Usluge — uvodni stub + uredska lista umjesto kartica ——— */
    usluge: (
      <section
        key="usluge"
        className="sekcija border-y border-neutral-200/60 bg-neutral-50"
        aria-labelledby="usluge-naslov"
      >
        <div className="kontejner grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Otkrij className="lg:sticky lg:top-36 lg:self-start">
            <p className="nadnaslov">Uz Vas u svakom koraku</p>
            <h2 id="usluge-naslov" className="text-h2 mt-3.5">
              Naše usluge
            </h2>
            <p className="uvodni mt-4">
              Od prve provjere sluha do svakodnevnog održavanja aparata — sve na jednom mjestu, uz
              strpljiv i stručan pristup.
            </p>
            <DugmeLink href="/usluge" varijanta="sekundarno" className="mt-8">
              Sve usluge <ArrowRight className="size-4.5" aria-hidden />
            </DugmeLink>
          </Otkrij>
          <OtkrijGrupu>
            {usluge.map((u, i) => {
              const Ikona = IKONE_USLUGA[u.ikona ?? 'ear'] ?? Ear
              return (
                <OtkrijStavku key={u.id}>
                  <div className="group relative flex items-start gap-5 border-b border-neutral-200/80 py-6 first:pt-0 lg:gap-6">
                    <span className="hidden pt-1 text-[13px] font-extrabold tracking-[0.18em] text-neutral-300 sm:block" aria-hidden>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-neutral-200 bg-white text-brand-600 shadow-sm transition-colors duration-250 group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
                      <Ikona className="size-5.5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[19px] font-bold text-neutral-900 transition-colors duration-150 group-hover:text-brand-700">
                        <Link href={`/usluge/${u.slug}`} className="after:absolute after:inset-0">
                          {u.naziv}
                        </Link>
                      </span>
                      <span className="mt-1 block text-neutral-600">{u.kratkiOpis}</span>
                    </span>
                    <ArrowRight
                      className="mt-2 size-5 shrink-0 text-neutral-300 transition-[color,transform] duration-150 group-hover:translate-x-1 group-hover:text-brand-600"
                      aria-hidden
                    />
                  </div>
                </OtkrijStavku>
              )
            })}
          </OtkrijGrupu>
        </div>
      </section>
    ),

    /* ——— Povjerenje — tamna pripovjedna traka sa stvarnim brojkama ——— */
    povjerenje: (
      <section key="povjerenje" className="sekcija" aria-labelledby="povjerenje-naslov">
        <div className="kontejner">
          <Otkrij>
            <div className="relative overflow-hidden rounded-[32px] bg-charcoal px-7 py-14 text-white md:px-14 md:py-20">
              {/* dekorativna zvučna krivulja preko cijele trake */}
              <svg
                viewBox="0 0 1200 400"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M0 290 C 200 270, 320 180, 480 190 S 760 290, 920 250 S 1120 130, 1200 120"
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.06"
                  strokeWidth="90"
                  strokeLinecap="round"
                />
                <path
                  d="M0 310 C 220 290, 340 200, 500 210 S 780 310, 940 270 S 1140 150, 1200 140"
                  fill="none"
                  stroke="#ED1C24"
                  strokeOpacity="0.25"
                  strokeWidth="2.5"
                />
              </svg>
              <div
                className="absolute -top-32 -right-24 size-96 rounded-full bg-brand-600/20 blur-[120px]"
                aria-hidden
              />
              <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
                <div>
                  <p className="nadnaslov !text-brand-400">Audio BM u brojkama</p>
                  <h2 id="povjerenje-naslov" className="text-h2 mt-3.5">
                    Povjerenje koje se gradi decenijama
                  </h2>
                  <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-neutral-300">
                    Sluh se ne vraća reklamom, nego strpljivim radom — pregledom, probom aparata i
                    podešavanjima dok zvuk ne sjedne. Tako radimo od prvog dana, u svih{' '}
                    {poslovnice.length} poslovnica.
                  </p>
                  <div className="mt-10 border-t border-white/10 pt-7">
                    <p className="text-[12.5px] font-bold tracking-[0.18em] text-neutral-400 uppercase">
                      Brendovi koje nudimo
                    </p>
                    <p className="mt-4 flex flex-wrap items-center gap-x-10 gap-y-2 text-[21px] font-bold tracking-tight text-white/80">
                      <span>Bernafon</span>
                      <span>Unitron</span>
                      <span>Cochlear</span>
                      <span>Varta</span>
                    </p>
                  </div>
                </div>
                <dl className="divide-y divide-white/10 border-y border-white/10 lg:border-y-0 lg:border-l lg:border-white/10 lg:pl-14">
                  <div className="flex items-baseline justify-between gap-6 py-6 lg:flex-col lg:items-start lg:gap-1">
                    <dd className="order-1 text-[52px] leading-none font-extrabold tracking-tight">
                      <Brojac do={godine} sufiks="+" />
                    </dd>
                    <dt className="order-2 text-[16px] text-neutral-400">godine iskustva</dt>
                  </div>
                  <div className="flex items-baseline justify-between gap-6 py-6 lg:flex-col lg:items-start lg:gap-1">
                    <dd className="order-1 text-[52px] leading-none font-extrabold tracking-tight">
                      <Brojac do={poslovnice.length} />
                    </dd>
                    <dt className="order-2 text-[16px] text-neutral-400">poslovnica u BiH</dt>
                  </div>
                  {statistike.map((s) => (
                    <div
                      key={s.id ?? s.oznaka}
                      className="flex items-baseline justify-between gap-6 py-6 lg:flex-col lg:items-start lg:gap-1"
                    >
                      <dd className="order-1 text-[52px] leading-none font-extrabold tracking-tight">{s.broj}</dd>
                      <dt className="order-2 text-[16px] text-neutral-400">{s.oznaka}</dt>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Otkrij>
        </div>
      </section>
    ),

    /* ——— Recenzije — istaknuti citat + prateći glasovi ——— */
    recenzije:
      recenzije.length > 0 ? (
        <section key="recenzije" className="sekcija pt-0" aria-labelledby="recenzije-naslov">
          <div className="kontejner">
            <SekcijaZaglavlje
              id="recenzije-naslov"
              nadnaslov="Riječ naših korisnika"
              naslov="Iskustva koja nas pokreću"
            />
            <div className="mt-14 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
              <Otkrij>
                <figure className="povrsina relative flex h-full flex-col justify-center !rounded-[28px] p-8 md:p-12">
                  <Quote className="absolute top-8 right-8 size-12 text-brand-100" aria-hidden />
                  <div className="flex gap-1 text-warning-600" aria-label={`Ocjena ${recenzije[0].ocjena ?? 5} od 5`}>
                    {Array.from({ length: recenzije[0].ocjena ?? 5 }).map((_, i) => (
                      <Star key={i} className="size-4.5 fill-current" aria-hidden />
                    ))}
                  </div>
                  <blockquote className="mt-6 max-w-xl text-[21px] leading-relaxed font-medium text-neutral-800 md:text-[23px]">
                    „{recenzije[0].tekst}"
                  </blockquote>
                  <figcaption className="mt-7 flex items-center gap-3.5">
                    <span className="grid size-11 place-items-center rounded-full bg-brand-50 text-[17px] font-bold text-brand-700">
                      {recenzije[0].ime.charAt(0)}
                    </span>
                    <span className="font-semibold text-neutral-900">{recenzije[0].ime}</span>
                  </figcaption>
                </figure>
              </Otkrij>
              <OtkrijGrupu className="grid gap-6">
                {recenzije.slice(1, 3).map((r) => (
                  <OtkrijStavku key={r.id}>
                    <blockquote className="povrsina h-full p-7">
                      <div className="flex gap-0.5 text-warning-600" aria-label={`Ocjena ${r.ocjena ?? 5} od 5`}>
                        {Array.from({ length: r.ocjena ?? 5 }).map((_, i) => (
                          <Star key={i} className="size-3.5 fill-current" aria-hidden />
                        ))}
                      </div>
                      <p className="mt-3.5 text-neutral-700">„{r.tekst}"</p>
                      <footer className="mt-4 flex items-center gap-2.5">
                        <span className="grid size-8 place-items-center rounded-full bg-neutral-100 text-[14px] font-bold text-neutral-600">
                          {r.ime.charAt(0)}
                        </span>
                        <span className="text-[15px] font-semibold text-neutral-800">{r.ime}</span>
                      </footer>
                    </blockquote>
                  </OtkrijStavku>
                ))}
              </OtkrijGrupu>
            </div>
          </div>
        </section>
      ) : null,

    /* ——— Aktivna akcija ——— */
    akcija: istaknutaAkcija ? (
      <section key="akcija" className="sekcija pt-0" aria-labelledby="akcija-naslov">
        <div className="kontejner">
          <Otkrij>
            <div className="povrsina overflow-hidden !rounded-[28px] !border-brand-200/70 bg-gradient-to-br from-white to-brand-50/50 md:flex">
              <div className="flex-1 p-8 md:p-12">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-3.5 py-1.5 text-[12px] font-bold tracking-[0.1em] text-white uppercase">
                  <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden />
                  Aktuelna akcija
                </span>
                <h2 id="akcija-naslov" className="text-h2 mt-5">
                  {istaknutaAkcija.naslov}
                </h2>
                <p className="uvodni mt-3">{istaknutaAkcija.kratkiOpis}</p>
                <DugmeLink href={`/akcije/${istaknutaAkcija.slug}`} className="mt-7">
                  Pogledajte akciju <ArrowRight className="size-5" aria-hidden />
                </DugmeLink>
              </div>
              {istaknutaAkcija.slika && typeof istaknutaAkcija.slika === 'object' && (
                <div className="relative min-h-[240px] md:w-2/5">
                  <SlikaMedija
                    medij={istaknutaAkcija.slika}
                    altRezerva={istaknutaAkcija.naslov}
                    fill
                    sizes="(min-width: 768px) 480px, 100vw"
                  />
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
        <section key="pitanja" className="sekcija pt-0" aria-labelledby="pitanja-naslov">
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
            <Otkrij className="mt-12">
              <Harmonika stavke={pitanjaPocetna.map((p) => ({ pitanje: p.pitanje, odgovor: p.odgovor }))} />
            </Otkrij>
            <Otkrij className="mt-9 text-center">
              <DugmeLink href="/cesta-pitanja" varijanta="sekundarno">
                Sva pitanja i odgovori
              </DugmeLink>
            </Otkrij>
          </div>
        </section>
      ) : null,

    /* ——— Kontakt traka ——— */
    kontakt: (
      <section
        key="kontakt"
        className="sekcija relative overflow-hidden border-t border-neutral-200/60 bg-neutral-50"
        aria-labelledby="kontakt-naslov"
      >
        <div className="mreza-audiogram absolute inset-0" aria-hidden />
        <div className="kontejner relative grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Otkrij>
            <p className="nadnaslov">Tu smo za Vas</p>
            <h2 id="kontakt-naslov" className="text-h2 mt-3.5">
              Niste sigurni odakle početi?
            </h2>
            <p className="uvodni mt-4 max-w-md">
              Ostavite broj — nazvat ćemo Vas, odgovoriti na pitanja i pomoći da zakažete termin koji
              Vam odgovara. Bez obaveze.
            </p>
            {telefon && (
              <p className="mt-8 text-neutral-700">
                Ili nas pozovite odmah:{' '}
                <TelefonLink
                  broj={telefon}
                  lokacija="kontakt-traka"
                  className="text-[26px] text-neutral-900 hover:text-brand-700"
                />
              </p>
            )}
          </Otkrij>
          <Otkrij delay={0.1}>
            <div className="povrsina !rounded-[28px] p-6 !shadow-[var(--shadow-lift-lg)] md:p-9">
              <PovratniPoziv izvor="/" />
            </div>
          </Otkrij>
        </div>
      </section>
    ),
  }

  const banerTekst = pocetna.sarajevoBaner?.aktivan
    ? ocisti(pocetna.sarajevoBaner.tekst) ?? 'Otvorili smo poslovnicu u Sarajevu'
    : null

  return (
    <>
      {/* Sarajevo baner — iznad pregiba, bez placeholder teksta */}
      {banerTekst && (
        <PromoBaner tekst={banerTekst} link={pocetna.sarajevoBaner?.link ?? '/poslovnice/sarajevo'} />
      )}

      {/* ——— Hero ——— */}
      <HeroUlaz>
        <section className="relative overflow-hidden border-b border-neutral-200/60 bg-white">
          {/* 3D polje zvučnih talasa (desktop, lijeno učitavanje) */}
          <ZvucniTalasiOmot />
          {/* mekani brend odsjaj — samo desktop, mobilno ostaje čisto bijelo */}
          <div
            className="pointer-events-none absolute -top-44 right-[-12%] hidden size-[560px] rounded-full bg-brand-100/35 blur-[150px] lg:block"
            aria-hidden
          />
          <div className="kontejner relative grid items-center gap-14 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-24">
            <div className="relative z-10 max-w-2xl">
              <p data-hero-stavka="1" className="nadnaslov">
                Slušni aparati i briga o sluhu
              </p>
              <h1 data-hero-stavka="2" className="text-display mt-5 text-neutral-900">
                <NaslovSaAkcentom
                  tekst={pocetna.hero?.naslov ?? 'Besplatna provjera sluha — više od 30 godina povjerenja'}
                />
              </h1>
              <p data-hero-stavka="3" className="uvodni mt-6 max-w-xl md:text-[20px]">
                {pocetna.hero?.podnaslov}
              </p>
              <div data-hero-stavka="4" className="mt-10">
                <div className="flex flex-wrap items-center gap-3.5">
                  <DugmeLink href="/zakazivanje" velicina="veliko">
                    {pocetna.hero?.ctaTekst ?? 'Zakažite besplatnu provjeru sluha'}
                    <ArrowRight className="size-5" aria-hidden />
                  </DugmeLink>
                  <DugmeLink href="/online-test-sluha" varijanta="sekundarno" velicina="veliko">
                    <Headphones className="size-5 text-brand-600" aria-hidden />
                    Online test sluha
                  </DugmeLink>
                </div>
                {telefon && (
                  <p className="mt-5 flex flex-wrap items-baseline gap-x-3 text-neutral-600">
                    Radije telefonom?
                    <TelefonLink
                      broj={telefon}
                      lokacija="hero"
                      className="text-[22px] text-neutral-900 hover:text-brand-700"
                    />
                  </p>
                )}
              </div>
              <ul data-hero-stavka="5" className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-3.5">
                {['Besplatno i bez obaveze', '30+ godina iskustva', 'Termin za 2 minute'].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-[15px] font-semibold text-neutral-700">
                    <span className="grid size-5.5 place-items-center rounded-full bg-success-50">
                      <Check className="size-3.5 text-success-600" strokeWidth={2.5} aria-hidden />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* klinička fotografija + stakleni audiogram + živi zvuk */}
            <div data-hero-stavka="5" className="relative mx-auto w-full max-w-[480px] lg:max-w-none">
              {/* koncentrični zvučni prsteni iza fotografije */}
              <svg
                viewBox="0 0 200 200"
                className="absolute -top-12 -left-12 hidden w-52 text-brand-200/70 sm:block lg:-left-16"
                aria-hidden
              >
                {[40, 62, 84].map((r, i) => (
                  <circle
                    key={r}
                    cx="100"
                    cy="100"
                    r={r}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray={`${r * 2.2} ${r * 4.1}`}
                    className="prsten-puls"
                    style={{ animationDelay: `${i * 0.55}s` }}
                  />
                ))}
              </svg>

              <div className="relative aspect-[5/4] overflow-hidden rounded-[32px] shadow-[var(--shadow-lift-lg)] ring-1 ring-neutral-900/5">
                <Image
                  src="/media/site-refresh/homepage-hero.png"
                  alt="Audiologinja pažljivo postavlja slušni aparat starijoj gospođi u Audio BM poslovnici"
                  fill
                  priority
                  sizes="(min-width: 1024px) 560px, (min-width: 640px) 480px, 92vw"
                  className="object-cover object-[60%_center]"
                />
              </div>

              {/* stakleni audiogram — medicinski UI detalj */}
              <div className="staklo lebdi-sporije absolute -bottom-7 -left-3 w-[225px] rounded-[20px] p-4 sm:-left-8">
                <Audiogram />
              </div>

              {/* živi zvuk — godine iskustva */}
              <div className="staklo lebdi absolute -top-5 -right-2 flex items-center gap-3 rounded-full py-2.5 pr-5 pl-3.5 sm:-right-5">
                <span className="ekvilajzer flex h-5 items-end gap-[3px]" aria-hidden>
                  <span className="block h-2.5 w-[3px] rounded-full bg-brand-600" />
                  <span className="block h-4 w-[3px] rounded-full bg-brand-600" />
                  <span className="block h-5 w-[3px] rounded-full bg-brand-500" />
                  <span className="block h-3.5 w-[3px] rounded-full bg-brand-600" />
                  <span className="block h-2 w-[3px] rounded-full bg-brand-400" />
                </span>
                <span className="leading-tight">
                  <span className="block text-[19px] font-extrabold text-neutral-900">
                    <Brojac do={godine} sufiks="+" />
                  </span>
                  <span className="block text-[12.5px] font-medium text-neutral-500">godine uz Vas</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </HeroUlaz>

      {/* ——— Uvodni sažetak (AEO „answer-first" + ključne riječi u tekstu) ——— */}
      <section className="border-b border-neutral-200/60 bg-white">
        <div className="kontejner py-9 md:py-11">
          <p className="mx-auto max-w-3xl text-center text-[17px] leading-relaxed text-neutral-600 md:text-[19px]">
            U <strong className="font-semibold text-neutral-800">Svijet Sluha</strong> nudimo besplatnu
            provjeru sluha i vrhunske slušne aparate vodećih svjetskih brendova — uz više od 30 godina
            povjerenja i stručan tim u šest gradova širom Bosne i Hercegovine. Provjera sluha je
            bezbolna, traje 30–45 minuta i ne obavezuje na kupovinu.
          </p>
        </div>
      </section>

      {/* ——— Online test sluha — istaknuta traka odmah ispod hero sekcije ——— */}
      <section className="sekcija !py-14 md:!py-20" aria-labelledby="online-test-naslov">
        <div className="kontejner">
          <Otkrij>
            <div className="povrsina grid items-center gap-0 overflow-hidden !rounded-[28px] lg:grid-cols-[0.95fr_1.05fr]">
              <div className="relative hidden h-full min-h-[320px] lg:block">
                <Image
                  src="/media/site-refresh/online-hearing-test-page.png"
                  alt="Starija žena sa slušalicama radi online test sluha na laptopu kod kuće"
                  fill
                  sizes="(min-width: 1024px) 560px, 0px"
                  className="object-cover"
                />
                <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" aria-hidden />
              </div>
              <div className="p-7 md:p-10 lg:p-12">
                <p className="nadnaslov">Novo na stranici</p>
                <h2 id="online-test-naslov" className="text-h2 mt-3.5">
                  Provjerite sluh od kuće — online test za 5 minuta
                </h2>
                <p className="uvodni mt-4">
                  Kratki tonovi za lijevo i desno uho, nekoliko jednostavnih pitanja — i odmah jasan,
                  razumljiv rezultat. Potrebne su Vam samo slušalice i tiha prostorija.
                </p>
                <ul className="mt-6 flex flex-wrap gap-x-7 gap-y-2.5 text-[15px] font-semibold text-neutral-700">
                  <li className="flex items-center gap-2">
                    <Clock className="size-4.5 text-brand-600" aria-hidden /> 3–5 minuta
                  </li>
                  <li className="flex items-center gap-2">
                    <Headphones className="size-4.5 text-brand-600" aria-hidden /> Uz slušalice
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="size-4.5 text-success-600" aria-hidden /> Ništa se ne snima
                  </li>
                </ul>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <DugmeLink href="/online-test-sluha" velicina="veliko">
                    <Headphones className="size-5" aria-hidden />
                    Pokrenite online test
                  </DugmeLink>
                  <Link
                    href="/zakazivanje"
                    className="font-semibold text-brand-700 underline decoration-brand-200 decoration-2 underline-offset-4 transition-colors duration-150 hover:text-brand-800 hover:decoration-brand-400"
                  >
                    ili zakažite termin u poslovnici
                  </Link>
                </div>
                <p className="text-small mt-5 text-neutral-500">
                  Informativni screening — ne zamjenjuje profesionalnu provjeru sluha u poslovnici.
                </p>
              </div>
            </div>
          </Otkrij>
        </div>
      </section>

      {/* sekcije po redoslijedu iz CMS-a */}
      {redoslijed.length > 0 ? redoslijed.map((s) => sekcije[s] ?? null) : Object.values(sekcije)}
    </>
  )
}
