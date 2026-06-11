import type { CollectionConfig } from 'payload'
import { jeUrednik, javno } from '../access/uloge'
import { revalidirajKolekciju, revalidirajBrisanje } from '../hooks/revalidiraj'

export const Recenzije: CollectionConfig = {
  slug: 'recenzije',
  labels: { singular: 'Recenzija', plural: 'Recenzije' },
  admin: {
    useAsTitle: 'ime',
    defaultColumns: ['ime', 'poslovnica', 'ocjena', 'odobreno'],
    group: 'Sadržaj',
    description: 'Iskustva korisnika. Na stranici se prikazuju samo odobrene recenzije.',
  },
  access: {
    read: javno,
    create: jeUrednik,
    update: jeUrednik,
    delete: jeUrednik,
  },
  hooks: {
    afterChange: [revalidirajKolekciju(() => ['/', '/poslovnice'])],
    afterDelete: [revalidirajBrisanje(() => ['/', '/poslovnice'])],
  },
  fields: [
    { name: 'ime', label: 'Ime (npr. „Milan K.")', type: 'text', required: true },
    { name: 'poslovnica', label: 'Poslovnica', type: 'relationship', relationTo: 'poslovnice' },
    { name: 'tekst', label: 'Tekst recenzije', type: 'textarea', required: true, maxLength: 500 },
    {
      name: 'ocjena',
      label: 'Ocjena (1–5)',
      type: 'number',
      min: 1,
      max: 5,
      defaultValue: 5,
      required: true,
    },
    {
      name: 'odobreno',
      label: 'Odobreno za prikaz',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'istaknuta',
      label: 'Istaknuta (početna stranica)',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
}
