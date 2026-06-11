import type { CollectionConfig, PayloadRequest } from 'payload'
import { jePrijavljen, jeVlasnik, upitiPristup } from '../access/uloge'
import { posaljiObavijestOUpitu } from '../email/obavijesti'

export const VRSTE_UPITA = [
  { label: 'Zakazivanje besplatne provjere sluha', value: 'zakazivanje' },
  { label: 'Pitanje za doktora', value: 'doktor' },
  { label: 'Poruka za poslovnicu', value: 'poslovnica' },
  { label: 'Opšta podrška', value: 'podrska' },
  { label: 'Kupovina proizvoda', value: 'kupovina' },
  { label: 'Zahtjev za povratni poziv', value: 'povratni-poziv' },
  { label: 'Online test sluha (screening)', value: 'online-test-sluha' },
] as const

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
  const zaglavlje = ['Datum', 'Vrsta', 'Poslovnica', 'Ime', 'Telefon', 'E-mail', 'Poruka', 'Proizvod', 'Status']
  const red = (u: Record<string, any>) =>
    [
      new Date(u.createdAt).toLocaleString('bs-BA'),
      VRSTE_UPITA.find((v) => v.value === u.vrsta)?.label ?? u.vrsta,
      typeof u.poslovnica === 'object' ? u.poslovnica?.naziv ?? '' : '',
      u.ime ?? '',
      u.telefon ?? '',
      u.email ?? '',
      (u.poruka ?? '').replaceAll('\n', ' '),
      typeof u.proizvod === 'object' ? u.proizvod?.naziv ?? '' : '',
      u.status ?? '',
    ]
      .map((c) => `"${String(c).replaceAll('"', '""')}"`)
      .join(';')
  const csv = '﻿' + [zaglavlje.join(';'), ...docs.map(red)].join('\r\n')
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="upiti-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
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
  endpoints: [{ path: '/izvoz', method: 'get', handler: izvozCsv }],
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
          // e-mail obavještenje primaocu prema vrsti upita i poslovnici
          posaljiObavijestOUpitu(req.payload, doc).catch((e) =>
            req.payload.logger.error(`Slanje obavještenja o upitu nije uspjelo: ${e.message}`),
          )
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
      name: 'rezultatTesta',
      label: 'Rezultat online testa sluha',
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
