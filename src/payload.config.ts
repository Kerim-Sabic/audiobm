import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { hr } from '@payloadcms/translations/languages/hr'
import sharp from 'sharp'

import { Korisnici } from './collections/Korisnici'
import { Mediji } from './collections/Mediji'
import { Poslovnice } from './collections/Poslovnice'
import { Tim } from './collections/Tim'
import { Proizvodi } from './collections/Proizvodi'
import { Usluge } from './collections/Usluge'
import { Akcije } from './collections/Akcije'
import { Objave } from './collections/Objave'
import { CestaPitanja } from './collections/CestaPitanja'
import { Recenzije } from './collections/Recenzije'
import { Upiti } from './collections/Upiti'
import { Podesavanja } from './globals/Podesavanja'
import { Navigacija } from './globals/Navigacija'
import { Pocetna } from './globals/Pocetna'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Produkcija: EU Postgres (Neon/Supabase). Lokalni razvoj: SQLite datoteka.
const db = process.env.DATABASE_URL?.startsWith('postgres')
  ? postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL } })
  : sqliteAdapter({ client: { url: process.env.DATABASE_URL || 'file:./audiobm.db' } })

// E-pošta: SMTP iz okruženja; bez SMTP-a poruke se samo evidentiraju u konzoli (razvoj).
const email = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] ?? 'info@audiobm.ba',
      defaultFromName: 'Audio BM',
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT ?? 587) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      },
    })
  : undefined

export default buildConfig({
  admin: {
    user: Korisnici.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' — Audio BM administracija',
      icons: [{ rel: 'icon', type: 'image/png', url: '/brand/icon-32.png' }],
    },
    components: {
      graphics: {
        Logo: '/components/admin/Grafika#AdminLogo',
        Icon: '/components/admin/Grafika#AdminIkona',
      },
      views: {
        dashboard: { Component: '/components/admin/KontrolnaTabla#KontrolnaTabla' },
      },
    },
    avatar: 'default',
    dateFormat: 'dd.MM.yyyy. HH:mm',
  },
  collections: [Upiti, Poslovnice, Proizvodi, Usluge, Akcije, Objave, CestaPitanja, Tim, Recenzije, Mediji, Korisnici],
  globals: [Pocetna, Navigacija, Podesavanja],
  editor: lexicalEditor(),
  i18n: {
    // Hrvatski prevod administracije (ijekavica) uz bosanske dopune ključnih izraza
    supportedLanguages: { hr },
    fallbackLanguage: 'hr',
    translations: {
      hr: {
        general: {
          save: 'Sačuvaj',
          saving: 'Čuvanje…',
          dashboard: 'Kontrolna tabla',
        },
      },
    },
  },
  email,
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db,
  sharp,
  graphQL: { disable: true },
  upload: { limits: { fileSize: 12_000_000 } },
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'],
})
