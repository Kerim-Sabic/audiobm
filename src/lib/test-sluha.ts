/**
 * Online test sluha — zajednička logika (klijent + server).
 *
 * VAŽNO (medicinska iskrenost): test u pregledniku ne može biti klinički
 * kalibrisan kao audiometar. Zato NIKAD ne prikazujemo „dB HL" niti dijagnozu —
 * samo RELATIVNE pragove (interna skala 0–60) i informativne kategorije rizika,
 * uz stalnu preporuku profesionalne provjere sluha.
 */

export const FREKVENCIJE = [500, 1000, 2000, 4000, 6000] as const
export type Frekvencija = (typeof FREKVENCIJE)[number]

export type Uho = 'lijevo' | 'desno'

/** Interna skala prezentacije: dBFS atenuacija. Plafon čuva sluh korisnika. */
export const DBFS_POD = -75
export const DBFS_PLAFON = -15
export const DBFS_REFERENTNI = -45 // kalibracioni ton (korisnik namjesti glasnoću uređaja)
export const DBFS_START = -40 // početni nivo pretrage praga

/** dBFS → relativna skala 0–60 (0 = najtiši, 60 = najglasniji dozvoljeni). */
export const uRelativnu = (dbfs: number) => Math.round(dbfs - DBFS_POD)
export const REL_REFERENTNI = uRelativnu(DBFS_REFERENTNI) // 30

export type KategorijaTesta = 'bez-znakova' | 'moguca' | 'preporuka' | 'hitno'
export type PouzdanostNivo = 'visoka' | 'srednja' | 'niska'

export const KATEGORIJE_TESTA: Record<KategorijaTesta, { naslov: string; opis: string }> = {
  'bez-znakova': {
    naslov: 'Nema jasnih znakova poteškoće u ovom online screeningu',
    opis: 'U ovom informativnom screeningu nismo uočili jasne znakove poteškoće sa sluhom. Ako ipak primjećujete probleme u svakodnevnim situacijama, vjerujte svom osjećaju — besplatna profesionalna provjera daje pouzdan odgovor.',
  },
  moguca: {
    naslov: 'Moguća poteškoća sa sluhom',
    opis: 'Neki odgovori i reakcije na tonove ukazuju na moguću poteškoću sa sluhom. To ne mora značiti ništa ozbiljno — ali vrijedi provjeriti. Profesionalna provjera sluha kod nas je besplatna, bezbolna i traje oko pola sata.',
  },
  preporuka: {
    naslov: 'Preporučujemo profesionalnu provjeru sluha',
    opis: 'Rezultati screeninga ukazuju na vjerovatnu poteškoću sa sluhom na jednom ili oba uha. Preporučujemo da što prije obavite besplatnu profesionalnu provjeru — što se ranije reaguje, rezultati su bolji.',
  },
  hitno: {
    naslov: 'Potrebna brza konsultacija',
    opis: 'Naveli ste simptome koji zahtijevaju brzu medicinsku procjenu (npr. iznenadni gubitak sluha, bol, iscjedak ili jaka vrtoglavica). Molimo Vas da se što prije javite ljekaru ili ORL specijalisti — kod iznenadnog gubitka sluha vrijeme je veoma važno.',
  },
}

export const POUZDANOST_OZNAKE: Record<PouzdanostNivo, string> = {
  visoka: 'Visoka pouzdanost screeninga',
  srednja: 'Srednja pouzdanost screeninga',
  niska: 'Niska pouzdanost screeninga',
}

/** Crvene zastavice — simptomi koji traže brzu ljekarsku procjenu. */
export const ZASTAVICE = [
  { id: 'iznenadni-gubitak', oznaka: 'Iznenadni gubitak ili naglo pogoršanje sluha (u zadnjih 72 sata)' },
  { id: 'bol', oznaka: 'Bol u uhu' },
  { id: 'iscjedak', oznaka: 'Iscjedak iz uha' },
  { id: 'vrtoglavica', oznaka: 'Jaka vrtoglavica ili gubitak ravnoteže' },
  { id: 'jednostrano-naglo', oznaka: 'Nagla promjena samo na jednom uhu' },
] as const
export type ZastavicaId = (typeof ZASTAVICE)[number]['id']

/** Upitnik — pitanja i ponuđeni odgovori. */
export const UPITNIK = {
  dob: {
    pitanje: 'Koliko imate godina?',
    odgovori: [
      { v: 'do-39', o: 'do 39' },
      { v: '40-59', o: '40–59' },
      { v: '60-69', o: '60–69' },
      { v: '70-plus', o: '70 i više' },
    ],
  },
  govorUBuci: {
    pitanje: 'Da li Vam je teško pratiti razgovor u bučnom okruženju (kafana, porodični ručak, ulica)?',
    odgovori: [
      { v: 'ne', o: 'Ne' },
      { v: 'ponekad', o: 'Ponekad' },
      { v: 'cesto', o: 'Često' },
    ],
  },
  tv: {
    pitanje: 'Da li ukućani kažu da je televizor preglasan kad ga Vi podesite?',
    odgovori: [
      { v: 'ne', o: 'Ne' },
      { v: 'ponekad', o: 'Ponekad' },
      { v: 'cesto', o: 'Često' },
    ],
  },
  telefon: {
    pitanje: 'Da li Vam je teško razumjeti sagovornika preko telefona?',
    odgovori: [
      { v: 'ne', o: 'Ne' },
      { v: 'ponekad', o: 'Ponekad' },
      { v: 'cesto', o: 'Često' },
    ],
  },
  tinitus: {
    pitanje: 'Čujete li zujanje, šum ili zvonjenje u ušima (tinitus)?',
    odgovori: [
      { v: 'ne', o: 'Ne' },
      { v: 'ponekad', o: 'Ponekad' },
      { v: 'cesto', o: 'Često ili stalno' },
    ],
  },
  jednoUho: {
    pitanje: 'Čujete li na jedno uho primjetno slabije nego na drugo?',
    odgovori: [
      { v: 'ne', o: 'Ne' },
      { v: 'da', o: 'Da' },
    ],
  },
  buka: {
    pitanje: 'Da li ste duže vrijeme bili izloženi jakoj buci (posao, mašine, muzika)?',
    odgovori: [
      { v: 'ne', o: 'Ne' },
      { v: 'da', o: 'Da' },
    ],
  },
  aparati: {
    pitanje: 'Da li već koristite slušne aparate?',
    odgovori: [
      { v: 'ne', o: 'Ne' },
      { v: 'da', o: 'Da' },
    ],
  },
} as const
export type UpitnikKljuc = keyof typeof UPITNIK
export type UpitnikOdgovori = Partial<Record<UpitnikKljuc, string>>

/** Strukturirani rezultat koji se sprema u CMS (bez ličnih podataka). */
export type RezultatTesta = {
  kategorija: KategorijaTesta
  pouzdanost: number
  pouzdanostNivo: PouzdanostNivo
  /** relativni pragovi 0–60 po uhu i frekvenciji; null = nije čuo ni najglasniji ton */
  pragovi: Record<Uho, Record<string, number | null>>
  upitnik: UpitnikOdgovori
  zastavice: string[]
  laznePotvrde: number
  nedosljedneFrekvencije: number
  mikrofonProvjera: 'tiho' | 'bucno' | 'preskoceno'
  trajanjeSekundi: number
}

const bodoviLikert = (v?: string) => (v === 'cesto' ? 2 : v === 'ponekad' ? 1 : 0)

/** Zbirni skor upitnika (0–10). */
export function skorUpitnika(u: UpitnikOdgovori): number {
  return (
    bodoviLikert(u.govorUBuci) +
    bodoviLikert(u.tv) +
    bodoviLikert(u.telefon) +
    bodoviLikert(u.tinitus) +
    (u.jednoUho === 'da' ? 1 : 0) +
    (u.buka === 'da' ? 1 : 0)
  )
}

/** Prosjek govornih frekvencija (1k/2k/4k) za jedno uho; null pragovi = 65. */
function prosjekUha(pragovi: Record<string, number | null>): number {
  const govorne = [1000, 2000, 4000].map((f) => pragovi[String(f)] ?? null)
  const vrijednosti = govorne.map((p) => (p === null ? 65 : p))
  return vrijednosti.reduce((a, b) => a + b, 0) / vrijednosti.length
}

/** Kategorija rezultata iz pragova + upitnika + zastavica. */
export function ocijeniKategoriju({
  pragovi,
  upitnik,
  zastavice,
}: Pick<RezultatTesta, 'pragovi' | 'upitnik' | 'zastavice'>): KategorijaTesta {
  if (zastavice.length > 0) return 'hitno'

  const desno = prosjekUha(pragovi.desno)
  const lijevo = prosjekUha(pragovi.lijevo)
  const bolje = Math.min(desno, lijevo)
  const asimetrija = Math.abs(desno - lijevo)
  const neCuje = [...Object.values(pragovi.desno), ...Object.values(pragovi.lijevo)].filter(
    (p) => p === null,
  ).length
  const skor = skorUpitnika(upitnik)

  // pragovi su relativni: REL_REFERENTNI (30) = nivo kalibracionog tona
  if (bolje > REL_REFERENTNI + 15 || neCuje >= 2) return 'preporuka'
  if (bolje > REL_REFERENTNI + 6 || asimetrija > 15 || neCuje === 1 || skor >= 5) return 'moguca'
  if (skor >= 3) return 'moguca'
  return 'bez-znakova'
}

/** Skor pouzdanosti 0–100 iz kontrolnih (catch) pokušaja, dosljednosti i postavki. */
export function ocijeniPouzdanost({
  laznePotvrde,
  nedosljedneFrekvencije,
  mikrofonProvjera,
  sveNull,
}: {
  laznePotvrde: number
  nedosljedneFrekvencije: number
  mikrofonProvjera: RezultatTesta['mikrofonProvjera']
  sveNull: boolean
}): { pouzdanost: number; nivo: PouzdanostNivo } {
  let p = 100
  p -= Math.min(laznePotvrde, 2) * 20
  p -= nedosljedneFrekvencije >= 2 ? 15 : 0
  p -= mikrofonProvjera === 'preskoceno' ? 5 : mikrofonProvjera === 'bucno' ? 15 : 0
  // ako „ne čuje" baš ništa ni na maksimumu — najvjerovatnije slušalice nisu u redu
  p -= sveNull ? 25 : 0
  p = Math.max(15, Math.min(100, p))
  return { pouzdanost: p, nivo: p >= 80 ? 'visoka' : p >= 50 ? 'srednja' : 'niska' }
}

/**
 * Stroga validacija rezultata na serveru — prihvata samo očekivanu strukturu
 * (zaštita od proizvoljnog JSON-a u CMS-u).
 */
export function provjeriRezultatTesta(ulaz: unknown): RezultatTesta | null {
  if (!ulaz || typeof ulaz !== 'object') return null
  const r = ulaz as Record<string, unknown>

  const kategorije: KategorijaTesta[] = ['bez-znakova', 'moguca', 'preporuka', 'hitno']
  if (!kategorije.includes(r.kategorija as KategorijaTesta)) return null

  const pouzdanost = Number(r.pouzdanost)
  if (!Number.isFinite(pouzdanost) || pouzdanost < 0 || pouzdanost > 100) return null
  const nivoi: PouzdanostNivo[] = ['visoka', 'srednja', 'niska']
  if (!nivoi.includes(r.pouzdanostNivo as PouzdanostNivo)) return null

  const citajPragove = (u: unknown): Record<string, number | null> | null => {
    if (!u || typeof u !== 'object') return null
    const izlaz: Record<string, number | null> = {}
    for (const f of FREKVENCIJE) {
      const v = (u as Record<string, unknown>)[String(f)]
      if (v === null) izlaz[String(f)] = null
      else if (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 60)
        izlaz[String(f)] = Math.round(v)
      else return null
    }
    return izlaz
  }
  const pragoviRaw = r.pragovi as Record<string, unknown> | undefined
  const desno = citajPragove(pragoviRaw?.desno)
  const lijevo = citajPragove(pragoviRaw?.lijevo)
  if (!desno || !lijevo) return null

  const upitnik: UpitnikOdgovori = {}
  if (r.upitnik && typeof r.upitnik === 'object') {
    for (const kljuc of Object.keys(UPITNIK) as UpitnikKljuc[]) {
      const v = (r.upitnik as Record<string, unknown>)[kljuc]
      if (typeof v === 'string' && UPITNIK[kljuc].odgovori.some((o) => o.v === v)) upitnik[kljuc] = v
    }
  }

  const dozvoljeneZastavice = ZASTAVICE.map((z) => z.id as string)
  const zastavice = Array.isArray(r.zastavice)
    ? r.zastavice.filter((z): z is string => typeof z === 'string' && dozvoljeneZastavice.includes(z)).slice(0, 5)
    : []

  const mikrofoni = ['tiho', 'bucno', 'preskoceno'] as const
  const mikrofonProvjera = mikrofoni.includes(r.mikrofonProvjera as (typeof mikrofoni)[number])
    ? (r.mikrofonProvjera as RezultatTesta['mikrofonProvjera'])
    : 'preskoceno'

  return {
    kategorija: r.kategorija as KategorijaTesta,
    pouzdanost: Math.round(pouzdanost),
    pouzdanostNivo: r.pouzdanostNivo as PouzdanostNivo,
    pragovi: { desno, lijevo },
    upitnik,
    zastavice,
    laznePotvrde: Math.max(0, Math.min(10, Number(r.laznePotvrde) || 0)),
    nedosljedneFrekvencije: Math.max(0, Math.min(10, Number(r.nedosljedneFrekvencije) || 0)),
    mikrofonProvjera,
    trajanjeSekundi: Math.max(0, Math.min(3600, Math.round(Number(r.trajanjeSekundi) || 0))),
  }
}

/** Čitljiv sažetak rezultata za polje „poruka" i e-mail. */
export function sazmiRezultat(r: RezultatTesta): string {
  const prag = (p: number | null) => (p === null ? '×' : String(p))
  const linija = (uho: Uho) =>
    FREKVENCIJE.map((f) => `${f >= 1000 ? f / 1000 + 'k' : f}:${prag(r.pragovi[uho][String(f)])}`).join(' ')
  const redovi = [
    `Rezultat online screeninga: ${KATEGORIJE_TESTA[r.kategorija].naslov}`,
    `Pouzdanost: ${r.pouzdanost}/100 (${r.pouzdanostNivo})`,
    `Relativni pragovi (0–60, niže je bolje; × = ne čuje najglasniji ton):`,
    `  Desno:  ${linija('desno')}`,
    `  Lijevo: ${linija('lijevo')}`,
    r.zastavice.length
      ? `CRVENE ZASTAVICE: ${r.zastavice
          .map((z) => ZASTAVICE.find((x) => x.id === z)?.oznaka ?? z)
          .join('; ')}`
      : '',
    `Upitnik: ${(Object.keys(r.upitnik) as UpitnikKljuc[])
      .map((k) => `${k}=${r.upitnik[k]}`)
      .join(', ')}`,
    `Napomena: informativni screening — nije medicinska dijagnoza.`,
  ]
  return redovi.filter(Boolean).join('\n')
}
