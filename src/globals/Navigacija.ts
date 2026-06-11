import type { GlobalConfig } from 'payload'
import { jeUrednik } from '../access/uloge'
import { revalidirajGlobal } from '../hooks/revalidiraj'

export const Navigacija: GlobalConfig = {
  slug: 'navigacija',
  label: 'Navigacija (zaglavlje i podnožje)',
  admin: {
    group: 'Administracija',
    description: 'Linkovi u zaglavlju (najviše 7) i kolone u podnožju stranice.',
  },
  access: {
    read: () => true,
    update: jeUrednik,
  },
  hooks: {
    afterChange: [revalidirajGlobal(['/'])],
  },
  fields: [
    {
      name: 'glavniMeni',
      label: 'Glavni meni (zaglavlje)',
      type: 'array',
      maxRows: 7,
      labels: { singular: 'Stavka', plural: 'Stavke' },
      admin: { description: 'Najviše 7 stavki. Svaka stavka mora voditi na stvarnu stranicu.' },
      fields: [
        { name: 'oznaka', label: 'Tekst', type: 'text', required: true },
        { name: 'putanja', label: 'Putanja (npr. /slusni-aparati)', type: 'text', required: true },
      ],
    },
    {
      name: 'podnozje',
      label: 'Kolone podnožja',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'naslov', label: 'Naslov kolone', type: 'text', required: true },
        {
          name: 'linkovi',
          label: 'Linkovi',
          type: 'array',
          fields: [
            { name: 'oznaka', label: 'Tekst', type: 'text', required: true },
            { name: 'putanja', label: 'Putanja', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
