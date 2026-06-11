/** Pretvara „051 218 781" u tel:+38751218781 — djeljivo između servera i klijenta. */
export function telHref(broj: string): string {
  const cifre = broj.replace(/\D/g, '')
  if (cifre.startsWith('387')) return `tel:+${cifre}`
  if (cifre.startsWith('0')) return `tel:+387${cifre.slice(1)}`
  return `tel:+387${cifre}`
}
