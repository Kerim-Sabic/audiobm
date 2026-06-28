import type { CollectionConfig, PayloadRequest } from 'payload'
import { jePrijavljen, jeVlasnik, upitiPristup } from '../access/uloge'
import { posaljiObavijestOUpitu } from '../email/obavijesti'
import { dajEmailPrimaocaUpita, dajSmtpOkruzenje } from '../lib/okruzenje'
import { KAKO_CULI, kanalLeada, labelKakoCuo } from '../lib/atribucija'
import type { Upiti as UpitDokument } from '../payload-types'

export const VRSTE_UPITA = [
  { label: 'Zakazivanje besplatne provjere sluha', value: 'zakazivanje' },
  { label: 'Pitanje za doktora', value: 'doktor' },
  { label: 'Poruka za poslovnicu', value: 'poslovnica' },
  { label: 'Opšta podrška', value: 'podrska' },
  { label: 'Kupovina proizvoda', value: 'kupovina' },
  { label: 'Zahtjev za povratni poziv', value: 'povratni-poziv' },
  { label: 'Online test sluha (screening)', value: 'online-test-sluha' },
] as const

const KATEGORIJE_CSV: Record<string, string> = {
  'bez-znakova': 'Bez jasnih znakova',
  moguca: 'Moguća poteškoća',
  preporuka: 'Preporučena provjera',
  hitno: 'Hitna konsultacija',
}

const nazivVrste = (vrsta: UpitDokument['vrsta']) => VRSTE_UPITA.find((v) => v.value === vrsta)?.label ?? vrsta

const nazivPoslovnice = (vrijednost: UpitDokument['poslovnica']) =>
  typeof vrijednost === 'object' && vrijednost ? vrijednost.naziv : ''

const nazivProizvoda = (vrijednost: UpitDokument['proizvod']) =>
  typeof vrijednost === 'object' && vrijednost ? vrijednost.naziv : ''

const rezultatObjekt = (upit: UpitDokument) =>
  typeof upit.rezultatTesta === 'object' && upit.rezultatTesta !== null && !Array.isArray(upit.rezultatTesta)
    ? upit.rezultatTesta
    : undefined

const redCsv = (upit: UpitDokument) => {
  const rezultat = rezultatObjekt(upit)
  const kategorija = typeof rezultat?.kategorija === 'string' ? rezultat.kategorija : ''
  const pouzdanost =
    typeof rezultat?.pouzdanost === 'number'
      ? `${rezultat.pouzdanost}/100 (${typeof rezultat.pouzdanostNivo === 'string' ? rezultat.pouzdanostNivo : ''})`
      : ''

  return [
    new Date(upit.createdAt).toLocaleString('bs-BA'),
    nazivVrste(upit.vrsta),
    nazivPoslovnice(upit.poslovnica),
    upit.ime,
    upit.telefon,
    upit.email ?? '',
    (upit.poruka ?? '').replaceAll('\n', ' '),
    nazivProizvoda(upit.proizvod),
    upit.status,
    kategorija ? (KATEGORIJE_CSV[kategorija] ?? kategorija) : '',
    pouzdanost,
    kanalLeada(upit),
    labelKakoCuo(upit.izvorCuo),
    upit.utmIzvor ?? '',
    upit.utmMedij ?? '',
    upit.utmKampanja ?? '',
    upit.referer ?? '',
  ]
    .map((c) => `"${String(c).replaceAll('"', '""')}"`)
    .join(';')
}

/** CSV izvoz svih upita (samo vlasnik i urednik). */
const izvozCsv = async (req: PayloadRequest): Promise<Response> => {
  if (!req.user || !['vlasnik', 'urednik'].includes(req.user.uloga as string)) {
    return Response.json({ greska: 'Nemate pravo pristupa.' }, { status: 403 })
  }
  const { docs } = await req.payload.find({
    collection: 'upiti',
    limit: 10000,
    depth: 1,
    sort: '-createdAt',
  })
  const zaglavlje = [
    'Datum',
    'Vrsta',
    'Poslovnica',
    'Ime',
    'Telefon',
    'E-mail',
    'Poruka',
    'Proizvod',
    'Status',
    'Rezultat testa',
    'Pouzdanost testa',
    'Kanal',
    'Kako čuo',
    'UTM izvor',
    'UTM medij',
    'UTM kampanja',
    'Referrer',
  ]
  const csv = '﻿' + [zaglavlje.join(';'), ...docs.map(redCsv)].join('\r\n')
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="upiti-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}

/** Dijagnostika SMTP-a (samo vlasnik): /api/upiti/test-email — šalje test mail i vraća rezultat. */
const testEmail = async (req: PayloadRequest): Promise<Response> => {
  if (!req.user || req.user.uloga !== 'vlasnik') {
    return Response.json({ greska: 'Samo vlasnik moze pokrenuti test.' }, { status: 403 })
  }

  let smtp: ReturnType<typeof dajSmtpOkruzenje> = undefined
  let smtpAktivan = false
  let smtpGreska: string | null = null
  try {
    smtp = dajSmtpOkruzenje()
    smtpAktivan = Boolean(smtp)
  } catch (e) {
    smtpGreska = e instanceof Error ? e.message : String(e)
  }

  const stanje = {
    SMTP_HOST: process.env.SMTP_HOST ?? '(NIJE postavljen)',
    SMTP_USER: process.env.SMTP_USER ? 'postavljen ✓' : '(NIJE postavljen)',
    SMTP_PASS: process.env.SMTP_PASS ? `postavljen (${process.env.SMTP_PASS.length} znakova)` : '(NIJE postavljen)',
    EMAIL_FROM: smtp ? `${smtp.fromName} <${smtp.fromAddress}>` : 'Svijet Sluha <svijetsluha@gmail.com>',
    EMAIL_TO: dajEmailPrimaocaUpita(),
    EMAIL_FROM_ENV: process.env.EMAIL_FROM ? 'postavljen, ali aplikacija koristi svijetsluha@gmail.com' : '(NIJE postavljen)',
    EMAIL_TO_ENV: process.env.EMAIL_TO ? 'postavljen, ali aplikacija koristi svijetsluha@gmail.com' : '(NIJE postavljen)',
    smtpAktivan,
    ...(smtpGreska ? { smtpGreska } : {}),
  }

  if (!smtpAktivan) {
    return Response.json({
      ...stanje,
      rezultat:
        'SMTP NIJE aktivan. Provjeri da su SMTP_HOST/PORT/USER/PASS postavljeni i da si uradio REDEPLOY nakon dodavanja varijabli.',
    })
  }

  try {
    await req.payload.sendEmail({
      to: dajEmailPrimaocaUpita(),
      subject: 'Test — Svijet Sluha SMTP radi 🎉',
      html: '<p>Ako vidiš ovaj e-mail, SMTP je ispravno povezan. — Svijet Sluha</p>',
    })
    return Response.json({
      ...stanje,
      rezultat: 'Test e-mail je POSLAN. Provjeri inbox i Spam za svijetsluha@gmail.com.',
    })
  } catch (e) {
    return Response.json({
      ...stanje,
      rezultat: 'GRESKA pri slanju — pogledaj „detalji" ispod.',
      detalji: e instanceof Error ? e.message : String(e),
    })
  }
}

export const Upiti: CollectionConfig = {
  slug: 'upiti',
  labels: { singular: 'Upit', plural: 'Upiti' },
  admin: {
    useAsTitle: 'ime',
    defaultColumns: ['createdAt', 'vrsta', 'poslovnica', 'ime', 'telefon', 'status'],
    group: 'Upiti i termini',
    description:
      'Svi upiti sa stranice na jednom mjestu. CSV izvoz: /api/upiti/izvoz (otvoriti u novom tabu dok ste prijavljeni).',
    listSearchableFields: ['ime', 'telefon', 'email', 'poruka'],
  },
  endpoints: [
    { path: '/izvoz', method: 'get', handler: izvozCsv },
    { path: '/test-email', method: 'get', handler: testEmail },
  ],
  access: {
    read: upitiPristup,
    create: jePrijavljen, // javni obrasci idu kroz serversku akciju (lokalni API), ne kroz javni REST
    update: upitiPristup,
    delete: jeVlasnik,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create' && process.env.PAYLOAD_SEED !== 'true') {
          // Netlify/serverless može ugasiti izvršavanje nakon odgovora; e-mail
          // mora biti await-an da ne ostane u pozadini.
          try {
            await posaljiObavijestOUpitu(req.payload, doc)
          } catch (e) {
            req.payload.logger.error(
              `Slanje obavještenja o upitu nije uspjelo: ${e instanceof Error ? e.message : String(e)}`,
            )
          }
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'vrsta',
      label: 'Vrsta upita',
      type: 'select',
      required: true,
      options: [...VRSTE_UPITA],
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'novo',
      options: [
        { label: 'Novo', value: 'novo' },
        { label: 'U toku', value: 'u-toku' },
        { label: 'Riješeno', value: 'rijeseno' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'poslovnica',
      label: 'Poslovnica',
      type: 'relationship',
      relationTo: 'poslovnice',
      admin: { position: 'sidebar' },
    },
    {
      name: 'dodijeljeno',
      label: 'Dodijeljeno korisniku',
      type: 'relationship',
      relationTo: 'korisnici',
      admin: { position: 'sidebar' },
    },
    {
      // čitljiv pregled rezultata online testa — prvo što osoblje vidi
      name: 'rezultatPregled',
      type: 'ui',
      admin: {
        condition: (data) => data?.vrsta === 'online-test-sluha',
        components: { Field: '/components/admin/RezultatTestaPolje#RezultatTestaPolje' },
      },
    },
    { name: 'ime', label: 'Ime i prezime', type: 'text', required: true },
    {
      name: 'telefon',
      label: 'Telefon',
      type: 'text',
      required: true,
    },
    { name: 'email', label: 'E-mail', type: 'email' },
    { name: 'poruka', label: 'Poruka', type: 'textarea' },
    {
      name: 'preferiraniTermin',
      label: 'Preferirani termin (želja korisnika)',
      type: 'text',
    },
    {
      name: 'proizvod',
      label: 'Proizvod (za upite o kupovini)',
      type: 'relationship',
      relationTo: 'proizvodi',
    },
    {
      name: 'izvorStranica',
      label: 'Stranica sa koje je upit poslan',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      type: 'collapsible',
      label: 'Atribucija (odakle je lead)',
      admin: {
        initCollapsed: true,
        description: 'Izvor leada — osnova za praćenje kanala i obračun provizije.',
      },
      fields: [
        {
          name: 'izvorCuo',
          label: 'Kako je korisnik čuo za nas',
          type: 'select',
          options: KAKO_CULI.map((o) => ({ label: o.label, value: o.value })),
          admin: { description: 'Odgovor korisnika na obrascu („Kako ste čuli za nas?").' },
        },
        { name: 'utmIzvor', label: 'UTM izvor (utm_source)', type: 'text', admin: { readOnly: true } },
        { name: 'utmMedij', label: 'UTM medij (utm_medium)', type: 'text', admin: { readOnly: true } },
        { name: 'utmKampanja', label: 'UTM kampanja (utm_campaign)', type: 'text', admin: { readOnly: true } },
        { name: 'utmSadrzaj', label: 'UTM sadržaj (utm_content)', type: 'text', admin: { readOnly: true } },
        { name: 'referer', label: 'Referrer (odakle je došao)', type: 'text', admin: { readOnly: true } },
        { name: 'landingStranica', label: 'Ulazna stranica (first-touch)', type: 'text', admin: { readOnly: true } },
      ],
    },
    {
      name: 'rezultatTesta',
      label: 'Rezultat online testa sluha (sirovi podaci)',
      type: 'json',
      admin: {
        readOnly: true,
        condition: (data) => data?.vrsta === 'online-test-sluha',
        description:
          'Strukturirani rezultat informativnog online screeninga (kategorija, pouzdanost, relativni pragovi po uhu i frekvenciji, upitnik). Ne predstavlja medicinsku dijagnozu.',
      },
    },
    {
      name: 'saglasnost',
      label: 'Saglasnost sa politikom privatnosti',
      type: 'checkbox',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'biljeske',
      label: 'Interne bilješke',
      type: 'array',
      admin: { description: 'Vidljivo samo u administraciji.' },
      fields: [
        { name: 'tekst', label: 'Bilješka', type: 'textarea', required: true },
        { name: 'autor', label: 'Autor', type: 'relationship', relationTo: 'korisnici' },
      ],
    },
  ],
}
