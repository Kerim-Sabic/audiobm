import type { GlobalConfig } from 'payload'
import { jeVlasnik, jePrijavljen } from '../access/uloge'
import { revalidirajGlobal } from '../hooks/revalidiraj'

export const Podesavanja: GlobalConfig = {
  slug: 'podesavanja',
  label: 'Podešavanja',
  admin: {
    group: 'Administracija',
    description: 'Osnovna podešavanja stranice — SEO, kontakti, obavještenja.',
  },
  access: {
    read: () => true,
    update: jeVlasnik,
  },
  hooks: {
    afterChange: [revalidirajGlobal(['/'])],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Opšte',
          fields: [
            { name: 'nazivSajta', label: 'Naziv stranice', type: 'text', defaultValue: 'Svijet Sluha', required: true },
            {
              name: 'telefonGlavni',
              label: 'Glavni telefon (zaglavlje stranice)',
              type: 'text',
              defaultValue: '033 977 966',
            },
            {
              name: 'emailGlavni',
              label: 'Glavni e-mail',
              type: 'email',
              defaultValue: 'svijetsluha@gmail.com',
              admin: { readOnly: true, description: 'Jedini sluzbeni e-mail za aplikaciju.' },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seoNaslov',
              label: 'Podrazumijevani SEO naslov',
              type: 'text',
              maxLength: 60,
              defaultValue: 'Svijet Sluha — slušni aparati i provjera sluha',
            },
            {
              name: 'seoOpis',
              label: 'Podrazumijevani SEO opis',
              type: 'textarea',
              maxLength: 220,
              admin: { description: 'Preporučeno 150–220 znakova (sa razmacima) za najbolji prikaz u pretrazi.' },
              defaultValue:
                'Svijet Sluha — besplatna provjera sluha i slušni aparati vodećih svjetskih brendova, uz više od 30 godina povjerenja. Posjetite nas u 8 poslovnica širom BiH.',
            },
            { name: 'ogSlika', label: 'Podrazumijevana slika za dijeljenje', type: 'upload', relationTo: 'mediji' },
          ],
        },
        {
          label: 'Obavještenja o upitima',
          fields: [
            {
              name: 'emailZaUpite',
              label: 'Glavni e-mail za sve upite',
              type: 'email',
              defaultValue: 'svijetsluha@gmail.com',
              admin: { readOnly: true, description: 'Svi upiti i zakazivanja idu iskljucivo na svijetsluha@gmail.com.' },
            },
            {
              name: 'primaoci',
              label: 'Posebni primaoci po vrsti upita',
              type: 'array',
              admin: { hidden: true },
              fields: [
                {
                  name: 'vrsta',
                  label: 'Vrsta upita',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Zakazivanje besplatne provjere sluha', value: 'zakazivanje' },
                    { label: 'Pitanje za doktora', value: 'doktor' },
                    { label: 'Poruka za poslovnicu', value: 'poslovnica' },
                    { label: 'Opšta podrška', value: 'podrska' },
                    { label: 'Kupovina proizvoda', value: 'kupovina' },
                    { label: 'Zahtjev za povratni poziv', value: 'povratni-poziv' },
                    { label: 'Online test sluha (screening)', value: 'online-test-sluha' },
                  ],
                },
                { name: 'email', label: 'E-mail primaoca', type: 'email', required: true },
              ],
            },
          ],
        },
        {
          label: 'Društvene mreže i analitika',
          fields: [
            { name: 'facebook', label: 'Facebook adresa', type: 'text' },
            { name: 'instagram', label: 'Instagram adresa', type: 'text' },
            { name: 'youtube', label: 'YouTube adresa', type: 'text' },
            {
              name: 'plausibleDomena',
              label: 'Plausible domena (analitika)',
              type: 'text',
              admin: { description: 'npr. „svijetsluha.com" — ostavite prazno dok se analitika ne podesi.' },
            },
            {
              name: 'gaMeasurementId',
              label: 'Google Analytics ID (npr. G-XXXXXXXXXX)',
              type: 'text',
              admin: {
                description:
                  'Opcionalno. Ako koristite samo Plausible, ostavite prazno. Napomena: GA koristi kolačiće — uz njega je potreban pristanak (cookie baner).',
              },
            },
          ],
        },
      ],
    },
  ],
}
