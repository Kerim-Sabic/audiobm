import type { CollectionConfig } from 'payload'
import { slugPolje } from '../fields/slugPolje'
import { seoPolje } from '../fields/seoPolje'
import { jeUrednik, javnoObjavljeno } from '../access/uloge'
import { revalidirajKolekciju, revalidirajBrisanje } from '../hooks/revalidiraj'

export const Objave: CollectionConfig = {
  slug: 'objave',
  labels: { singular: 'Objava', plural: 'Objave (blog)' },
  admin: {
    useAsTitle: 'naslov',
    defaultColumns: ['naslov', 'kategorija', 'datumObjave', '_status'],
    group: 'Sadržaj',
    description: 'Savjeti i novosti. Nacrt nije vidljiv na stranici dok se ne objavi.',
  },
  versions: {
    drafts: {
      schedulePublish: true,
    },
  },
  access: {
    read: javnoObjavljeno,
    create: jeUrednik,
    update: jeUrednik,
    delete: jeUrednik,
  },
  hooks: {
    afterChange: [revalidirajKolekciju((doc) => ['/savjeti', `/savjeti/${doc.slug}`])],
    afterDelete: [revalidirajBrisanje(() => ['/savjeti'])],
  },
  fields: [
    { name: 'naslov', label: 'Naslov', type: 'text', required: true },
    slugPolje('naslov'),
    {
      name: 'kategorija',
      label: 'Kategorija',
      type: 'select',
      required: true,
      defaultValue: 'savjeti',
      options: [
        { label: 'Savjeti', value: 'savjeti' },
        { label: 'Novosti', value: 'novosti' },
        { label: 'Sarajevo', value: 'sarajevo' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'datumObjave',
      label: 'Datum objave',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy.' } },
    },
    { name: 'izvod', label: 'Izvod (sažetak za liste, do 220 znakova)', type: 'textarea', maxLength: 220, required: true },
    { name: 'naslovnaSlika', label: 'Naslovna slika', type: 'upload', relationTo: 'mediji' },
    { name: 'sadrzaj', label: 'Sadržaj', type: 'richText', required: true },
    { name: 'autor', label: 'Autor (član tima)', type: 'relationship', relationTo: 'tim' },
    seoPolje,
  ],
}
