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
            { name: 'nazivSajta', label: 'Naziv stranice', type: 'text', defaultValue: 'Audio BM', required: true },
            {
              name: 'telefonGlavni',
              label: 'Glavni telefon (zaglavlje stranice)',
              type: 'text',
              defaultValue: '051 218 781',
            },
            { name: 'emailGlavni', label: 'Glavni e-mail', type: 'email' },
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
              defaultValue: 'Audio BM — Slušni aparati i besplatna provjera sluha',
            },
            {
              name: 'seoOpis',
              label: 'Podrazumijevani SEO opis',
              type: 'textarea',
              maxLength: 155,
              defaultValue:
                'Više od 30 godina povjerenja. Besplatna provjera sluha u Sarajevu, Banjoj Luci, Gradišci, Bijeljini, Doboju i Brčkom.',
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
              admin: { description: 'Na ovu adresu stižu obavještenja ako nije podešen poseban primalac.' },
            },
            {
              name: 'primaoci',
              label: 'Posebni primaoci po vrsti upita',
              type: 'array',
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
              admin: { description: 'npr. „audiobm.ba" — ostavite prazno dok se analitika ne podesi.' },
            },
          ],
        },
      ],
    },
  ],
}
