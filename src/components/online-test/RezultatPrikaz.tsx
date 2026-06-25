'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  PhoneCall,
  CalendarCheck,
  Send,
  RotateCcw,
  Info,
} from 'lucide-react'
import { posaljiTestSluha, type StanjeTestObrasca } from '@/app/actions/posaljiTestSluha'
import { Dugme, DugmeLink } from '@/components/ui/Dugme'
import { PoljeUnos, PoljeIzbor, PoljeSaglasnost } from '@/components/ui/Polje'
import { Honeypot, Turnstile } from '@/components/ui/Turnstile'
import { zabiljezi } from '@/lib/analytics'
import {
  FREKVENCIJE,
  KATEGORIJE_TESTA,
  POUZDANOST_OZNAKE,
  type RezultatTesta,
  type Uho,
} from '@/lib/test-sluha'

const pocetno: StanjeTestObrasca = { status: 'pocetno' }

const STIL_KATEGORIJE: Record<
  RezultatTesta['kategorija'],
  { ikona: typeof CheckCircle2; boja: string; pozadina: string }
> = {
  'bez-znakova': { ikona: CheckCircle2, boja: 'text-success-600', pozadina: 'bg-success-50 border-success-600/20' },
  moguca: { ikona: Info, boja: 'text-warning-600', pozadina: 'bg-warning-50 border-warning-600/20' },
  preporuka: { ikona: Stethoscope, boja: 'text-brand-700', pozadina: 'bg-brand-50 border-brand-200' },
  hitno: { ikona: AlertTriangle, boja: 'text-brand-700', pozadina: 'bg-brand-50 border-brand-300' },
}

/** Informativni prikaz pragova — namjerno NIJE stilizovan kao klinički audiogram. */
function GrafRezultata({ pragovi }: { pragovi: RezultatTesta['pragovi'] }) {
  const W = 460
  const H = 240
  const L = 48 // lijeva margina
  const D = 16
  const V = 26 // vrh
  const dno = H - 38

  const x = (i: number) => L + (i * (W - L - D)) / (FREKVENCIJE.length - 1)
  const y = (prag: number) => V + (prag / 60) * (dno - V)

  const linija = (uho: Uho) => {
    const tacke = FREKVENCIJE.map((f, i) => {
      const p = pragovi[uho][String(f)]
      return p === null ? null : ([x(i), y(p)] as const)
    })
    const put = tacke
      .map((t, i) => (t ? `${i === 0 || !tacke[i - 1] ? 'M' : 'L'}${t[0]},${t[1]}` : ''))
      .join(' ')
    return { tacke, put }
  }

  const desno = linija('desno')
  const lijevo = linija('lijevo')

  return (
    <figure className="povrsina !rounded-[20px] p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <figcaption className="text-[13px] font-bold tracking-[0.12em] text-neutral-500 uppercase">
          Informativni prikaz — nije klinički audiogram
        </figcaption>
        <span className="flex items-center gap-4 text-[13px] font-semibold text-neutral-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-brand-600" aria-hidden /> Desno uho
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-neutral-500" aria-hidden /> Lijevo uho
          </span>
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full"
        role="img"
        aria-label="Relativni pragovi sluha po frekvencijama za lijevo i desno uho — niže na grafikonu znači tiše tonove koje ste čuli"
      >
        {/* mreža */}
        {[0, 15, 30, 45, 60].map((p) => (
          <g key={p}>
            <line x1={L} x2={W - D} y1={y(p)} y2={y(p)} stroke="#E8E5E3" strokeWidth="1" />
            <text x={L - 8} y={y(p) + 3.5} textAnchor="end" fontSize="10" fill="#A9A39E" fontWeight="600">
              {p}
            </text>
          </g>
        ))}
        {FREKVENCIJE.map((f, i) => (
          <text key={f} x={x(i)} y={H - 16} textAnchor="middle" fontSize="11" fill="#79726C" fontWeight="600">
            {f >= 1000 ? `${f / 1000} kHz` : `${f} Hz`}
          </text>
        ))}
        <text x={L - 34} y={V - 10} fontSize="10" fill="#A9A39E" fontWeight="600">
          tiše ↑
        </text>

        {/* lijevo uho — siva isprekidana */}
        <path d={lijevo.put} fill="none" stroke="#79726C" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />
        {/* desno uho — brend */}
        <path d={desno.put} fill="none" stroke="#ED1C24" strokeWidth="2.5" strokeLinecap="round" />

        {FREKVENCIJE.map((f, i) => {
          const pd = pragovi.desno[String(f)]
          const pl = pragovi.lijevo[String(f)]
          return (
            <g key={f}>
              {pl !== null && <rect x={x(i) - 4} y={y(pl) - 4} width="8" height="8" fill="white" stroke="#79726C" strokeWidth="2" />}
              {pd !== null && <circle cx={x(i)} cy={y(pd)} r="4.5" fill="white" stroke="#ED1C24" strokeWidth="2.5" />}
              {pd === null && (
                <text x={x(i)} y={y(58)} textAnchor="middle" fontSize="13" fill="#ED1C24" fontWeight="800">
                  ×
                </text>
              )}
              {pl === null && (
                <text x={x(i) + 10} y={y(58)} textAnchor="middle" fontSize="13" fill="#79726C" fontWeight="800">
                  ×
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <p className="text-small mt-2 text-neutral-500">
        Prikazani su relativni pragovi iz ovog screeninga (0–60; niže = čuli ste tiše tonove). Znak ×
        označava ton koji nije čut ni na najglasnijem dozvoljenom nivou.
      </p>
    </figure>
  )
}

/** Rezultat + slanje rezultata našem timu. */
export function RezultatPrikaz({
  rezultat,
  poslovnice,
  onPonovi,
}: {
  rezultat: RezultatTesta
  poslovnice: { id: number; grad: string }[]
  onPonovi: () => void
}) {
  const [stanje, akcija, salje] = useActionState(posaljiTestSluha, pocetno)
  const [prikaziObrazac, setPrikaziObrazac] = useState(false)
  const info = KATEGORIJE_TESTA[rezultat.kategorija]
  const stil = STIL_KATEGORIJE[rezultat.kategorija]
  const Ikona = stil.ikona

  useEffect(() => {
    zabiljezi('hearing_test_complete', { kategorija: rezultat.kategorija })
  }, [rezultat.kategorija])

  useEffect(() => {
    if (stanje.status === 'uspjeh') zabiljezi('lead_submit', { vrsta: 'online-test-sluha', izvor: '/online-test-sluha' })
  }, [stanje.status])

  return (
    <div className="space-y-6">
      {/* kategorija */}
      <section className={`rounded-[24px] border p-7 md:p-9 ${stil.pozadina}`} aria-labelledby="rezultat-naslov">
        <div className="flex items-start gap-4">
          <span className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-white shadow-sm ${stil.boja}`}>
            <Ikona className="size-6" strokeWidth={2} aria-hidden />
          </span>
          <div>
            <h2 id="rezultat-naslov" className="text-h3 text-neutral-900">
              {info.naslov}
            </h2>
            <p className="mt-2.5 max-w-2xl text-neutral-700">{info.opis}</p>
            {rezultat.kategorija === 'hitno' && (
              <p className="mt-3 max-w-2xl font-semibold text-brand-800">
                Kod iznenadnog gubitka sluha najbolje je javiti se ljekaru u roku od 48–72 sata.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* pouzdanost */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[18px] border border-neutral-200 bg-white px-5 py-4">
        <span className="text-[15px] font-bold text-neutral-800">{POUZDANOST_OZNAKE[rezultat.pouzdanostNivo]}</span>
        <span className="flex h-2 w-40 overflow-hidden rounded-full bg-neutral-200" role="img" aria-label={`Pouzdanost ${rezultat.pouzdanost} od 100`}>
          <span
            className={`h-full rounded-full ${rezultat.pouzdanostNivo === 'visoka' ? 'bg-success-600' : rezultat.pouzdanostNivo === 'srednja' ? 'bg-warning-600' : 'bg-brand-600'}`}
            style={{ width: `${rezultat.pouzdanost}%` }}
          />
        </span>
        <span className="text-small text-neutral-500">
          {rezultat.pouzdanostNivo === 'visoka'
            ? 'Uslovi i odgovori tokom testa bili su dosljedni.'
            : 'Na pouzdanost utiču buka, slušalice i dosljednost odgovora — profesionalna provjera daje tačan nalaz.'}
        </span>
      </div>

      <GrafRezultata pragovi={rezultat.pragovi} />

      <p className="text-small rounded-[14px] bg-neutral-50 p-4 text-neutral-600">
        Ovo je informativni online screening i ne zamjenjuje profesionalnu provjeru sluha u
        poslovnici. Rezultat zavisi od slušalica, uređaja i okruženja — zato ne prikazujemo
        kliničke vrijednosti u dB HL.
      </p>

      {/* CTA */}
      <div className="flex flex-wrap items-center gap-3.5">
        <DugmeLink href="/zakazivanje" velicina="veliko">
          <CalendarCheck className="size-5" aria-hidden />
          Zakažite besplatnu provjeru sluha
        </DugmeLink>
        {stanje.status !== 'uspjeh' && (
          <Dugme
            varijanta="sekundarno"
            velicina="veliko"
            onClick={() => setPrikaziObrazac((p) => !p)}
            aria-expanded={prikaziObrazac}
          >
            <Send className="size-4.5" aria-hidden />
            Pošaljite rezultat našem timu
          </Dugme>
        )}
        <button
          type="button"
          onClick={onPonovi}
          className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full px-4 text-[15px] font-semibold text-neutral-600 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <RotateCcw className="size-4" aria-hidden />
          Ponovite test
        </button>
      </div>

      {/* slanje rezultata */}
      {stanje.status === 'uspjeh' ? (
        <div className="flex items-start gap-3 rounded-[20px] bg-success-50 p-7 text-success-700" role="status">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0" aria-hidden />
          <div>
            <p className="font-bold">{stanje.poruka}</p>
            <p className="mt-1 text-[15px]">
              Naš tim će pregledati rezultat i javiti Vam se sa preporukom — bez ikakve obaveze.
            </p>
          </div>
        </div>
      ) : (
        prikaziObrazac && (
          <form action={akcija} className="povrsina space-y-5 !rounded-[24px] p-6 md:p-8" data-forma>
            <Honeypot />
            <input type="hidden" name="rezultatTesta" value={JSON.stringify(rezultat)} />
            <div>
              <h3 className="text-h3">Pošaljite rezultat našem timu</h3>
              <p className="text-small mt-1.5 text-neutral-500">
                Šaljemo samo rezultat screeninga i Vaše kontakt podatke — ništa drugo. Javit ćemo Vam
                se isti radni dan.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <PoljeUnos oznaka="Ime i prezime" name="ime" autoComplete="name" required greska={stanje.greske?.ime} />
              <PoljeUnos
                oznaka="Broj telefona"
                name="telefon"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                greska={stanje.greske?.telefon}
                placeholder="npr. 065 123 456"
              />
            </div>
            <PoljeUnos oznaka="E-mail (nije obavezno)" name="email" type="email" autoComplete="email" greska={stanje.greske?.email} />
            <PoljeIzbor oznaka="Najbliža poslovnica (nije obavezno)" name="poslovnica" defaultValue="">
              <option value="">— odaberite ako želite —</option>
              {poslovnice.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.grad}
                </option>
              ))}
            </PoljeIzbor>
            <PoljeSaglasnost name="saglasnost" greska={stanje.greske?.saglasnost} />
            <Turnstile />
            {stanje.status === 'greska' && stanje.poruka && !stanje.greske && (
              <p role="alert" className="rounded-[12px] bg-error-50 px-4 py-3 text-[15px] font-medium text-error-600">
                {stanje.poruka}
              </p>
            )}
            <Dugme type="submit" velicina="veliko" ucitava={salje}>
              Pošaljite rezultat
            </Dugme>
          </form>
        )
      )}

      {/* dodatne veze */}
      <p className="text-small text-neutral-500">
        Želite saznati više?{' '}
        <Link href="/slusni-aparati" className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800">
          Vodič kroz slušne aparate
        </Link>{' '}
        ·{' '}
        <Link href="/usluge" className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800">
          Naše usluge
        </Link>{' '}
        ·{' '}
        <Link href="/poslovnice" className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800">
          Poslovnice
        </Link>
      </p>
      <p className="text-small flex items-center gap-2 text-neutral-500">
        <PhoneCall className="size-4 text-brand-600" aria-hidden />
        Radije razgovarate? Pozovite najbližu poslovnicu — brojevi su u podnožju stranice.
      </p>
    </div>
  )
}
