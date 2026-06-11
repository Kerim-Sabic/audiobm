'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Headphones,
  Volume2,
  MicOff,
  Mic,
  Check,
  X,
  Ear,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { Dugme } from '@/components/ui/Dugme'
import { zabiljezi } from '@/lib/analytics'
import {
  DBFS_PLAFON,
  DBFS_POD,
  DBFS_REFERENTNI,
  DBFS_START,
  FREKVENCIJE,
  UPITNIK,
  ZASTAVICE,
  ocijeniKategoriju,
  ocijeniPouzdanost,
  uRelativnu,
  type Frekvencija,
  type RezultatTesta,
  type Uho,
  type UpitnikKljuc,
  type UpitnikOdgovori,
} from '@/lib/test-sluha'
import { ZvucniMotor, izmjeriBuku } from './zvuk'
import { RezultatPrikaz } from './RezultatPrikaz'

type Korak = 'uvod' | 'slusalice' | 'glasnoca' | 'tisina' | 'upitnik' | 'test' | 'rezultat'

const FAZE: { id: string; oznaka: string; koraci: Korak[] }[] = [
  { id: 'priprema', oznaka: 'Priprema', koraci: ['uvod', 'slusalice', 'glasnoca', 'tisina'] },
  { id: 'upitnik', oznaka: 'Upitnik', koraci: ['upitnik'] },
  { id: 'slusanje', oznaka: 'Slušanje', koraci: ['test'] },
  { id: 'rezultat', oznaka: 'Rezultat', koraci: ['rezultat'] },
]

/** Redoslijed: desno uho pa lijevo; 1 kHz prvo (standardni početak), zatim ostale. */
const REDOSLIJED_FREKVENCIJA: Frekvencija[] = [1000, 2000, 4000, 500, 6000]
const REDOSLIJED: { uho: Uho; frekvencija: Frekvencija }[] = (['desno', 'lijevo'] as Uho[]).flatMap(
  (uho) => REDOSLIJED_FREKVENCIJA.map((frekvencija) => ({ uho, frekvencija })),
)

const PROCJENA_PO_FREKVENCIJI = 6 // prosječan broj tonova po frekvenciji (za traku napretka)

type StanjeMotora = {
  indeks: number
  nivo: number
  minCuo: number
  maksNijeCuo: number
  brojPokusaja: number
  pragovi: Record<Uho, Record<string, number | null>>
  nedosljedne: number
  laznePotvrde: number
  catchKoristeno: number
  odZadnjegCatcha: number
  trenutniCatch: boolean
  prezId: number
  /** odgovor se prima samo dok prezentacija traje (od početka tona do odgovora) */
  aktivna: boolean
  gotovo: boolean
}

const svjezeStanje = (): StanjeMotora => ({
  indeks: 0,
  nivo: DBFS_START,
  minCuo: Infinity,
  maksNijeCuo: -Infinity,
  brojPokusaja: 0,
  pragovi: { desno: {}, lijevo: {} },
  nedosljedne: 0,
  laznePotvrde: 0,
  catchKoristeno: 0,
  odZadnjegCatcha: 99,
  trenutniCatch: false,
  prezId: 0,
  aktivna: false,
  gotovo: false,
})

/**
 * Online test sluha — informativni screening u 4 faze.
 * Zvuk kreće isključivo na klik; tastatura: 1 = Čujem, 2 = Ne čujem.
 */
export function TestSluha({ poslovnice }: { poslovnice: { id: number; grad: string }[] }) {
  const [korak, setKorak] = useState<Korak>('uvod')
  const motor = useRef<ZvucniMotor | null>(null)
  const vrhRef = useRef<HTMLDivElement>(null)
  const naslovRef = useRef<HTMLHeadingElement>(null)

  // — priprema —
  const [provjeraUha, setProvjeraUha] = useState<Record<Uho, 'ceka' | 'svira' | 'ok' | 'greska'>>({
    lijevo: 'ceka',
    desno: 'ceka',
  })
  const [referentniSvira, setReferentniSvira] = useState(false)
  const [glasnocaPotvrdjena, setGlasnocaPotvrdjena] = useState(false)
  const [mikrofon, setMikrofon] = useState<'nije' | 'mjeri' | 'tiho' | 'bucno' | 'odbijeno'>('nije')
  const [tisinaPotvrdjena, setTisinaPotvrdjena] = useState(false)

  // — upitnik —
  const [odgovori, setOdgovori] = useState<UpitnikOdgovori>({})
  const [zastavice, setZastavice] = useState<string[]>([])
  const [nistaOdNavedenog, setNistaOdNavedenog] = useState(false)
  const [upitnikGreska, setUpitnikGreska] = useState(false)

  // — test tonova —
  const st = useRef<StanjeMotora>(svjezeStanje())
  const tajmer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [svira, setSvira] = useState(false)
  const [brojTona, setBrojTona] = useState(0)
  const [zavrsenihFrekvencija, setZavrsenihFrekvencija] = useState(0)
  const [pauzaUha, setPauzaUha] = useState(false)
  const [najava, setNajava] = useState('')
  const pocetakTesta = useRef<number>(0)

  const [rezultat, setRezultat] = useState<RezultatTesta | null>(null)

  const dajMotor = () => (motor.current ??= new ZvucniMotor())

  // čišćenje pri izlasku
  useEffect(
    () => () => {
      if (tajmer.current) clearTimeout(tajmer.current)
      motor.current?.zatvori()
    },
    [],
  )

  // fokus na naslov pri promjeni koraka (čitači ekrana + tastatura)
  useEffect(() => {
    vrhRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    naslovRef.current?.focus({ preventScroll: true })
  }, [korak])

  const idi = (k: Korak) => setKorak(k)

  /* ————— provjera slušalica ————— */
  const pustiProvjeru = async (uho: Uho) => {
    const m = dajMotor()
    if (!(await m.pokreni())) return
    setProvjeraUha((p) => ({ ...p, [uho]: 'svira' }))
    await m.pustiTon({ frekvencija: 800, dbfs: -35, kanal: uho })
    setProvjeraUha((p) => (p[uho] === 'svira' ? { ...p, [uho]: 'ceka' } : p))
  }
  const potvrdiProvjeru = (uho: Uho, ok: boolean) =>
    setProvjeraUha((p) => ({ ...p, [uho]: ok ? 'ok' : 'greska' }))

  /* ————— kalibracija glasnoće ————— */
  const pustiReferentni = async () => {
    const m = dajMotor()
    if (!(await m.pokreni())) return
    setReferentniSvira(true)
    await m.pustiTon({ frekvencija: 1000, dbfs: DBFS_REFERENTNI, kanal: 'oba' })
    setReferentniSvira(false)
  }

  /* ————— mikrofonска provjera buke ————— */
  const provjeriBuku = async () => {
    setMikrofon('mjeri')
    const nivo = await izmjeriBuku()
    if (nivo === null) setMikrofon('odbijeno')
    else setMikrofon(nivo > -45 ? 'bucno' : 'tiho')
  }

  /* ————— upitnik ————— */
  const OBAVEZNA: UpitnikKljuc[] = ['dob', 'govorUBuci', 'tv', 'telefon', 'tinitus', 'jednoUho', 'buka', 'aparati']
  const upitnikPotpun =
    OBAVEZNA.every((k) => odgovori[k]) && (zastavice.length > 0 || nistaOdNavedenog)

  const predajUpitnik = () => {
    if (!upitnikPotpun) {
      setUpitnikGreska(true)
      return
    }
    setUpitnikGreska(false)
    idi('test')
  }

  /* ————— test tonova: pretraga praga ————— */
  const trenutna = REDOSLIJED[Math.min(st.current.indeks, REDOSLIJED.length - 1)]

  const zavrsiTest = useCallback(() => {
    const s = st.current
    s.gotovo = true
    const sviPragovi = [...Object.values(s.pragovi.desno), ...Object.values(s.pragovi.lijevo)]
    const sveNull = sviPragovi.length > 0 && sviPragovi.every((p) => p === null)
    const mikrofonProvjera = mikrofon === 'tiho' ? 'tiho' : mikrofon === 'bucno' ? 'bucno' : 'preskoceno'
    const { pouzdanost, nivo } = ocijeniPouzdanost({
      laznePotvrde: s.laznePotvrde,
      nedosljedneFrekvencije: s.nedosljedne,
      mikrofonProvjera,
      sveNull,
    })
    const r: RezultatTesta = {
      kategorija: ocijeniKategoriju({ pragovi: s.pragovi, upitnik: odgovori, zastavice }),
      pouzdanost,
      pouzdanostNivo: nivo,
      pragovi: s.pragovi,
      upitnik: odgovori,
      zastavice,
      laznePotvrde: s.laznePotvrde,
      nedosljedneFrekvencije: s.nedosljedne,
      mikrofonProvjera,
      trajanjeSekundi: Math.round((Date.now() - pocetakTesta.current) / 1000),
    }
    setRezultat(r)
    setKorak('rezultat')
  }, [mikrofon, odgovori, zastavice])

  const prezentuj = useCallback(async () => {
    const s = st.current
    if (s.gotovo || s.indeks >= REDOSLIJED.length) return
    const m = dajMotor()
    if (!(await m.pokreni())) return

    // kontrolni (catch) pokušaj — tišina, korisnik NE bi trebao čuti ništa
    const jeCatch = s.catchKoristeno < 4 && s.odZadnjegCatcha >= 3 && Math.random() < 0.09
    s.trenutniCatch = jeCatch
    if (jeCatch) {
      s.catchKoristeno++
      s.odZadnjegCatcha = 0
    } else {
      s.odZadnjegCatcha++
    }

    const id = ++s.prezId
    s.aktivna = true
    const { uho, frekvencija } = REDOSLIJED[s.indeks]
    setBrojTona((b) => b + 1)
    setNajava(`Ton broj ${s.brojPokusaja + 1}. Da li čujete ton?`)
    setSvira(true)
    await m.pustiTon({ frekvencija, dbfs: s.nivo, kanal: uho, tisina: jeCatch })
    if (st.current.prezId === id) setSvira(false)
  }, [])

  const planirajSljedecu = useCallback(() => {
    if (tajmer.current) clearTimeout(tajmer.current)
    tajmer.current = setTimeout(() => void prezentuj(), 650 + Math.random() * 750)
  }, [prezentuj])

  const odgovoriNaTon = useCallback(
    (cuo: boolean) => {
      const s = st.current
      if (korak !== 'test' || s.gotovo || pauzaUha || !s.aktivna) return
      s.aktivna = false
      s.prezId++ // poništava tekuću prezentaciju (odgovor je moguć i tokom tona)
      motor.current?.zaustavi()
      setSvira(false)

      // kontrolni pokušaj — bilježimo lažnu potvrdu, nivo se ne mijenja
      if (s.trenutniCatch) {
        if (cuo) s.laznePotvrde++
        s.trenutniCatch = false
        planirajSljedecu()
        return
      }

      s.brojPokusaja++
      const { uho, frekvencija } = REDOSLIJED[s.indeks]
      let prag: number | null | undefined // undefined = pretraga se nastavlja

      if (cuo) {
        s.minCuo = Math.min(s.minCuo, s.nivo)
        if (s.minCuo - s.maksNijeCuo <= 5 && s.maksNijeCuo !== -Infinity) prag = uRelativnu(s.minCuo)
        else if (s.nivo <= DBFS_POD) prag = uRelativnu(DBFS_POD)
        else s.nivo = Math.max(s.nivo - 10, DBFS_POD)
      } else {
        s.maksNijeCuo = Math.max(s.maksNijeCuo, s.nivo)
        if (s.minCuo !== Infinity && s.minCuo - s.maksNijeCuo <= 5) prag = uRelativnu(s.minCuo)
        else if (s.nivo >= DBFS_PLAFON) prag = null // ne čuje ni najglasniji dozvoljeni ton
        else s.nivo = Math.min(s.nivo + 5, DBFS_PLAFON)
      }

      // sigurnosna granica broja pokušaja po frekvenciji
      if (prag === undefined && s.brojPokusaja >= 10) {
        prag = s.minCuo !== Infinity ? uRelativnu(s.minCuo) : null
        s.nedosljedne++
      }

      if (prag !== undefined) {
        s.pragovi[uho][String(frekvencija)] = prag
        s.indeks++
        s.nivo = DBFS_START
        s.minCuo = Infinity
        s.maksNijeCuo = -Infinity
        s.brojPokusaja = 0
        setZavrsenihFrekvencija(s.indeks)

        if (s.indeks >= REDOSLIJED.length) {
          zavrsiTest()
          return
        }
        // prelazak na drugo uho — kratka pauza sa najavom
        if (REDOSLIJED[s.indeks].uho !== uho) {
          setPauzaUha(true)
          setNajava('Prva polovina je gotova. Sada testiramo lijevo uho.')
          return
        }
      }
      planirajSljedecu()
    },
    [korak, pauzaUha, planirajSljedecu, zavrsiTest],
  )

  const pocniTest = async () => {
    const m = dajMotor()
    if (!(await m.pokreni())) return
    st.current = svjezeStanje()
    setZavrsenihFrekvencija(0)
    setBrojTona(0)
    setPauzaUha(false)
    pocetakTesta.current = Date.now()
    zabiljezi('hearing_test_start', {})
    void prezentuj()
  }

  const nastaviDrugoUho = () => {
    setPauzaUha(false)
    planirajSljedecu()
  }

  // tastatura: 1 = čujem, 2 = ne čujem
  useEffect(() => {
    if (korak !== 'test') return
    const naTipku = (e: KeyboardEvent) => {
      if (e.key === '1') odgovoriNaTon(true)
      else if (e.key === '2') odgovoriNaTon(false)
    }
    window.addEventListener('keydown', naTipku)
    return () => window.removeEventListener('keydown', naTipku)
  }, [korak, odgovoriNaTon])

  const ponovi = () => {
    st.current = svjezeStanje()
    setRezultat(null)
    setOdgovori({})
    setZastavice([])
    setNistaOdNavedenog(false)
    setZavrsenihFrekvencija(0)
    setBrojTona(0)
    setKorak('uvod')
  }

  /* ————— napredak ————— */
  const fazaIndeks = FAZE.findIndex((f) => f.koraci.includes(korak))
  const progresTesta = useMemo(() => {
    const ukupno = REDOSLIJED.length * PROCJENA_PO_FREKVENCIJI
    const unutar = Math.min(st.current.brojPokusaja, PROCJENA_PO_FREKVENCIJI)
    return Math.min(98, Math.round(((zavrsenihFrekvencija * PROCJENA_PO_FREKVENCIJI + unutar) / ukupno) * 100))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zavrsenihFrekvencija, brojTona])

  const radio = (kljuc: UpitnikKljuc) => (
    <fieldset key={kljuc}>
      <legend className="font-semibold text-neutral-800">{UPITNIK[kljuc].pitanje}</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {UPITNIK[kljuc].odgovori.map((o) => {
          const aktivan = odgovori[kljuc] === o.v
          return (
            <button
              key={o.v}
              type="button"
              role="radio"
              aria-checked={aktivan}
              onClick={() => setOdgovori((p) => ({ ...p, [kljuc]: o.v }))}
              className={`min-h-11 cursor-pointer rounded-full border px-4.5 py-2 text-[15px] font-semibold transition-colors duration-150 ${
                aktivan
                  ? 'border-brand-600 bg-brand-600 text-white shadow-[var(--shadow-cta)]'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
              }`}
            >
              {o.o}
            </button>
          )
        })}
      </div>
    </fieldset>
  )

  return (
    <div ref={vrhRef} className="scroll-mt-28">
      {/* faze */}
      <ol className="mb-8 flex items-center gap-2" aria-label="Koraci testa">
        {FAZE.map((f, i) => (
          <li key={f.id} className="flex flex-1 flex-col gap-1.5" aria-current={i === fazaIndeks ? 'step' : undefined}>
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-brand-600 transition-[width] duration-300 ease-out"
                style={{ width: i < fazaIndeks ? '100%' : i === fazaIndeks ? (korak === 'test' ? `${progresTesta}%` : '50%') : '0%' }}
              />
            </div>
            <span className={`text-[13px] sm:text-small ${i <= fazaIndeks ? 'font-semibold text-neutral-800' : 'text-neutral-500'}`}>
              {i + 1}. {f.oznaka}
            </span>
          </li>
        ))}
      </ol>

      {/* najave za čitače ekrana */}
      <p aria-live="polite" className="sr-only">
        {najava}
      </p>

      {/* ——— 1. uvod ——— */}
      {korak === 'uvod' && (
        <div>
          <h2 ref={naslovRef} tabIndex={-1} className="text-h3 outline-none">
            Prije nego počnemo
          </h2>
          <ul className="mt-5 space-y-3.5">
            {[
              ['Test traje 3–5 minuta', 'Radite ga svojim tempom — bez žurbe.'],
              ['Koristite slušalice', 'Obične slušalice ili bubice — svako uho se testira posebno.'],
              ['Sjednite u tihu prostoriju', 'Isključite televizor i radio; zatvorite vrata i prozor.'],
              ['Ne mijenjajte glasnoću tokom testa', 'Glasnoću ćemo zajedno podesiti na početku — nakon toga je ne dirajte.'],
            ].map(([naslov, opis]) => (
              <li key={naslov} className="flex items-start gap-3.5">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-success-50">
                  <Check className="size-4 text-success-600" strokeWidth={2.5} aria-hidden />
                </span>
                <span>
                  <strong className="font-bold text-neutral-900">{naslov}</strong>
                  <span className="block text-[15.5px] text-neutral-600">{opis}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex items-start gap-3.5 rounded-[18px] border border-warning-600/25 bg-warning-50 p-5">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning-600" aria-hidden />
            <p className="text-[15px] text-neutral-700">
              <strong className="font-bold">Važno:</strong> iznenadni gubitak sluha, bol u uhu,
              iscjedak, jaka vrtoglavica ili nagla promjena na jednom uhu zahtijevaju{' '}
              <strong className="font-bold">hitnu ljekarsku procjenu</strong> (ljekar porodične
              medicine ili ORL) — ne čekajte rezultat online testa.
            </p>
          </div>

          <p className="text-small mt-5 text-neutral-500">
            Ovo je informativni online screening i ne zamjenjuje profesionalnu provjeru sluha u
            poslovnici. Ne snimamo nikakav zvuk — sve se obrađuje u Vašem pregledniku.
          </p>

          <Dugme velicina="veliko" className="mt-7" onClick={() => idi('slusalice')}>
            Počnite pripremu <ChevronRight className="size-5" aria-hidden />
          </Dugme>
        </div>
      )}

      {/* ——— 2. slušalice ——— */}
      {korak === 'slusalice' && (
        <div>
          <h2 ref={naslovRef} tabIndex={-1} className="text-h3 outline-none">
            Provjera slušalica
          </h2>
          <p className="mt-2 text-neutral-600">
            Stavite slušalice pa pustite ton za svako uho — i potvrdite na kojoj strani ga čujete.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(['lijevo', 'desno'] as Uho[]).map((uho) => {
              const stanje = provjeraUha[uho]
              return (
                <div key={uho} className={`povrsina p-6 ${stanje === 'ok' ? '!border-success-600/40' : ''}`}>
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-2.5 font-bold text-neutral-900 capitalize">
                      <Headphones className="size-5 text-brand-600" aria-hidden />
                      {uho} uho
                    </p>
                    {stanje === 'ok' && (
                      <span className="grid size-7 place-items-center rounded-full bg-success-50">
                        <Check className="size-4 text-success-600" strokeWidth={2.5} aria-hidden />
                      </span>
                    )}
                  </div>
                  <Dugme
                    varijanta="sekundarno"
                    className="mt-4 w-full"
                    onClick={() => void pustiProvjeru(uho)}
                    disabled={stanje === 'svira'}
                  >
                    {stanje === 'svira' ? (
                      <>
                        <Loader2 className="size-4.5 animate-spin" aria-hidden /> Ton svira…
                      </>
                    ) : (
                      <>
                        <Volume2 className="size-4.5" aria-hidden /> Pustite ton ({uho})
                      </>
                    )}
                  </Dugme>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => potvrdiProvjeru(uho, true)}
                      className="min-h-11 cursor-pointer rounded-full border border-neutral-300 bg-white text-[14.5px] font-semibold text-neutral-700 transition-colors duration-150 hover:border-success-600 hover:text-success-700"
                    >
                      Čujem {uho}
                    </button>
                    <button
                      type="button"
                      onClick={() => potvrdiProvjeru(uho, false)}
                      className="min-h-11 cursor-pointer rounded-full border border-neutral-300 bg-white text-[14.5px] font-semibold text-neutral-700 transition-colors duration-150 hover:border-brand-400 hover:text-brand-700"
                    >
                      Ne čujem / pogrešna strana
                    </button>
                  </div>
                  {stanje === 'greska' && (
                    <p className="text-small mt-3 rounded-[12px] bg-brand-50 p-3 text-neutral-700">
                      Provjerite da su slušalice dobro priključene i pravilno okrenute (L = lijevo,
                      R = desno), pojačajte zvuk uređaja, pa pokušajte ponovo.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3.5">
            <Dugme
              velicina="veliko"
              onClick={() => idi('glasnoca')}
              disabled={provjeraUha.lijevo !== 'ok' || provjeraUha.desno !== 'ok'}
            >
              Nastavite <ChevronRight className="size-5" aria-hidden />
            </Dugme>
            <button
              type="button"
              onClick={() => idi('uvod')}
              className="inline-flex min-h-12 cursor-pointer items-center gap-1 rounded-full px-3 text-[15px] font-medium text-neutral-600 hover:text-neutral-900"
            >
              <ChevronLeft className="size-4" aria-hidden /> Nazad
            </button>
          </div>
        </div>
      )}

      {/* ——— 3. glasnoća ——— */}
      {korak === 'glasnoca' && (
        <div>
          <h2 ref={naslovRef} tabIndex={-1} className="text-h3 outline-none">
            Podešavanje glasnoće
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-neutral-700">
            <li>Pustite referentni ton (možete ga ponavljati).</li>
            <li>
              Tipkama za glasnoću na uređaju podesite da ton bude <strong>tih, ali jasno čujan</strong> —
              kao tiho kucanje sata.
            </li>
            <li>
              Nakon ovoga <strong>ne mijenjajte glasnoću</strong> do kraja testa.
            </li>
          </ol>
          <div className="mt-6 flex flex-wrap items-center gap-3.5">
            <Dugme varijanta="sekundarno" velicina="veliko" onClick={() => void pustiReferentni()} disabled={referentniSvira}>
              {referentniSvira ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden /> Ton svira…
                </>
              ) : (
                <>
                  <Volume2 className="size-5" aria-hidden /> Pustite referentni ton
                </>
              )}
            </Dugme>
          </div>
          <label className="mt-6 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={glasnocaPotvrdjena}
              onChange={(e) => setGlasnocaPotvrdjena(e.target.checked)}
              className="mt-1 size-5 shrink-0 cursor-pointer accent-brand-600"
            />
            <span className="text-neutral-700">
              Ton je tih ali jasan — glasnoću više neću mijenjati.
            </span>
          </label>
          <div className="mt-7 flex flex-wrap items-center gap-3.5">
            <Dugme velicina="veliko" onClick={() => idi('tisina')} disabled={!glasnocaPotvrdjena}>
              Nastavite <ChevronRight className="size-5" aria-hidden />
            </Dugme>
            <button
              type="button"
              onClick={() => idi('slusalice')}
              className="inline-flex min-h-12 cursor-pointer items-center gap-1 rounded-full px-3 text-[15px] font-medium text-neutral-600 hover:text-neutral-900"
            >
              <ChevronLeft className="size-4" aria-hidden /> Nazad
            </button>
          </div>
        </div>
      )}

      {/* ——— 4. tišina ——— */}
      {korak === 'tisina' && (
        <div>
          <h2 ref={naslovRef} tabIndex={-1} className="text-h3 outline-none">
            Tiha prostorija
          </h2>
          <p className="mt-2 max-w-xl text-neutral-600">
            Pozadinska buka kvari rezultat. Ako želite, mikrofonom možemo provjeriti koliko je tiho —{' '}
            <strong className="font-semibold text-neutral-800">zvuk se ne snima niti šalje</strong>, samo
            se očitava trenutni nivo.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3.5">
            <Dugme varijanta="sekundarno" onClick={() => void provjeriBuku()} disabled={mikrofon === 'mjeri'}>
              {mikrofon === 'mjeri' ? (
                <>
                  <Loader2 className="size-4.5 animate-spin" aria-hidden /> Slušamo prostoriju…
                </>
              ) : (
                <>
                  <Mic className="size-4.5" aria-hidden /> Provjerite buku mikrofonom
                </>
              )}
            </Dugme>
            {mikrofon === 'tiho' && (
              <span className="inline-flex items-center gap-2 rounded-full bg-success-50 px-4 py-2 text-[14.5px] font-semibold text-success-700">
                <Check className="size-4" aria-hidden /> Prostorija je dovoljno tiha
              </span>
            )}
            {mikrofon === 'bucno' && (
              <span className="inline-flex items-center gap-2 rounded-full bg-warning-50 px-4 py-2 text-[14.5px] font-semibold text-warning-600">
                <AlertTriangle className="size-4" aria-hidden /> Čuje se buka — nađite tiše mjesto ako možete
              </span>
            )}
            {mikrofon === 'odbijeno' && (
              <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-[14.5px] font-semibold text-neutral-600">
                <MicOff className="size-4" aria-hidden /> Mikrofon nije dostupan — nastavite uz ručnu potvrdu
              </span>
            )}
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={tisinaPotvrdjena}
              onChange={(e) => setTisinaPotvrdjena(e.target.checked)}
              className="mt-1 size-5 shrink-0 cursor-pointer accent-brand-600"
            />
            <span className="text-neutral-700">Potvrđujem da sam u tihoj prostoriji.</span>
          </label>

          <div className="mt-7 flex flex-wrap items-center gap-3.5">
            <Dugme velicina="veliko" onClick={() => idi('upitnik')} disabled={!tisinaPotvrdjena}>
              Nastavite na upitnik <ChevronRight className="size-5" aria-hidden />
            </Dugme>
            <button
              type="button"
              onClick={() => idi('glasnoca')}
              className="inline-flex min-h-12 cursor-pointer items-center gap-1 rounded-full px-3 text-[15px] font-medium text-neutral-600 hover:text-neutral-900"
            >
              <ChevronLeft className="size-4" aria-hidden /> Nazad
            </button>
          </div>
        </div>
      )}

      {/* ——— 5. upitnik ——— */}
      {korak === 'upitnik' && (
        <div>
          <h2 ref={naslovRef} tabIndex={-1} className="text-h3 outline-none">
            Nekoliko kratkih pitanja
          </h2>
          <p className="mt-2 text-neutral-600">
            Vaši odgovori pomažu da rezultat tonova ispravno protumačimo.
          </p>
          <div className="mt-7 space-y-7">
            {OBAVEZNA.map((k) => radio(k))}

            <fieldset>
              <legend className="font-semibold text-neutral-800">
                Da li imate neki od sljedećih simptoma?
              </legend>
              <div className="mt-2.5 space-y-2">
                {ZASTAVICE.map((z) => {
                  const aktivan = zastavice.includes(z.id)
                  return (
                    <label
                      key={z.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-[14px] border p-3.5 transition-colors duration-150 ${
                        aktivan ? 'border-brand-400 bg-brand-50' : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={aktivan}
                        onChange={(e) => {
                          setNistaOdNavedenog(false)
                          setZastavice((p) => (e.target.checked ? [...p, z.id] : p.filter((x) => x !== z.id)))
                        }}
                        className="mt-0.5 size-5 shrink-0 cursor-pointer accent-brand-600"
                      />
                      <span className="text-[15.5px] text-neutral-800">{z.oznaka}</span>
                    </label>
                  )
                })}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-[14px] border p-3.5 transition-colors duration-150 ${
                    nistaOdNavedenog ? 'border-success-600/50 bg-success-50' : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={nistaOdNavedenog}
                    onChange={(e) => {
                      setNistaOdNavedenog(e.target.checked)
                      if (e.target.checked) setZastavice([])
                    }}
                    className="mt-0.5 size-5 shrink-0 cursor-pointer accent-brand-600"
                  />
                  <span className="text-[15.5px] font-semibold text-neutral-800">Ništa od navedenog</span>
                </label>
              </div>
            </fieldset>
          </div>

          {upitnikGreska && !upitnikPotpun && (
            <p role="alert" className="mt-5 rounded-[12px] bg-error-50 px-4 py-3 text-[15px] font-medium text-error-600">
              Molimo odgovorite na sva pitanja (uključujući simptome — ako ih nemate, označite
              „Ništa od navedenog").
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Dugme velicina="veliko" onClick={predajUpitnik}>
              Nastavite na slušanje <ChevronRight className="size-5" aria-hidden />
            </Dugme>
            <button
              type="button"
              onClick={() => idi('tisina')}
              className="inline-flex min-h-12 cursor-pointer items-center gap-1 rounded-full px-3 text-[15px] font-medium text-neutral-600 hover:text-neutral-900"
            >
              <ChevronLeft className="size-4" aria-hidden /> Nazad
            </button>
          </div>
        </div>
      )}

      {/* ——— 6. test tonova ——— */}
      {korak === 'test' && (
        <div>
          {brojTona === 0 ? (
            <div className="text-center">
              <h2 ref={naslovRef} tabIndex={-1} className="text-h3 outline-none">
                Spremni za slušanje?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-neutral-600">
                Čut ćete kratke isprekidane tonove — nekad tiše, nekad glasnije, prvo u{' '}
                <strong className="font-semibold text-neutral-800">desnom</strong>, pa u lijevom uhu. Pritisnite{' '}
                <strong className="font-semibold text-neutral-800">„Čujem"</strong> čim ton čujete, ili{' '}
                <strong className="font-semibold text-neutral-800">„Ne čujem"</strong> ako ga ne čujete.
              </p>
              <p className="text-small mt-3 text-neutral-500">
                Tastatura: <kbd className="rounded border border-neutral-300 bg-neutral-100 px-1.5 font-sans">1</kbd> = Čujem,{' '}
                <kbd className="rounded border border-neutral-300 bg-neutral-100 px-1.5 font-sans">2</kbd> = Ne čujem
              </p>
              <Dugme velicina="veliko" className="mt-7" onClick={() => void pocniTest()}>
                <Volume2 className="size-5" aria-hidden /> Počnite slušanje
              </Dugme>
            </div>
          ) : pauzaUha ? (
            <div className="text-center">
              <h2 ref={naslovRef} tabIndex={-1} className="text-h3 outline-none">
                Pola puta — odlično Vam ide!
              </h2>
              <p className="mx-auto mt-3 max-w-md text-neutral-600">
                Desno uho je gotovo. Sada na isti način testiramo <strong className="font-semibold text-neutral-800">lijevo uho</strong>.
              </p>
              <Dugme velicina="veliko" className="mt-7" onClick={nastaviDrugoUho}>
                Nastavite — lijevo uho <ChevronRight className="size-5" aria-hidden />
              </Dugme>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-[13px] font-bold tracking-[0.16em] text-neutral-500 uppercase">
                {trenutna.uho === 'desno' ? 'Desno uho' : 'Lijevo uho'} ·{' '}
                {trenutna.frekvencija >= 1000 ? `${trenutna.frekvencija / 1000} kHz` : `${trenutna.frekvencija} Hz`}
              </p>

              {/* vizuelni indikator tona */}
              <div
                className={`relative mx-auto mt-7 grid size-36 place-items-center rounded-full border-4 transition-colors duration-250 ${
                  svira ? 'border-brand-200 bg-brand-50' : 'border-neutral-200 bg-neutral-50'
                }`}
                aria-hidden
              >
                {svira && (
                  <span className="prsten-puls absolute inset-0 rounded-full border-2 border-brand-400" />
                )}
                <Ear
                  className={`size-14 transition-colors duration-250 ${svira ? 'text-brand-600' : 'text-neutral-300'} ${
                    trenutna.uho === 'lijevo' ? '-scale-x-100' : ''
                  }`}
                  strokeWidth={1.5}
                />
              </div>

              <h2 ref={naslovRef} tabIndex={-1} className="text-h3 mt-6 outline-none">
                Da li čujete ton?
              </h2>

              <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => odgovoriNaTon(true)}
                  className="flex min-h-16 cursor-pointer items-center justify-center gap-2.5 rounded-[20px] border-2 border-success-600/30 bg-success-50 text-[18px] font-bold text-success-700 shadow-sm transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-success-600/60 hover:shadow-md active:translate-y-0"
                >
                  <Check className="size-6" strokeWidth={2.5} aria-hidden />
                  Čujem
                </button>
                <button
                  type="button"
                  onClick={() => odgovoriNaTon(false)}
                  className="flex min-h-16 cursor-pointer items-center justify-center gap-2.5 rounded-[20px] border-2 border-neutral-300 bg-white text-[18px] font-bold text-neutral-700 shadow-sm transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-md active:translate-y-0"
                >
                  <X className="size-6" strokeWidth={2.5} aria-hidden />
                  Ne čujem
                </button>
              </div>

              <p className="text-small mt-5 text-neutral-500">
                Odgovorite i dok ton svira. Tastatura: 1 = Čujem · 2 = Ne čujem
              </p>
              <p className="text-small mt-1 text-neutral-400">
                Napredak: {Math.min(zavrsenihFrekvencija, REDOSLIJED.length)} od {REDOSLIJED.length} tonova završeno
              </p>
            </div>
          )}
        </div>
      )}

      {/* ——— 7. rezultat ——— */}
      {korak === 'rezultat' && rezultat && (
        <div>
          <h2 ref={naslovRef} tabIndex={-1} className="sr-only outline-none">
            Rezultat testa
          </h2>
          <RezultatPrikaz rezultat={rezultat} poslovnice={poslovnice} onPonovi={ponovi} />
        </div>
      )}
    </div>
  )
}
