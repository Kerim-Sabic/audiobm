/**
 * Sadržaj iz CMS-a može sadržavati uredničke oznake poput „[ADRESA_PLACEHOLDER]".
 * Na javnoj stranici se NIKAD ne prikazuju — polje se sakriva dok vlasnik ne unese
 * stvarni podatak.
 */

const PLACEHOLDER = /\[[A-ZČĆĐŠŽ0-9_]+\]/

/** Vraća tekst samo ako je stvaran sadržaj; placeholder ili prazno → null. */
export function stvarno(tekst: string | null | undefined): string | null {
  if (!tekst) return null
  const t = tekst.trim()
  if (!t || PLACEHOLDER.test(t)) return null
  return t
}

/**
 * Uklanja placeholder segmente iz rečenice i čisti zaostale crtice/zareze,
 * npr. „Otvorili smo poslovnicu — [ADRESA_PLACEHOLDER]" → „Otvorili smo poslovnicu".
 * Ako ništa stvarno ne preostane, vraća null.
 */
export function ocisti(tekst: string | null | undefined): string | null {
  if (!tekst) return null
  const t = tekst
    .replace(PLACEHOLDER, '')
    .replace(/\s*[—–-]\s*$/, '')
    .replace(/\s*[,;:·]\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
  return t || null
}
