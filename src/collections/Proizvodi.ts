import type { CollectionConfig } from 'payload'
import { slugPolje } from '../fields/slugPolje'
import { seoPolje } from '../fields/seoPolje'
import { jeUrednik, javnoObjavljeno } from '../access/uloge'
import { revalidirajKolekciju, revalidirajBrisanje } from '../hooks/revalidiraj'

export const Proizvodi: CollectionConfig = {
  slug: 'proizvodi',
  labels: { singular: 'Proizvod', plural: 'Proizvodi' },
  admin: {
    useAsTitle: 'naziv',
    defaultColumns: ['naziv', 'kategorija', 'brend', 'nacin', 'cijena', 'aktivan'],
    group: 'Sadržaj',
    description:
      'Slušni aparati (savjetovanje, bez cijene) i maloprodajni artikli (baterije, čepovi, pribor…).',
  },
  versions: { drafts: true },
  access: {
    read: javnoObjavljeno,
    create: jeUrednik,
    update: jeUrednik,
    delete: jeUrednik,
  },
  hooks: {
    afterChange: [
      revalidirajKolekciju((doc) => [
        '/proizvodi',
        '/slusni-aparati',
        `/proizvodi/${doc.slug}`,
        `/slusni-aparati/modeli/${doc.slug}`,
      ]),
    ],
    afterDelete: [revalidirajBrisanje(() => ['/proizvodi', '/slusni-aparati'])],
  },
  fields: [
    { name: 'naziv', label: 'Naziv', type: 'text', required: true },
    slugPolje('naziv'),
    {
      name: 'nacin',
      label: 'Način prodaje',
      type: 'select',
      required: true,
      defaultValue: 'maloprodaja',
      options: [
        { label: 'Savjetovanje (bez cijene i korpe — upit / termin)', value: 'konsultacija' },
        { label: 'Maloprodaja (cijena + narudžba upitom ili telefonom)', value: 'maloprodaja' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'kategorija',
      label: 'Kategorija',
      type: 'select',
      required: true,
      options: [
        { label: 'Slušni aparati', value: 'slusni-aparati' },
        { label: 'Baterije za slušne aparate', value: 'baterije' },
        { label: 'Čepovi za uši', value: 'cepovi-za-usi' },
        { label: 'Pribor i održavanje', value: 'pribor-i-odrzavanje' },
        { label: 'Kućni medicinski aparati', value: 'kucni-medicinski-aparati' },
        { label: 'Slušni implanti', value: 'slusni-implanti' },
        { label: 'Profesionalna oprema', value: 'profesionalna-oprema' },
      ],
    },
    {
      name: 'brend',
      label: 'Brend',
      type: 'select',
      options: [
        { label: 'Bernafon', value: 'Bernafon' },
        { label: 'Unitron', value: 'Unitron' },
        { label: 'Varta', value: 'Varta' },
        { label: 'Cochlear', value: 'Cochlear' },
        { label: 'GSI', value: 'GSI' },
        { label: 'Otometrics', value: 'Otometrics' },
        { label: 'Dynamic Ear Company', value: 'Dynamic Ear Company' },
        { label: 'Dreve', value: 'Dreve' },
        { label: 'Alerta', value: 'Alerta' },
        { label: 'Ostalo', value: 'Ostalo' },
      ],
    },
    {
      name: 'tipAparata',
      label: 'Tip slušnog aparata',
      type: 'select',
      options: [
        { label: 'Kanalni (gotovo nevidljivi)', value: 'kanalni' },
        { label: 'Zaušni', value: 'zausni' },
        { label: 'Zaušni za teža oštećenja', value: 'zausni-snazni' },
      ],
      admin: {
        condition: (data) => data?.kategorija === 'slusni-aparati',
      },
    },
    {
      type: 'row',
      admin: { condition: (data) => data?.nacin === 'maloprodaja' },
      fields: [
        {
          name: 'cijena',
          label: 'Cijena (KM)',
          type: 'number',
          min: 0,
          admin: { width: '50%', description: 'Ostavite prazno ako cijena nije potvrđena — prikazaće se „Cijena na upit".' },
        },
        {
          name: 'staraCijena',
          label: 'Stara cijena (KM, za akcije)',
          type: 'number',
          min: 0,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      admin: { condition: (data) => data?.nacin === 'konsultacija' },
      fields: [
        { name: 'cijenaOd', label: 'Raspon cijene od (KM, opcionalno)', type: 'number', min: 0, admin: { width: '50%' } },
        { name: 'cijenaDo', label: 'Raspon cijene do (KM, opcionalno)', type: 'number', min: 0, admin: { width: '50%' } },
      ],
    },
    {
      name: 'cijenaNapomena',
      label: 'Napomena uz cijenu',
      type: 'text',
      admin: { description: 'npr. „Cijena zavisi od modela i stepena oštećenja sluha."' },
    },
    {
      name: 'kratkiOpis',
      label: 'Kratki opis (za kartice u listi)',
      type: 'textarea',
      maxLength: 220,
    },
    {
      name: 'opis',
      label: 'Opis proizvoda',
      type: 'richText',
    },
    {
      name: 'slike',
      label: 'Slike proizvoda',
      type: 'upload',
      relationTo: 'mediji',
      hasMany: true,
      required: true,
    },
    {
      name: 'istaknut',
      label: 'Istaknut proizvod',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'aktivan',
      label: 'Prikazuje se na stranici',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'legacyHandle',
      label: 'Stara Shopify adresa (handle)',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Za 301 preusmjeravanja sa stare stranice.' },
    },
    seoPolje,
  ],
}
