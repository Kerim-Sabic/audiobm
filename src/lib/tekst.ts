/**
 * Sadržaj iz CMS-a može sadržavati interne uredničke napomene.
 * Na javnoj stranici se NIKAD ne prikazuju — polje se sakriva dok vlasnik ne unese
 * stvarni podatak.
 */

const UREDNICKA_OZNAKA = /\[[^\]]+\]/
const UREDNICKA_OZNAKA_GLOBAL = /\[[^\]]+\]/g

/** Vraća tekst samo ako je stvaran sadržaj; interna oznaka ili prazno → null. */
export function stvarno(tekst: string | null | undefined): string | null {
  if (!tekst) return null
  const t = tekst.trim()
  if (!t || UREDNICKA_OZNAKA.test(t)) return null
  return t
}

/**
 * Uklanja interne uredničke segmente iz rečenice i čisti zaostale crtice/zareze.
 * Ako ništa stvarno ne preostane, vraća null.
 */
export function ocisti(tekst: string | null | undefined): string | null {
  if (!tekst) return null
  const t = tekst
    .replace(UREDNICKA_OZNAKA_GLOBAL, '')
    .replace(/\s*[—–-]\s*$/, '')
    .replace(/\s*[,;:·]\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
  return t || null
}
