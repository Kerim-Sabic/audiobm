// Atribucija leadova (zaštita 5% provizije): first-touch izvor posjete + ljudski
// odgovor „Kako ste čuli za nas". Sve se sprema uz upit i izvozi u CSV.

/** Opcije za vidljivo pitanje „Kako ste čuli za nas?" — dijele forma i CMS. */
export const KAKO_CULI = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Google pretraga', value: 'google' },
  { label: 'Preporuka prijatelja ili porodice', value: 'preporuka' },
  { label: 'Bilbord / plakat', value: 'bilbord' },
  { label: 'Već sam bio korisnik', value: 'postojeci' },
  { label: 'Ostalo', value: 'ostalo' },
] as const

export type Atribucija = {
  izvor?: string
  medij?: string
  kampanja?: string
  sadrzaj?: string
  klik?: string
  referer?: string
  landing?: string
  ts?: string
}

const KLJUC = 'ss_atribucija'

/**
 * Bilježi first-touch atribuciju na prvi dolazak: ako već postoji zapis, ne
 * prepisuje se (zadržava se originalni izvor kroz cijelu sesiju/posjete).
 */
export function zabiljeziAtribuciju(): void {
  if (typeof window === 'undefined') return
  try {
    if (window.localStorage.getItem(KLJUC)) return
    const p = new URLSearchParams(window.location.search)
    const ref = document.referrer || ''
    let interni = false
    try {
      interni = Boolean(ref) && new URL(ref).host === window.location.host
    } catch {
      interni = false
    }
    const a: Atribucija = {
      izvor: p.get('utm_source') ?? undefined,
      medij: p.get('utm_medium') ?? undefined,
      kampanja: p.get('utm_campaign') ?? undefined,
      sadrzaj: p.get('utm_content') ?? undefined,
      klik: p.get('gclid') ?? p.get('fbclid') ?? undefined,
      referer: interni ? undefined : ref || undefined,
      landing: window.location.pathname || '/',
      ts: new Date().toISOString(),
    }
    window.localStorage.setItem(KLJUC, JSON.stringify(a))
  } catch {
    /* localStorage blokiran (privatni način) — atribucija se preskače */
  }
}

/** Vraća spremljenu first-touch atribuciju (prazan objekat ako nema). */
export function dajAtribuciju(): Atribucija {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(KLJUC)
    return raw ? (JSON.parse(raw) as Atribucija) : {}
  } catch {
    return {}
  }
}

const veliko = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Čitljiva oznaka za „Kako ste čuli za nas" vrijednost. */
export function labelKakoCuo(value?: string | null): string {
  if (!value) return ''
  return KAKO_CULI.find((o) => o.value === value)?.label ?? value
}

/**
 * Normalizovan kanal leada za izvještaje (dashboard + CSV):
 * prioritet izvorCuo (ljudski odgovor) > UTM izvor > referrer > „Web / direktno".
 */
export function kanalLeada(u: {
  izvorCuo?: string | null
  utmIzvor?: string | null
  referer?: string | null
}): string {
  if (u.izvorCuo) return labelKakoCuo(u.izvorCuo)
  if (u.utmIzvor) return veliko(u.utmIzvor)
  if (u.referer) {
    try {
      const host = new URL(u.referer).host.replace(/^www\./, '')
      if (/google\./.test(host)) return 'Google pretraga'
      if (/(facebook\.|fb\.)/.test(host)) return 'Facebook'
      if (/instagram\./.test(host)) return 'Instagram'
      return host
    } catch {
      return 'Vanjski link'
    }
  }
  return 'Web / direktno'
}
