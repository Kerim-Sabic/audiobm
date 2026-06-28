import type { Payload } from 'payload'
import type { Poslovnice, Upiti } from '../payload-types'
import { ZASTAVICE, type KategorijaTesta } from '../lib/test-sluha'
import { BREND } from '../lib/brend'
import { dajEmailPrimaocaUpita } from '../lib/okruzenje'

type VrstaUpita = Upiti['vrsta']

const NAZIVI_VRSTA = {
  zakazivanje: 'Zakazivanje besplatne provjere sluha',
  doktor: 'Pitanje za doktora',
  poslovnica: 'Poruka za poslovnicu',
  podrska: 'Opšta podrška',
  kupovina: 'Kupovina proizvoda',
  'povratni-poziv': 'Zahtjev za povratni poziv',
  'online-test-sluha': 'Online test sluha (screening)',
} as const satisfies Record<VrstaUpita, string>

const NAZIVI_KATEGORIJA = {
  'bez-znakova': 'Nema jasnih znakova poteškoće',
  moguca: 'Moguća poteškoća sa sluhom',
  preporuka: 'Preporučuje se profesionalna provjera',
  hitno: 'Potrebna brza konsultacija (crvene zastavice)',
} as const satisfies Record<KategorijaTesta, string>

const HTML_ZAMJENE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => HTML_ZAMJENE[c] ?? c)

const jeObjekt = (vrijednost: unknown): vrijednost is Record<string, unknown> =>
  typeof vrijednost === 'object' && vrijednost !== null && !Array.isArray(vrijednost)

const jePoslovnica = (vrijednost: Upiti['poslovnica']): vrijednost is Poslovnice =>
  jeObjekt(vrijednost) && typeof vrijednost.id === 'number'

const dajRezultat = (upit: Upiti) => (jeObjekt(upit.rezultatTesta) ? upit.rezultatTesta : undefined)

const dajNazivKategorije = (rezultat?: Record<string, unknown>) => {
  switch (rezultat?.kategorija) {
    case 'bez-znakova':
      return NAZIVI_KATEGORIJA['bez-znakova']
    case 'moguca':
      return NAZIVI_KATEGORIJA.moguca
    case 'preporuka':
      return NAZIVI_KATEGORIJA.preporuka
    case 'hitno':
      return NAZIVI_KATEGORIJA.hitno
    default:
      return undefined
  }
}

const dajPouzdanost = (rezultat?: Record<string, unknown>) => {
  if (typeof rezultat?.pouzdanost !== 'number' || typeof rezultat.pouzdanostNivo !== 'string') return undefined
  return `${rezultat.pouzdanost}/100 (${rezultat.pouzdanostNivo})`
}

const dajZastavice = (rezultat?: Record<string, unknown>) => {
  if (!Array.isArray(rezultat?.zastavice)) return undefined

  const oznake = rezultat.zastavice
    .filter((zastavica): zastavica is string => typeof zastavica === 'string')
    .map((zastavica) => ZASTAVICE.find((z) => z.id === zastavica)?.oznaka ?? zastavica)

  return oznake.length > 0 ? oznake.join('; ') : undefined
}

/**
 * Šalje e-mail obavještenje o novom upitu na jedini službeni inbox.
 */
export async function posaljiObavijestOUpitu(payload: Payload, upit: Upiti): Promise<void> {
  const primalac = dajEmailPrimaocaUpita()

  const vrsta = NAZIVI_VRSTA[upit.vrsta]
  const poslovnicaNaziv = jePoslovnica(upit.poslovnica) ? upit.poslovnica.naziv : undefined
  const adminUrl = `${BREND.domena}/admin/collections/upiti/${upit.id}`
  const rezultat = dajRezultat(upit)

  const red = (oznaka: string, vrijednost?: unknown) =>
    vrijednost == null || vrijednost === ''
      ? ''
      : `<tr><td style="padding:6px 12px;color:#6b6360;font-size:14px">${esc(oznaka)}</td><td style="padding:6px 12px;font-size:15px;font-weight:600;color:#1c1917">${esc(vrijednost)}</td></tr>`

  await payload.sendEmail({
    to: primalac,
    subject: `Novi upit: ${vrsta}${poslovnicaNaziv ? ` — ${poslovnicaNaziv}` : ''}`,
    html: `
<!doctype html><html lang="bs"><body style="margin:0;background:#f7f5f4;font-family:Arial,Helvetica,sans-serif;padding:24px">
  <table role="presentation" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border-collapse:collapse;width:100%">
    <tr><td style="background:#ED1C24;padding:16px 24px">
      <span style="color:#ffffff;font-size:18px;font-weight:700">${BREND.naziv} — novi upit</span>
    </td></tr>
    <tr><td style="padding:24px">
      <p style="margin:0 0 16px;font-size:16px;color:#1c1917">Zaprimljen je novi upit sa web stranice:</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;background:#faf9f8;border-radius:8px">
        ${red('Vrsta', vrsta)}
        ${red('Poslovnica', poslovnicaNaziv)}
        ${red('Ime i prezime', upit.ime)}
        ${red('Telefon', upit.telefon)}
        ${red('E-mail', upit.email)}
        ${red('Preferirani termin', upit.preferiraniTermin)}
        ${red('Poruka', upit.poruka)}
        ${red('Rezultat screeninga', dajNazivKategorije(rezultat))}
        ${red('Pouzdanost screeninga', dajPouzdanost(rezultat))}
        ${red('CRVENE ZASTAVICE', dajZastavice(rezultat))}
      </table>
      <p style="margin:20px 0 0">
        <a href="${esc(adminUrl)}" style="display:inline-block;background:#ED1C24;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:15px;font-weight:600">Otvorite upit u administraciji</a>
      </p>
      <p style="margin:16px 0 0;font-size:13px;color:#6b6360">Molimo kontaktirajte korisnika isti radni dan.</p>
    </td></tr>
  </table>
</body></html>`,
  })
}
