import type { CollectionConfig } from 'payload'
import { slugPolje } from '../fields/slugPolje'
import { seoPolje } from '../fields/seoPolje'
import { jeUrednik, javnoObjavljeno } from '../access/uloge'
import { revalidirajKolekciju, revalidirajBrisanje } from '../hooks/revalidiraj'

export const Usluge: CollectionConfig = {
  slug: 'usluge',
  labels: { singular: 'Usluga', plural: 'Usluge' },
  admin: {
    useAsTitle: 'naziv',
    defaultColumns: ['naziv', 'slug', 'aktivna'],
    group: 'Sadržaj',
    description: 'Usluge — besplatna provjera sluha, prilagođavanje i servis, kohlearni implanti…',
  },
  versions: { drafts: true },
  access: {
    read: javnoObjavljeno,
    create: jeUrednik,
    update: jeUrednik,
    delete: jeUrednik,
  },
  hooks: {
    afterChange: [revalidirajKolekciju((doc) => ['/usluge', `/usluge/${doc.slug}`, '/'])],
    afterDelete: [revalidirajBrisanje(() => ['/usluge'])],
  },
  fields: [
    { name: 'naziv', label: 'Naziv usluge', type: 'text', required: true },
    slugPolje('naziv'),
    { name: 'kratkiOpis', label: 'Kratki opis (za kartice)', type: 'textarea', maxLength: 220, required: true },
    {
      name: 'ikona',
      label: 'Ikona',
      type: 'select',
      defaultValue: 'ear',
      options: [
        { label: 'Uho (provjera sluha)', value: 'ear' },
        { label: 'Podešavanje (servis)', value: 'settings' },
        { label: 'Medicina (implanti)', value: 'stethoscope' },
        { label: 'Razgovor (savjetovanje)', value: 'chat' },
        { label: 'Zaštita (čepovi)', value: 'shield' },
      ],
    },
    {
      name: 'koraci',
      label: 'Koraci (kako izgleda usluga, korak po korak)',
      type: 'array',
      fields: [
        { name: 'naslov', label: 'Naslov koraka', type: 'text', required: true },
        { name: 'opis', label: 'Opis koraka', type: 'textarea', required: true },
      ],
    },
    { name: 'trajanje', label: 'Trajanje (npr. „30–45 minuta")', type: 'text' },
    { name: 'zaKoga', label: 'Za koga je usluga', type: 'textarea' },
    { name: 'sadrzaj', label: 'Dodatni sadržaj', type: 'richText' },
    { name: 'slika', label: 'Slika', type: 'upload', relationTo: 'mediji' },
    { name: 'redoslijed', label: 'Redoslijed prikaza', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    { name: 'aktivna', label: 'Prikazuje se na stranici', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    seoPolje,
  ],
}
