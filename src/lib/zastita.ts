/**
 * Zaštita obrazaca od zloupotrebe:
 *  1. honeypot polje (botovi ga popune, ljudi ga ne vide)
 *  2. ograničenje broja zahtjeva po IP adresi (u memoriji procesa)
 *  3. Cloudflare Turnstile provjera (aktivna kad je TURNSTILE_SECRET_KEY podešen)
 */

type Prozor = { brojac: number; pocetak: number }
const prozori = new Map<string, Prozor>()
const LIMIT = 5 // zahtjeva
const TRAJANJE = 10 * 60 * 1000 // po 10 minuta

export function provjeriOgranicenje(ip: string): boolean {
  const sada = Date.now()
  // povremeno čišćenje starih unosa
  if (prozori.size > 5000) {
    for (const [k, v] of prozori) if (sada - v.pocetak > TRAJANJE) prozori.delete(k)
  }
  const prozor = prozori.get(ip)
  if (!prozor || sada - prozor.pocetak > TRAJANJE) {
    prozori.set(ip, { brojac: 1, pocetak: sada })
    return true
  }
  prozor.brojac++
  return prozor.brojac <= LIMIT
}

export async function provjeriTurnstile(token: unknown, ip: string): Promise<boolean> {
  const tajna = process.env.TURNSTILE_SECRET_KEY
  if (!tajna) return true // Turnstile nije aktivan dok nema tajnog ključa.
  if (typeof token !== 'string' || !token) return false
  try {
    const odgovor = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret: tajna, response: token, remoteip: ip }),
    })
    const podaci = (await odgovor.json()) as { success: boolean }
    return podaci.success === true
  } catch {
    return false
  }
}
