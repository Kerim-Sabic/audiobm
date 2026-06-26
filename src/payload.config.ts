import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { s3Storage } from '@payloadcms/storage-s3'
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
import {
  dajCsrfUrls,
  dajDatabaseUrl,
  dajPayloadSecret,
  dajS3Okruzenje,
  dajServerUrl,
  dajSmtpOkruzenje,
} from './lib/okruzenje'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Produkcija: EU Postgres (Neon/Supabase). Lokalni razvoj: SQLite datoteka.
const databaseUrl = dajDatabaseUrl()
const db = databaseUrl.startsWith('postgres')
  ? postgresAdapter({ pool: { connectionString: databaseUrl } })
  : sqliteAdapter({ client: { url: databaseUrl } })

// E-pošta: SMTP iz okruženja; bez SMTP-a poruke se samo evidentiraju u konzoli (razvoj).
const smtp = dajSmtpOkruzenje()
const email = smtp
  ? nodemailerAdapter({
      defaultFromAddress: smtp.fromAddress,
      defaultFromName: smtp.fromName,
      transportOptions: {
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: { user: smtp.user, pass: smtp.pass },
      },
    })
  : undefined

// Produkcija na serverless platformama (Netlify/Vercel): slike idu u S3/R2
// jer se lokalne datoteke ne čuvaju između poziva funkcija.
const s3 = dajS3Okruzenje()
const plugins = s3
  ? [
      s3Storage({
        collections: { mediji: true },
        bucket: s3.bucket,
        config: {
          region: s3.region,
          credentials: {
            accessKeyId: s3.accessKeyId,
            secretAccessKey: s3.secretAccessKey,
          },
          ...(s3.endpoint ? { endpoint: s3.endpoint } : {}),
        },
      }),
    ]
  : []

export default buildConfig({
  plugins,
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
  secret: dajPayloadSecret(),
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db,
  sharp,
  graphQL: { disable: true },
  upload: { limits: { fileSize: 12_000_000 } },
  serverURL: dajServerUrl(),
  csrf: dajCsrfUrls(),
})
