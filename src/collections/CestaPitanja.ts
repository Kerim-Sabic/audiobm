import type { CollectionConfig } from 'payload'
import { jeUrednik, javno } from '../access/uloge'
import { revalidirajKolekciju, revalidirajBrisanje } from '../hooks/revalidiraj'

export const GRUPE_PITANJA = [
  { label: 'Prva posjeta', value: 'prva-posjeta' },
  { label: 'Cijene i refundacija', value: 'cijene-i-refundacija' },
  { label: 'Aparati i održavanje', value: 'aparati-i-odrzavanje' },
  { label: 'Servis i garancija', value: 'servis-i-garancija' },
] as const

export const CestaPitanja: CollectionConfig = {
  slug: 'cesta-pitanja',
  labels: { singular: 'Pitanje', plural: 'Česta pitanja' },
  orderable: true,
  admin: {
    useAsTitle: 'pitanje',
    defaultColumns: ['pitanje', 'grupa', 'aktivno'],
    group: 'Sadržaj',
    description: 'Pitanja i odgovori. Redoslijed mijenjate prevlačenjem u listi.',
  },
  access: {
    read: javno,
    create: jeUrednik,
    update: jeUrednik,
    delete: jeUrednik,
  },
  hooks: {
    afterChange: [revalidirajKolekciju(() => ['/cesta-pitanja', '/'])],
    afterDelete: [revalidirajBrisanje(() => ['/cesta-pitanja', '/'])],
  },
  fields: [
    { name: 'pitanje', label: 'Pitanje', type: 'text', required: true },
    { name: 'odgovor', label: 'Odgovor', type: 'textarea', required: true },
    {
      name: 'grupa',
      label: 'Grupa',
      type: 'select',
      required: true,
      options: [...GRUPE_PITANJA],
      admin: { position: 'sidebar' },
    },
    {
      name: 'naPocetnoj',
      label: 'Prikaži na početnoj stranici',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    { name: 'aktivno', label: 'Prikazuje se na stranici', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
