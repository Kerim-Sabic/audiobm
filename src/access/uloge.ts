import type { Access } from 'payload'

export type Uloga = 'vlasnik' | 'urednik' | 'poslovnica'

const uloga = (req: { user?: { uloga?: Uloga | null } | null }): Uloga | null =>
  (req.user?.uloga as Uloga) ?? null

/** Samo vlasnik. */
export const jeVlasnik: Access = ({ req }) => uloga(req) === 'vlasnik'

/** Vlasnik ili urednik (upravljanje sadržajem). */
export const jeUrednik: Access = ({ req }) => {
  const u = uloga(req)
  return u === 'vlasnik' || u === 'urednik'
}

/** Bilo koji prijavljeni korisnik administracije. */
export const jePrijavljen: Access = ({ req }) => Boolean(req.user)

/** Javno čitanje — ali samo objavljeni dokumenti za neprijavljene posjetioce. */
export const javnoObjavljeno: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}

/** Javno čitanje bez nacrta (kolekcije bez drafts opcije). */
export const javno: Access = () => true

/**
 * Upiti: vlasnik i urednik vide sve; korisnik poslovnice samo upite svoje poslovnice.
 */
export const upitiPristup: Access = ({ req }) => {
  const u = uloga(req)
  if (u === 'vlasnik' || u === 'urednik') return true
  if (u === 'poslovnica' && req.user?.poslovnica) {
    const id = typeof req.user.poslovnica === 'object' ? req.user.poslovnica.id : req.user.poslovnica
    return { poslovnica: { equals: id } }
  }
  return false
}

/**
 * Poslovnice: korisnik poslovnice smije uređivati samo vlastitu poslovnicu
 * (promjena telefona, radnog vremena…).
 */
export const poslovnicaUredjivanje: Access = ({ req }) => {
  const u = uloga(req)
  if (u === 'vlasnik' || u === 'urednik') return true
  if (u === 'poslovnica' && req.user?.poslovnica) {
    const id = typeof req.user.poslovnica === 'object' ? req.user.poslovnica.id : req.user.poslovnica
    return { id: { equals: id } }
  }
  return false
}
