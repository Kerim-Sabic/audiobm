/**
 * Mapiranje starog Shopify kataloga na novu informacijsku arhitekturu.
 * Koristi se u next.config.ts (301 preusmjeravanja), u seed skripti i na stranicama.
 */

export type ManifestImage = {
  remote: string
  local: string
  alt: string | null
  width: number
  height: number
}

export type ManifestProduct = {
  handle: string
  title: string
  vendor: string
  productType: string | null
  tags: string[]
  bodyHtml: string
  price: number | null
  compareAtPrice: number | null
  available: boolean | null
  collections: string[]
  createdAt: string
  images: ManifestImage[]
}

export type Kategorija =
  | 'slusni-aparati'
  | 'baterije'
  | 'cepovi-za-usi'
  | 'pribor-i-odrzavanje'
  | 'kucni-medicinski-aparati'
  | 'slusni-implanti'
  | 'profesionalna-oprema'

export const KATEGORIJE: Record<Kategorija, { naziv: string; opis: string }> = {
  'slusni-aparati': {
    naziv: 'Slušni aparati',
    opis: 'Savremeni slušni aparati renomiranih brendova — odabir uz besplatno savjetovanje.',
  },
  baterije: {
    naziv: 'Baterije za slušne aparate',
    opis: 'Varta power one baterije u svim veličinama (10, 13, 312, 675).',
  },
  'cepovi-za-usi': {
    naziv: 'Čepovi za uši',
    opis: 'Individualni čepovi po mjeri — za spavanje, plivanje, muzičare i zaštitu od buke.',
  },
  'pribor-i-odrzavanje': {
    naziv: 'Pribor i održavanje',
    opis: 'Filteri, pumpice i pribor za svakodnevno održavanje slušnih aparata.',
  },
  'kucni-medicinski-aparati': {
    naziv: 'Kućni medicinski aparati',
    opis: 'Antidekubitalni dušeci i pomagala za kućnu njegu.',
  },
  'slusni-implanti': {
    naziv: 'Slušni implanti',
    opis: 'Cochlear™ sistemi — informacije i upiti uz stručno savjetovanje.',
  },
  'profesionalna-oprema': {
    naziv: 'Profesionalna oprema',
    opis: 'Dijagnostička oprema za ordinacije i klinike — audiometri, kabine, timpanometri.',
  },
}

const PROFESIONALNI_VENDORI = ['gsi', 'Otometrics']

/** Određuje kategoriju proizvoda iz starog manifesta. */
export function kategorijaProizvoda(p: ManifestProduct): Kategorija {
  const cols = p.collections
  // VAŽNO: baterije prije aparata — stara stranica je Varta baterije
  // pogrešno držala i u kolekciji „slusni-aparati"
  if (cols.includes('baterije-za-slusne-aparate') || p.vendor === 'Varta') return 'baterije'
  if (cols.some((c) => c.startsWith('slusni-aparati'))) return 'slusni-aparati'
  if (cols.includes('cepovi-za-usi')) return 'cepovi-za-usi'
  if (cols.includes('pribor-za-slusne-aparate')) return 'pribor-i-odrzavanje'
  if (cols.includes('antidekubit-duseci') || cols.includes('kucni-medicinski-aparati'))
    return 'kucni-medicinski-aparati'
  if (p.vendor === 'Cochlear') return 'slusni-implanti'
  if (PROFESIONALNI_VENDORI.includes(p.vendor)) return 'profesionalna-oprema'
  // Dreve (otoplastika materijal) i ostalo
  return 'pribor-i-odrzavanje'
}

/** Konsultacijski proizvodi nemaju cijenu ni korpu — samo upit/savjetovanje. */
export function nacinProdaje(p: ManifestProduct): 'konsultacija' | 'maloprodaja' {
  const k = kategorijaProizvoda(p)
  if (k === 'slusni-aparati' || k === 'slusni-implanti' || k === 'profesionalna-oprema')
    return 'konsultacija'
  return 'maloprodaja'
}

/**
 * Stara stranica ima oštećene cijene (npr. čepovi „3600,00 KM" = 36,00 KM bez
 * decimalnog zareza). Cijene ≥ 1000 KM na potrošnom materijalu su neispravne —
 * vraćamo null i označavamo [CIJENA_PLACEHOLDER] za potvrdu vlasnika.
 */
export function pouzdanaCijena(p: ManifestProduct): number | null {
  if (p.price == null || p.price === 0) return null
  const k = kategorijaProizvoda(p)
  const potrosni = k === 'baterije' || k === 'cepovi-za-usi' || k === 'pribor-i-odrzavanje'
  if (potrosni && p.price >= 1000) return null
  if (nacinProdaje(p) === 'konsultacija') return null
  return p.price
}

/** Nova putanja proizvoda (za 301 preusmjeravanja i linkove). */
export function putanjaProizvoda(p: ManifestProduct): string {
  if (kategorijaProizvoda(p) === 'slusni-aparati') return `/slusni-aparati/modeli/${p.handle}`
  return `/proizvodi/${p.handle}`
}

/** Tip slušnog aparata iz naslova/sadržaja (kanalni / zaušni / zaušni za teža oštećenja). */
export function tipAparata(p: ManifestProduct): 'kanalni' | 'zausni' | 'zausni-snazni' | null {
  if (kategorijaProizvoda(p) !== 'slusni-aparati') return null
  const t = (p.title + ' ' + p.bodyHtml).toLowerCase()
  if (/\b(ite|cic|iic|kanalni|nevidljiv|bubice)\b/.test(t)) return 'kanalni'
  if (/\b(sp|up|power|snažn|teža|teska|teška)\b/.test(t)) return 'zausni-snazni'
  return 'zausni'
}

export const TIPOVI_APARATA = {
  kanalni: {
    naziv: 'Kanalni slušni aparati',
    kratko: 'Gotovo nevidljivi — sva elektronika u ušnom umetku, po mjeri.',
  },
  zausni: {
    naziv: 'Zaušni slušni aparati',
    kratko: 'Tanki i elegantni, skriveni iza uha, uz Bluetooth povezivanje.',
  },
  'zausni-snazni': {
    naziv: 'Zaušni aparati za teža oštećenja',
    kratko: 'Snažniji zvuk i bolje razumijevanje govora kod težih gubitaka sluha.',
  },
} as const
