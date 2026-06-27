import { BREND } from './brend'

const citaj = (ime: string) => {
  const vrijednost = process.env[ime]?.trim()
  return vrijednost ? vrijednost : undefined
}

const obavezno = (ime: string, poruka: string) => {
  const vrijednost = citaj(ime)
  if (vrijednost) return vrijednost
  throw new Error(`Nedostaje varijabla okruzenja ${ime}. ${poruka}`)
}

const broj = (ime: string, podrazumijevano: number) => {
  const vrijednost = citaj(ime)
  if (!vrijednost) return podrazumijevano

  const parsed = Number(vrijednost)
  if (Number.isInteger(parsed) && parsed > 0) return parsed

  throw new Error(`Varijabla okruzenja ${ime} mora biti pozitivan cijeli broj.`)
}

const emailFrom = (vrijednost: string) => {
  const match = vrijednost.match(/^"?([^"<]+)"?\s*<([^>]+)>$/)
  if (!match) return { adresa: vrijednost, naziv: BREND.emailNaziv }

  return {
    naziv: match[1].trim(),
    adresa: match[2].trim(),
  }
}

export function dajPayloadSecret() {
  return obavezno('PAYLOAD_SECRET', 'Kopirajte .env.example u .env i upisite dug nasumican niz.')
}

export function dajDatabaseUrl() {
  return citaj('DATABASE_URL') ?? 'file:./audiobm.db'
}

export function dajServerUrl() {
  // U produkciji UVIJEK prava domena (ne netlify.app iz env-a) — inače admin save-ovi
  // padaju na CSRF („Nemate dopuštenje") jer se admin otvara na svijetsluha.com.
  if (process.env.NODE_ENV === 'production') return BREND.domena
  return citaj('NEXT_PUBLIC_SERVER_URL')
}

export function dajCsrfUrl() {
  return dajServerUrl() ?? 'http://localhost:3000'
}

/** Dozvoljeni CSRF origini — admin radi s apex, www i (eventualno) netlify poddomene. */
export function dajCsrfUrls() {
  return Array.from(
    new Set(
      [BREND.domena, 'https://www.svijetsluha.com', citaj('NEXT_PUBLIC_SERVER_URL'), dajCsrfUrl()].filter(
        (v): v is string => Boolean(v),
      ),
    ),
  )
}

export function dajSmtpOkruzenje() {
  const host = citaj('SMTP_HOST')
  if (!host) return undefined

  const from = emailFrom(citaj('EMAIL_FROM') ?? `${BREND.emailNaziv} <${BREND.emailAdresa}>`)
  const port = broj('SMTP_PORT', 587)

  return {
    host,
    port,
    secure: port === 465,
    user: obavezno('SMTP_USER', 'SMTP_HOST je postavljen, pa su potrebni i SMTP kredencijali.'),
    pass: obavezno('SMTP_PASS', 'SMTP_HOST je postavljen, pa su potrebni i SMTP kredencijali.'),
    fromAddress: from.adresa,
    fromName: from.naziv,
  }
}

export function dajEmailPrimaocaUpita() {
  return citaj('EMAIL_TO') ?? citaj('NOTIFICATION_EMAIL')
}

export function dajS3Okruzenje() {
  const bucket = citaj('S3_BUCKET')
  if (!bucket) return undefined

  return {
    bucket,
    region: citaj('S3_REGION') ?? 'auto',
    accessKeyId: obavezno('S3_ACCESS_KEY_ID', 'S3_BUCKET je postavljen, pa je potreban pristupni kljuc.'),
    secretAccessKey: obavezno('S3_SECRET_ACCESS_KEY', 'S3_BUCKET je postavljen, pa je potreban tajni kljuc.'),
    endpoint: citaj('S3_ENDPOINT'),
  }
}
