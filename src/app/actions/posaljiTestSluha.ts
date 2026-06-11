'use server'

import { headers } from 'next/headers'
import { dajPayload } from '@/lib/podaci'
import {
  provjeriEmail,
  provjeriIme,
  provjeriSaglasnost,
  provjeriTelefon,
  type GreskeObrasca,
} from '@/lib/validacija'
import { provjeriOgranicenje, provjeriTurnstile } from '@/lib/zastita'
import {
  ocijeniKategoriju,
  ocijeniPouzdanost,
  provjeriRezultatTesta,
  sazmiRezultat,
} from '@/lib/test-sluha'

export type StanjeTestObrasca = {
  status: 'pocetno' | 'uspjeh' | 'greska'
  poruka?: string
  greske?: GreskeObrasca
}

/**
 * Slanje rezultata online testa sluha Audio BM timu.
 * Ista zaštita kao i ostali obrasci: honeypot, ograničenje po IP-u, Turnstile.
 * Rezultat se strogo validira (provjeriRezultatTesta) — proizvoljан JSON se odbija.
 */
export async function posaljiTestSluha(
  _prethodno: StanjeTestObrasca,
  formData: FormData,
): Promise<StanjeTestObrasca> {
  // 1) honeypot: botu „uspije", ništa se ne sprema
  if (formData.get('web_adresa')) {
    return { status: 'uspjeh', poruka: 'Hvala! Kontaktirat ćemo Vas isti radni dan.' }
  }

  // 2) ograničenje po IP adresi
  const zaglavlja = await headers()
  const ip = (zaglavlja.get('x-forwarded-for') ?? '0.0.0.0').split(',')[0].trim()
  if (!provjeriOgranicenje(ip)) {
    return {
      status: 'greska',
      poruka:
        'Primili smo previše zahtjeva sa Vaše adrese. Molimo pokušajte ponovo za nekoliko minuta ili nas pozovite telefonom.',
    }
  }

  // 3) Cloudflare Turnstile (kada je podešen)
  const turnstileOk = await provjeriTurnstile(formData.get('cf-turnstile-response'), ip)
  if (!turnstileOk) {
    return {
      status: 'greska',
      poruka: 'Provjera da niste robot nije uspjela. Molimo osvježite stranicu i pokušajte ponovo.',
    }
  }

  // 4) validacija ličnih podataka
  const ime = String(formData.get('ime') ?? '').trim()
  const telefon = String(formData.get('telefon') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const poslovnicaId = String(formData.get('poslovnica') ?? '').trim()

  const greske: GreskeObrasca = {}
  const g1 = provjeriIme(ime)
  if (g1) greske.ime = g1
  const g2 = provjeriTelefon(telefon)
  if (g2) greske.telefon = g2
  const g3 = provjeriEmail(email)
  if (g3) greske.email = g3
  const g4 = provjeriSaglasnost(formData.get('saglasnost'))
  if (g4) greske.saglasnost = g4
  if (poslovnicaId && (!/^\d+$/.test(poslovnicaId) || Number(poslovnicaId) <= 0)) {
    greske.poslovnica = 'Odabrana poslovnica nije ispravna.'
  }
  if (Object.keys(greske).length > 0) {
    return { status: 'greska', poruka: 'Molimo ispravite označena polja.', greske }
  }

  // 5) stroga validacija rezultata testa (ograničena veličina + bijela lista polja)
  const sirovi = String(formData.get('rezultatTesta') ?? '')
  if (!sirovi || sirovi.length > 8000) {
    return { status: 'greska', poruka: 'Rezultat testa nije ispravan. Molimo ponovite test.' }
  }
  let rezultat
  try {
    rezultat = provjeriRezultatTesta(JSON.parse(sirovi))
  } catch {
    rezultat = null
  }
  if (!rezultat) {
    return { status: 'greska', poruka: 'Rezultat testa nije ispravan. Molimo ponovite test.' }
  }

  // 6) server je autoritet: kategorija i pouzdanost se RAČUNAJU IZNOVA iz
  //    provjerenih pragova/upitnika/zastavica — klijentskim vrijednostima se ne vjeruje
  const sviPragovi = [...Object.values(rezultat.pragovi.desno), ...Object.values(rezultat.pragovi.lijevo)]
  const { pouzdanost, nivo } = ocijeniPouzdanost({
    laznePotvrde: rezultat.laznePotvrde,
    nedosljedneFrekvencije: rezultat.nedosljedneFrekvencije,
    mikrofonProvjera: rezultat.mikrofonProvjera,
    sveNull: sviPragovi.length > 0 && sviPragovi.every((p) => p === null),
    ponavljanja: rezultat.ponavljanja,
  })
  rezultat = {
    ...rezultat,
    kategorija: ocijeniKategoriju(rezultat),
    pouzdanost,
    pouzdanostNivo: nivo,
  }

  const payload = await dajPayload()

  // 7) poslovnica mora postojati — nepostojeća se tiho izostavlja
  let provjerenaPoslovnica: number | undefined
  if (poslovnicaId) {
    try {
      const p = await payload.findByID({ collection: 'poslovnice', id: Number(poslovnicaId), depth: 0 })
      if (p) provjerenaPoslovnica = Number(poslovnicaId)
    } catch {
      provjerenaPoslovnica = undefined
    }
  }

  // 8) spremanje u inbox — e-mail obavještenje šalje hook kolekcije Upiti
  try {
    await payload.create({
      collection: 'upiti',
      data: {
        vrsta: 'online-test-sluha',
        status: 'novo',
        ime,
        telefon,
        ...(email ? { email } : {}),
        ...(provjerenaPoslovnica ? { poslovnica: provjerenaPoslovnica } : {}),
        poruka: sazmiRezultat(rezultat),
        rezultatTesta: rezultat,
        izvorStranica: '/online-test-sluha',
        saglasnost: true,
      },
      overrideAccess: true,
    })
  } catch (e) {
    console.error('Spremanje rezultata testa nije uspjelo:', e)
    return {
      status: 'greska',
      poruka:
        'Došlo je do tehničke greške pri slanju. Molimo pokušajte ponovo ili nas pozovite telefonom — rado ćemo Vam pomoći.',
    }
  }

  return {
    status: 'uspjeh',
    poruka: 'Hvala! Vaš rezultat je zaprimljen — kontaktirat ćemo Vas isti radni dan.',
  }
}
