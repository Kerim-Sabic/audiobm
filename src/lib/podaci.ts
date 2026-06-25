import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import { ocisti } from '@/lib/tekst'

/** Lokalni Payload API — bez klijentskog dohvata sadržaja (SSG/ISR). */
export const dajPayload = cache(async () => getPayload({ config }))

export const dajPodesavanja = cache(async () => {
  const payload = await dajPayload()
  return payload.findGlobal({ slug: 'podesavanja' })
})

export const dajNavigaciju = cache(async () => {
  const payload = await dajPayload()
  return payload.findGlobal({ slug: 'navigacija' })
})

export const dajPocetnu = cache(async () => {
  const payload = await dajPayload()
  return payload.findGlobal({ slug: 'pocetna' })
})

export const dajPoslovnice = cache(async () => {
  const payload = await dajPayload()
  const { docs } = await payload.find({
    collection: 'poslovnice',
    where: { aktivna: { equals: true } },
    sort: 'redoslijed',
    limit: 20,
    depth: 1,
    draft: false,
  })
  return docs
})

export const dajPoslovnicu = cache(async (slug: string) => {
  const payload = await dajPayload()
  const { docs } = await payload.find({
    collection: 'poslovnice',
    where: { and: [{ slug: { equals: slug } }, { aktivna: { equals: true } }] },
    limit: 1,
    depth: 2,
    draft: false,
  })
  return docs[0] ?? null
})

export const dajUsluge = cache(async () => {
  const payload = await dajPayload()
  const { docs } = await payload.find({
    collection: 'usluge',
    where: { aktivna: { equals: true } },
    sort: 'redoslijed',
    limit: 20,
    depth: 1,
    draft: false,
  })
  return docs
})

export const dajAktivneAkcije = cache(async () => {
  const payload = await dajPayload()
  const danas = new Date().toISOString()
  const { docs } = await payload.find({
    collection: 'akcije',
    where: {
      and: [{ vrijediOd: { less_than_equal: danas } }, { vrijediDo: { greater_than_equal: danas } }],
    },
    sort: '-vrijediOd',
    limit: 20,
    depth: 1,
    draft: false,
  })
  return docs
})

export const dajRecenzije = cache(async (samoIstaknute = false) => {
  const payload = await dajPayload()
  const { docs } = await payload.find({
    collection: 'recenzije',
    where: samoIstaknute
      ? { and: [{ odobreno: { equals: true } }, { istaknuta: { equals: true } }] }
      : { odobreno: { equals: true } },
    limit: 12,
    depth: 1,
  })
  return docs
})

/** Agregatna ocjena iz odobrenih recenzija (globalno ili za jednu poslovnicu) — za AggregateRating schemu. */
export const dajOcjenu = cache(async (poslovnicaId?: number) => {
  const payload = await dajPayload()
  const where: Where = poslovnicaId
    ? { and: [{ odobreno: { equals: true } }, { poslovnica: { equals: poslovnicaId } }] }
    : { odobreno: { equals: true } }
  const { docs } = await payload.find({ collection: 'recenzije', where, limit: 500, depth: 0 })
  if (docs.length === 0) return { broj: 0, prosjek: 0 }
  const zbir = docs.reduce((s, r) => s + (typeof r.ocjena === 'number' ? r.ocjena : 5), 0)
  return { broj: docs.length, prosjek: zbir / docs.length }
})

export const dajPitanja = cache(async () => {
  const payload = await dajPayload()
  const { docs } = await payload.find({
    collection: 'cesta-pitanja',
    where: { aktivno: { equals: true } },
    sort: '_order',
    limit: 100,
  })
  // uredničke oznake ([CIJENA_PLACEHOLDER] i sl.) se nikad ne prikazuju javno
  return docs.map((d) => ({
    ...d,
    pitanje: ocisti(d.pitanje) ?? d.pitanje,
    odgovor: ocisti(d.odgovor) ?? d.odgovor,
  }))
})
