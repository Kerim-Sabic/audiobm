import type { GlobalConfig } from 'payload'
import { jeUrednik } from '../access/uloge'
import { revalidirajGlobal } from '../hooks/revalidiraj'

export const Pocetna: GlobalConfig = {
  slug: 'pocetna',
  label: 'Početna stranica',
  admin: {
    group: 'Sadržaj',
    description: 'Tekstovi i baneri na početnoj stranici.',
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
      name: 'hero',
      label: 'Glavni dio (hero)',
      type: 'group',
      fields: [
        {
          name: 'naslov',
          label: 'Naslov',
          type: 'text',
          required: true,
          defaultValue: 'Besplatna provjera sluha — više od 30 godina povjerenja',
        },
        {
          name: 'podnaslov',
          label: 'Podnaslov',
          type: 'textarea',
          defaultValue:
            'Stručni tim, vrhunski slušni aparati i strpljiv pristup — u poslovnicama širom Bosne i Hercegovine.',
        },
        {
          name: 'ctaTekst',
          label: 'Tekst glavnog dugmeta',
          type: 'text',
          defaultValue: 'Zakažite besplatnu provjeru sluha',
        },
      ],
    },
    {
      name: 'sarajevoBaner',
      label: 'Baner — nova poslovnica Sarajevo',
      type: 'group',
      fields: [
        { name: 'aktivan', label: 'Prikazuje se', type: 'checkbox', defaultValue: true },
        {
          name: 'tekst',
          label: 'Tekst banera',
          type: 'text',
          defaultValue: 'Otvorili smo poslovnicu u Sarajevu — [ADRESA_PLACEHOLDER]',
        },
        { name: 'link', label: 'Vodi na', type: 'text', defaultValue: '/poslovnice/sarajevo' },
      ],
    },
    {
      name: 'povjerenje',
      label: 'Blok povjerenja (brojke)',
      type: 'group',
      fields: [
        { name: 'godineRada', label: 'Godina rada (brojač)', type: 'number', defaultValue: 32 },
        {
          name: 'statistike',
          label: 'Dodatne brojke',
          type: 'array',
          maxRows: 3,
          admin: { description: 'npr. broj zadovoljnih korisnika — unesite samo provjerene podatke.' },
          fields: [
            { name: 'broj', label: 'Broj (npr. „10.000+")', type: 'text', required: true },
            { name: 'oznaka', label: 'Oznaka (npr. „zadovoljnih korisnika")', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'redoslijedSekcija',
      label: 'Redoslijed sekcija na početnoj',
      type: 'array',
      admin: {
        description: 'Prevlačenjem mijenjate redoslijed sekcija. Sekcije koje uklonite se ne prikazuju.',
      },
      defaultValue: [
        { sekcija: 'koraci' },
        { sekcija: 'poslovnice' },
        { sekcija: 'tipovi' },
        { sekcija: 'usluge' },
        { sekcija: 'povjerenje' },
        { sekcija: 'recenzije' },
        { sekcija: 'akcija' },
        { sekcija: 'pitanja' },
        { sekcija: 'kontakt' },
      ],
      fields: [
        {
          name: 'sekcija',
          label: 'Sekcija',
          type: 'select',
          required: true,
          options: [
            { label: 'Kako izgleda besplatna provjera sluha', value: 'koraci' },
            { label: 'Poslovnice', value: 'poslovnice' },
            { label: 'Vrste slušnih aparata', value: 'tipovi' },
            { label: 'Usluge', value: 'usluge' },
            { label: 'Povjerenje (brojke i brendovi)', value: 'povjerenje' },
            { label: 'Iskustva korisnika', value: 'recenzije' },
            { label: 'Aktuelna akcija', value: 'akcija' },
            { label: 'Česta pitanja', value: 'pitanja' },
            { label: 'Kontakt traka', value: 'kontakt' },
          ],
        },
      ],
    },
  ],
}
