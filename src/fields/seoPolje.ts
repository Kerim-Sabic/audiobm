import type { Field } from 'payload'

/** SEO grupa — naslov i opis koje vlasnik može mijenjati po stranici. */
export const seoPolje: Field = {
  name: 'seo',
  label: 'SEO (pretraživači)',
  type: 'group',
  admin: {
    description: 'Kako se stranica prikazuje na Google-u. Ostavite prazno za automatski tekst.',
  },
  fields: [
    {
      name: 'naslov',
      label: 'SEO naslov (do 60 znakova)',
      type: 'text',
      maxLength: 60,
    },
    {
      name: 'opis',
      label: 'SEO opis (do 155 znakova)',
      type: 'textarea',
      maxLength: 155,
    },
    {
      name: 'slika',
      label: 'Slika za dijeljenje (OG)',
      type: 'upload',
      relationTo: 'mediji',
    },
  ],
}
