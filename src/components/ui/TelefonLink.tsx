'use client'

import { Phone } from 'lucide-react'
import { zabiljezi } from '@/lib/analytics'

/** Pretvara „051 218 781" u tel:+38751218781. */
export function telHref(broj: string): string {
  const cifre = broj.replace(/\D/g, '')
  if (cifre.startsWith('387')) return `tel:+${cifre}`
  if (cifre.startsWith('0')) return `tel:+387${cifre.slice(1)}`
  return `tel:+387${cifre}`
}

/** Klik-poziv: veliki, podebljan broj sa tabelarnim ciframa + analitika. */
export function TelefonLink({
  broj,
  lokacija,
  className = '',
  saIkonom = true,
}: {
  broj: string
  lokacija?: string
  className?: string
  saIkonom?: boolean
}) {
  return (
    <a
      href={telHref(broj)}
      onClick={() => zabiljezi('call_click', { lokacija: lokacija ?? 'opšte' })}
      className={`telefon inline-flex items-center gap-2 transition-colors duration-150 ${className}`}
    >
      {saIkonom && <Phone className="size-[1.1em] shrink-0" aria-hidden strokeWidth={2} />}
      <span>{broj}</span>
    </a>
  )
}

/** WhatsApp dugme sa unaprijed ispunjenom porukom i kontekstom stranice. */
export function WhatsAppLink({
  broj,
  lokacija,
  poruka,
  className = '',
  children,
}: {
  broj: string
  lokacija?: string
  poruka?: string
  className?: string
  children?: React.ReactNode
}) {
  const cifre = broj.replace(/\D/g, '')
  const tekst = encodeURIComponent(poruka ?? 'Poštovani, javljam se sa web stranice Audio BM. ')
  return (
    <a
      href={`https://wa.me/${cifre}?text=${tekst}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => zabiljezi('whatsapp_click', { lokacija: lokacija ?? 'opšte' })}
      className={className}
    >
      {children ?? 'WhatsApp'}
    </a>
  )
}

/** Viber dugme (viber://chat deep link). */
export function ViberLink({
  broj,
  lokacija,
  className = '',
  children,
}: {
  broj: string
  lokacija?: string
  className?: string
  children?: React.ReactNode
}) {
  const cifre = broj.replace(/\D/g, '')
  return (
    <a
      href={`viber://chat?number=%2B${cifre}`}
      onClick={() => zabiljezi('viber_click', { lokacija: lokacija ?? 'opšte' })}
      className={className}
    >
      {children ?? 'Viber'}
    </a>
  )
}
