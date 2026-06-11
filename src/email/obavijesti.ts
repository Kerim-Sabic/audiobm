import type { Payload } from 'payload'

const NAZIVI_VRSTA: Record<string, string> = {
  zakazivanje: 'Zakazivanje besplatne provjere sluha',
  doktor: 'Pitanje za doktora',
  poslovnica: 'Poruka za poslovnicu',
  podrska: 'Opšta podrška',
  kupovina: 'Kupovina proizvoda',
  'povratni-poziv': 'Zahtjev za povratni poziv',
  'online-test-sluha': 'Online test sluha (screening)',
}

const NAZIVI_KATEGORIJA: Record<string, string> = {
  'bez-znakova': 'Nema jasnih znakova poteškoće',
  moguca: 'Moguća poteškoća sa sluhom',
  preporuka: 'Preporučuje se profesionalna provjera',
  hitno: 'Potrebna brza konsultacija (crvene zastavice)',
}

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

/**
 * Šalje e-mail obavještenje o novom upitu primaocu određenom
 * vrstom upita i poslovnicom (Podešavanja → Obavještenja o upitima).
 */
export async function posaljiObavijestOUpitu(payload: Payload, upit: Record<string, any>): Promise<void> {
  const podesavanja = await payload.findGlobal({ slug: 'podesavanja' })

  // 1) poseban primalac za ovu vrstu upita
  let primalac: string | undefined = (podesavanja.primaoci as { vrsta: string; email: string }[] | undefined)?.find(
    (p) => p.vrsta === upit.vrsta,
  )?.email

  // 2) upiti vezani za poslovnicu idu na e-mail poslovnice
  if (!primalac && upit.poslovnica) {
    const poslovnicaId = typeof upit.poslovnica === 'object' ? upit.poslovnica.id : upit.poslovnica
    try {
      const poslovnica = await payload.findByID({ collection: 'poslovnice', id: poslovnicaId, depth: 0 })
      primalac = (poslovnica.emaili as { email: string }[] | undefined)?.[0]?.email
    } catch {
      /* poslovnica možda obrisana */
    }
  }

  // 3) glavni e-mail za upite
  primalac = primalac || (podesavanja.emailZaUpite as string | undefined) || undefined

  if (!primalac) {
    payload.logger.warn('Upit zaprimljen, ali nijedan e-mail primalac nije podešen (Podešavanja → Obavještenja).')
    return
  }

  const vrsta = NAZIVI_VRSTA[upit.vrsta as string] ?? upit.vrsta
  const poslovnicaNaziv = typeof upit.poslovnica === 'object' ? upit.poslovnica?.naziv : undefined
  const adminUrl = `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/admin/collections/upiti/${upit.id}`

  const red = (oznaka: string, vrijednost?: unknown) =>
    vrijednost
      ? `<tr><td style="padding:6px 12px;color:#6b6360;font-size:14px">${oznaka}</td><td style="padding:6px 12px;font-size:15px;font-weight:600;color:#1c1917">${esc(vrijednost)}</td></tr>`
      : ''

  await payload.sendEmail({
    to: primalac,
    subject: `Novi upit: ${vrsta}${poslovnicaNaziv ? ` — ${poslovnicaNaziv}` : ''}`,
    html: `
<!doctype html><html lang="bs"><body style="margin:0;background:#f7f5f4;font-family:Arial,Helvetica,sans-serif;padding:24px">
  <table role="presentation" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border-collapse:collapse;width:100%">
    <tr><td style="background:#ED1C24;padding:16px 24px">
      <span style="color:#ffffff;font-size:18px;font-weight:700">Audio BM — novi upit</span>
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
        ${red(
          'Rezultat screeninga',
          upit.rezultatTesta && typeof upit.rezultatTesta === 'object'
            ? NAZIVI_KATEGORIJA[(upit.rezultatTesta as Record<string, unknown>).kategorija as string]
            : undefined,
        )}
        ${red(
          'Pouzdanost screeninga',
          upit.rezultatTesta && typeof upit.rezultatTesta === 'object'
            ? (upit.rezultatTesta as Record<string, unknown>).pouzdanostNivo
            : undefined,
        )}
      </table>
      <p style="margin:20px 0 0">
        <a href="${adminUrl}" style="display:inline-block;background:#ED1C24;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:15px;font-weight:600">Otvorite upit u administraciji</a>
      </p>
      <p style="margin:16px 0 0;font-size:13px;color:#6b6360">Molimo kontaktirajte korisnika isti radni dan.</p>
    </td></tr>
  </table>
</body></html>`,
  })
}
