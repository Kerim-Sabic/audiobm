import type { CollectionConfig } from 'payload'
import { slugPolje } from '../fields/slugPolje'
import { seoPolje } from '../fields/seoPolje'
import { jeUrednik, javnoObjavljeno, poslovnicaUredjivanje } from '../access/uloge'
import { revalidirajKolekciju, revalidirajBrisanje } from '../hooks/revalidiraj'

const DANI = [
  { label: 'Ponedjeljak', value: 'ponedjeljak' },
  { label: 'Utorak', value: 'utorak' },
  { label: 'Srijeda', value: 'srijeda' },
  { label: 'Četvrtak', value: 'cetvrtak' },
  { label: 'Petak', value: 'petak' },
  { label: 'Subota', value: 'subota' },
  { label: 'Nedjelja', value: 'nedjelja' },
]

const vrijemeValidacija = (value: unknown) => {
  if (value == null || value === '') return true
  if (typeof value === 'string' && /^([01]?\d|2[0-3]):[0-5]\d$/.test(value)) return true
  return 'Unesite vrijeme u obliku ČČ:MM, npr. 08:00.'
}

export const Poslovnice: CollectionConfig = {
  slug: 'poslovnice',
  labels: { singular: 'Poslovnica', plural: 'Poslovnice' },
  admin: {
    useAsTitle: 'naziv',
    defaultColumns: ['naziv', 'grad', 'aktivna', 'novaPoslovnica'],
    group: 'Sadržaj',
    description: 'Lokacije Audio BM poslovnica — adrese, telefoni, radno vrijeme.',
    livePreview: { url: ({ data }) => `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/poslovnice/${data?.slug}` },
  },
  versions: { drafts: true },
  access: {
    read: javnoObjavljeno,
    create: jeUrednik,
    update: poslovnicaUredjivanje,
    delete: jeUrednik,
  },
  hooks: {
    afterChange: [revalidirajKolekciju((doc) => ['/', '/poslovnice', `/poslovnice/${doc.slug}`, '/kontakt', '/zakazivanje'])],
    afterDelete: [revalidirajBrisanje((doc) => ['/', '/poslovnice', `/poslovnice/${doc.slug}`])],
  },
  fields: [
    { name: 'naziv', label: 'Naziv', type: 'text', required: true },
    slugPolje('naziv'),
    { name: 'grad', label: 'Grad', type: 'text', required: true },
    { name: 'adresa', label: 'Adresa', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'geoSirina', label: 'Geo širina (lat)', type: 'number', admin: { width: '50%', description: 'npr. 44.7722' } },
        { name: 'geoDuzina', label: 'Geo dužina (lng)', type: 'number', admin: { width: '50%', description: 'npr. 17.1910' } },
      ],
    },
    {
      name: 'telefoni',
      label: 'Telefoni',
      type: 'array',
      minRows: 1,
      labels: { singular: 'Telefon', plural: 'Telefoni' },
      fields: [
        { name: 'oznaka', label: 'Oznaka', type: 'text', defaultValue: 'Telefon' },
        {
          name: 'broj',
          label: 'Broj telefona',
          type: 'text',
          required: true,
          validate: (value: unknown) => {
            if (typeof value === 'string' && /^[0-9+\s/-]{6,20}$/.test(value)) return true
            // dozvoljen vidljivi placeholder dok vlasnik ne dostavi stvarni broj
            if (typeof value === 'string' && /^\[.+\]$/.test(value)) return true
            return 'Unesite ispravan broj telefona, npr. 051 218 781.'
          },
        },
      ],
    },
    {
      name: 'emaili',
      label: 'E-mail adrese',
      type: 'array',
      fields: [{ name: 'email', label: 'E-mail', type: 'email', required: true }],
    },
    {
      type: 'row',
      fields: [
        { name: 'viber', label: 'Viber broj (međunarodni format, npr. +38751218781)', type: 'text', admin: { width: '50%' } },
        { name: 'whatsapp', label: 'WhatsApp broj (međunarodni format)', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      name: 'radnoVrijeme',
      label: 'Radno vrijeme',
      type: 'array',
      admin: {
        description:
          'Unesite radno vrijeme za svaki dan. Dok nije potvrđeno, na stranici se prikazuje napomena da se radno vrijeme provjeri telefonom.',
      },
      fields: [
        { name: 'dan', label: 'Dan', type: 'select', options: DANI, required: true },
        {
          type: 'row',
          fields: [
            { name: 'od', label: 'Otvaranje (ČČ:MM)', type: 'text', validate: vrijemeValidacija, admin: { width: '33%' } },
            { name: 'do', label: 'Zatvaranje (ČČ:MM)', type: 'text', validate: vrijemeValidacija, admin: { width: '33%' } },
            { name: 'zatvoreno', label: 'Zatvoreno', type: 'checkbox', defaultValue: false, admin: { width: '33%' } },
          ],
        },
      ],
    },
    {
      name: 'radnoVrijemePotvrdjeno',
      label: 'Radno vrijeme je potvrđeno i tačno',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Dok nije označeno, stranica prikazuje [RADNO_VRIJEME_PLACEHOLDER] napomenu.',
      },
    },
    {
      name: 'fotografije',
      label: 'Fotografije poslovnice',
      type: 'upload',
      relationTo: 'mediji',
      hasMany: true,
    },
    {
      name: 'opis',
      label: 'Kratki opis (prikazuje se na stranici poslovnice)',
      type: 'textarea',
    },
    {
      name: 'googleMapsLink',
      label: 'Google Maps link (Upute za dolazak)',
      type: 'text',
    },
    {
      name: 'novaPoslovnica',
      label: 'Nova poslovnica (oznaka „NOVO")',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'aktivna',
      label: 'Aktivna (prikazuje se na stranici)',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'redoslijed',
      label: 'Redoslijed prikaza (manji broj = prije)',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar' },
    },
    seoPolje,
  ],
}
