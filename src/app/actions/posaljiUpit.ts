'use server'

import { headers } from 'next/headers'
import { dajPayload } from '@/lib/podaci'
import {
  provjeriEmail,
  provjeriIme,
  provjeriPoruku,
  provjeriSaglasnost,
  provjeriTelefon,
  type GreskeObrasca,
} from '@/lib/validacija'
import { provjeriOgranicenje, provjeriTurnstile } from '@/lib/zastita'

export type StanjeObrasca = {
  status: 'pocetno' | 'uspjeh' | 'greska'
  poruka?: string
  greske?: GreskeObrasca
}

const VRSTE = ['zakazivanje', 'doktor', 'poslovnica', 'podrska', 'kupovina', 'povratni-poziv'] as const
type Vrsta = (typeof VRSTE)[number]

/**
 * Jedinstvena serverska akcija za sve obrasce — upit završava u CMS inboxu,
 * e-mail obavještenje šalje hook kolekcije Upiti.
 */
export async function posaljiUpit(_prethodno: StanjeObrasca, formData: FormData): Promise<StanjeObrasca> {
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
      poruka: 'Primili smo previše zahtjeva sa Vaše adrese. Molimo pokušajte ponovo za nekoliko minuta ili nas pozovite telefonom.',
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

  // 4) validacija
  const vrsta = String(formData.get('vrsta') ?? '')
  if (!VRSTE.includes(vrsta as Vrsta)) {
    return { status: 'greska', poruka: 'Obrazac nije ispravno poslan. Molimo osvježite stranicu.' }
  }

  const ime = String(formData.get('ime') ?? '').trim()
  const telefon = String(formData.get('telefon') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const poruka = String(formData.get('poruka') ?? '').trim()
  const preferiraniTermin = String(formData.get('preferiraniTermin') ?? '').trim()
  const poslovnicaId = String(formData.get('poslovnica') ?? '').trim()
  const proizvodId = String(formData.get('proizvod') ?? '').trim()
  const izvorStranica = String(formData.get('izvorStranica') ?? '').trim()

  const greske: GreskeObrasca = {}
  const g1 = provjeriIme(ime)
  if (g1) greske.ime = g1
  const g2 = provjeriTelefon(telefon)
  if (g2) greske.telefon = g2
  const g3 = provjeriEmail(email)
  if (g3) greske.email = g3
  const g4 = provjeriPoruku(poruka, vrsta === 'doktor')
  if (g4) greske.poruka = g4
  const g5 = provjeriSaglasnost(formData.get('saglasnost'))
  if (g5) greske.saglasnost = g5
  if (vrsta === 'zakazivanje' && !poslovnicaId) {
    greske.poslovnica = 'Molimo odaberite poslovnicu u koju želite doći.'
  }

  if (Object.keys(greske).length > 0) {
    return { status: 'greska', poruka: 'Molimo ispravite označena polja.', greske }
  }

  // 5) spremanje u inbox
  try {
    const payload = await dajPayload()
    await payload.create({
      collection: 'upiti',
      data: {
        vrsta: vrsta as Vrsta,
        status: 'novo',
        ime,
        telefon,
        ...(email ? { email } : {}),
        ...(poruka ? { poruka } : {}),
        ...(preferiraniTermin ? { preferiraniTermin } : {}),
        ...(poslovnicaId ? { poslovnica: Number(poslovnicaId) } : {}),
        ...(proizvodId ? { proizvod: Number(proizvodId) } : {}),
        ...(izvorStranica ? { izvorStranica } : {}),
        saglasnost: true,
      },
      overrideAccess: true,
    })
  } catch (e) {
    console.error('Spremanje upita nije uspjelo:', e)
    return {
      status: 'greska',
      poruka:
        'Došlo je do tehničke greške pri slanju. Molimo pokušajte ponovo ili nas pozovite telefonom — rado ćemo Vam pomoći.',
    }
  }

  return {
    status: 'uspjeh',
    poruka: 'Hvala! Kontaktirat ćemo Vas isti radni dan radi potvrde termina.',
  }
}
