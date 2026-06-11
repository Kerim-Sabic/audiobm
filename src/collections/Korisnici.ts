import type { CollectionConfig } from 'payload'
import { jeVlasnik } from '../access/uloge'

export const Korisnici: CollectionConfig = {
  slug: 'korisnici',
  labels: { singular: 'Korisnik', plural: 'Korisnici' },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // 10 minuta zaključavanja nakon 5 pogrešnih pokušaja
    tokenExpiration: 60 * 60 * 8,
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  admin: {
    useAsTitle: 'ime',
    group: 'Administracija',
    description: 'Korisnici administracije i njihove uloge.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: jeVlasnik,
    update: ({ req, id }) => {
      if (req.user?.uloga === 'vlasnik') return true
      return req.user?.id === id // svako može urediti vlastiti profil
    },
    delete: jeVlasnik,
  },
  fields: [
    {
      name: 'ime',
      label: 'Ime i prezime',
      type: 'text',
      required: true,
    },
    {
      name: 'uloga',
      label: 'Uloga',
      type: 'select',
      required: true,
      defaultValue: 'urednik',
      options: [
        { label: 'Vlasnik (puni pristup)', value: 'vlasnik' },
        { label: 'Urednik (sadržaj)', value: 'urednik' },
        { label: 'Poslovnica (vlastita lokacija i upiti)', value: 'poslovnica' },
      ],
      access: {
        update: ({ req }) => req.user?.uloga === 'vlasnik',
      },
      admin: { position: 'sidebar' },
    },
    {
      name: 'poslovnica',
      label: 'Poslovnica',
      type: 'relationship',
      relationTo: 'poslovnice',
      admin: {
        position: 'sidebar',
        condition: (data) => data?.uloga === 'poslovnica',
        description: 'Obavezno za ulogu „Poslovnica".',
      },
      validate: (value: unknown, { siblingData }: { siblingData: Partial<{ uloga: string }> }) => {
        if (siblingData?.uloga === 'poslovnica' && !value) {
          return 'Za ulogu „Poslovnica" morate odabrati poslovnicu.'
        }
        return true
      },
    },
  ],
}
