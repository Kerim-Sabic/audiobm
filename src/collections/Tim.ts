import type { CollectionConfig } from 'payload'
import { jeUrednik, javno } from '../access/uloge'
import { revalidirajKolekciju, revalidirajBrisanje } from '../hooks/revalidiraj'

export const Tim: CollectionConfig = {
  slug: 'tim',
  labels: { singular: 'Član tima', plural: 'Tim' },
  admin: {
    useAsTitle: 'ime',
    defaultColumns: ['ime', 'titula', 'poslovnica', 'aktivan'],
    group: 'Sadržaj',
    description: 'Zaposleni — prikazuju se na stranici „Naš tim" i na stranicama poslovnica.',
  },
  access: {
    read: javno,
    create: jeUrednik,
    update: jeUrednik,
    delete: jeUrednik,
  },
  hooks: {
    afterChange: [revalidirajKolekciju((doc) => ['/tim', '/poslovnice'])],
    afterDelete: [revalidirajBrisanje(() => ['/tim', '/poslovnice'])],
  },
  fields: [
    { name: 'ime', label: 'Ime i prezime', type: 'text', required: true },
    { name: 'titula', label: 'Titula / kvalifikacije', type: 'text', admin: { description: 'npr. „dipl. defektolog — audiolog"' } },
    { name: 'fotografija', label: 'Fotografija', type: 'upload', relationTo: 'mediji' },
    { name: 'poslovnica', label: 'Poslovnica', type: 'relationship', relationTo: 'poslovnice' },
    {
      name: 'jezici',
      label: 'Jezici',
      type: 'array',
      fields: [{ name: 'jezik', label: 'Jezik', type: 'text', required: true }],
    },
    { name: 'biografija', label: 'Kratka biografija', type: 'textarea' },
    { name: 'redoslijed', label: 'Redoslijed prikaza', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    { name: 'aktivan', label: 'Prikazuje se na stranici', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
