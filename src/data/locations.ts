import { cache } from 'react'
import { dajPoslovnice, dajPoslovnicu } from '@/lib/podaci'
import {
  brojGradova,
  brojPoslovnica,
  brojRijecju,
  naslovPoslovnica,
  opisGradova,
  standardizujBrojLokacija,
} from '@/lib/lokacije'

/**
 * Centralni facade za javne lokacije.
 *
 * Izvor istine ostaje Payload kolekcija `poslovnice`; javni template-i treba da
 * čitaju lokacije preko ovog modula kako broj, gradovi, sitemap, metadata,
 * schema i forme ne bi driftali jedni od drugih.
 */
export const dajLokacije = dajPoslovnice

export const dajLokaciju = dajPoslovnicu

export const dajLokacijeZaIzbor = cache(async () => {
  const lokacije = await dajLokacije()
  return lokacije.map((lokacija) => ({ id: lokacija.id as number, grad: lokacija.grad }))
})

export {
  brojGradova,
  brojPoslovnica,
  brojRijecju,
  naslovPoslovnica,
  opisGradova,
  standardizujBrojLokacija,
}
