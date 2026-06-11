import type { CollectionConfig } from 'payload'
import { slugPolje } from '../fields/slugPolje'
import { seoPolje } from '../fields/seoPolje'
import { jeUrednik, javnoObjavljeno } from '../access/uloge'
import { revalidirajKolekciju, revalidirajBrisanje } from '../hooks/revalidiraj'

export const Akcije: CollectionConfig = {
  slug: 'akcije',
  labels: { singular: 'Akcija', plural: 'Akcije' },
  admin: {
    useAsTitle: 'naslov',
    defaultColumns: ['naslov', 'vrijediOd', 'vrijediDo', 'istaknutaNaPocetnoj'],
    group: 'Sadržaj',
    description:
      'Promocije i popusti. Akcija se automatski sklanja sa stranice nakon datuma isteka.',
  },
  versions: { drafts: true },
  access: {
    read: javnoObjavljeno,
    create: jeUrednik,
    update: jeUrednik,
    delete: jeUrednik,
  },
  hooks: {
    afterChange: [revalidirajKolekciju((doc) => ['/akcije', `/akcije/${doc.slug}`, '/'])],
    afterDelete: [revalidirajBrisanje(() => ['/akcije', '/'])],
  },
  fields: [
    { name: 'naslov', label: 'Naslov akcije', type: 'text', required: true },
    slugPolje('naslov'),
    { name: 'kratkiOpis', label: 'Kratki opis (za baner i kartice)', type: 'textarea', maxLength: 220, required: true },
    { name: 'sadrzaj', label: 'Detalji akcije', type: 'richText' },
    { name: 'slika', label: 'Slika akcije', type: 'upload', relationTo: 'mediji' },
    {
      type: 'row',
      fields: [
        {
          name: 'vrijediOd',
          label: 'Vrijedi od',
          type: 'date',
          required: true,
          admin: { width: '50%', date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy.' } },
        },
        {
          name: 'vrijediDo',
          label: 'Vrijedi do (uključivo)',
          type: 'date',
          required: true,
          admin: { width: '50%', date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy.' } },
        },
      ],
    },
    {
      name: 'proizvodi',
      label: 'Vezani proizvodi',
      type: 'relationship',
      relationTo: 'proizvodi',
      hasMany: true,
    },
    {
      name: 'poslovnice',
      label: 'Vrijedi u poslovnicama (prazno = sve)',
      type: 'relationship',
      relationTo: 'poslovnice',
      hasMany: true,
    },
    {
      name: 'istaknutaNaPocetnoj',
      label: 'Istaknuta na početnoj stranici',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    seoPolje,
  ],
}
