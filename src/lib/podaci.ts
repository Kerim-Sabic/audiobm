import { getPayload } from 'payload'
import config from '@payload-config'
import { cache } from 'react'

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

export const dajPitanja = cache(async () => {
  const payload = await dajPayload()
  const { docs } = await payload.find({
    collection: 'cesta-pitanja',
    where: { aktivno: { equals: true } },
    sort: '_order',
    limit: 100,
  })
  return docs
})
