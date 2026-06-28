/** Validacija obrazaca — sve poruke na bosanskom (ijekavica). */

export type GreskeObrasca = Partial<Record<string, string>>

export function provjeriIme(ime: unknown): string | null {
  if (typeof ime !== 'string' || ime.trim().length < 2) {
    return 'Molimo unesite Vaše ime i prezime.'
  }
  if (ime.trim().length > 100) return 'Ime je predugačko.'
  return null
}

export function provjeriTelefon(telefon: unknown): string | null {
  if (typeof telefon !== 'string' || telefon.trim().length === 0) {
    return 'Molimo unesite broj telefona kako bismo Vas mogli pozvati.'
  }
  const cifre = telefon.replace(/\D/g, '')
  if (cifre.length < 6 || cifre.length > 15 || !/^[0-9+\s/()-]+$/.test(telefon.trim())) {
    return 'Broj telefona nije ispravan. Primjer: 051 218 781 ili 065 123 456.'
  }
  return null
}

export function provjeriEmail(email: unknown): string | null {
  if (email == null || email === '') return null // e-mail je neobavezan
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
    return 'E-mail adresa nije ispravna.'
  }
  return null
}

export function provjeriPoruku(poruka: unknown, obavezna = false): string | null {
  if (poruka == null || poruka === '') {
    return obavezna ? 'Molimo upišite Vašu poruku.' : null
  }
  if (typeof poruka !== 'string' || poruka.length > 2000) {
    return 'Poruka je predugačka (najviše 2000 znakova).'
  }
  return null
}

export function provjeriSaglasnost(saglasnost: unknown): string | null {
  if (saglasnost !== 'on' && saglasnost !== true && saglasnost !== 'true') {
    return 'Molimo potvrdite saglasnost sa politikom privatnosti.'
  }
  return null
}
