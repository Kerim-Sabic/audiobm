'use client'

import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Varijanta = 'primarno' | 'sekundarno' | 'duh' | 'tamno' | 'destruktivno'
type Velicina = 'malo' | 'normalno' | 'veliko'

const osnova =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold cursor-pointer select-none whitespace-nowrap ' +
  'transition-[background-color,border-color,box-shadow,transform] duration-150 ' +
  'hover:-translate-y-px active:translate-y-0 active:scale-[0.985] ' +
  'disabled:pointer-events-none disabled:opacity-60'

const varijante: Record<Varijanta, string> = {
  primarno:
    'bg-brand-600 text-white shadow-[var(--shadow-cta)] ' +
    'hover:bg-brand-700 hover:shadow-[var(--shadow-cta-hover)]',
  sekundarno:
    'bg-white text-neutral-900 border border-neutral-300 shadow-sm hover:border-neutral-400 hover:bg-neutral-50',
  duh: 'bg-transparent text-brand-700 hover:bg-brand-50',
  tamno:
    'bg-white/10 text-white border border-white/20 backdrop-blur-sm hover:bg-white/15 hover:border-white/30',
  destruktivno: 'bg-error-600 text-white shadow-sm hover:bg-red-800',
}

const velicine: Record<Velicina, string> = {
  malo: 'min-h-10 px-4 py-2 text-[15px]',
  normalno: 'min-h-12 px-6 py-3 text-[16px]',
  veliko: 'min-h-[52px] px-8 py-3.5 text-[17px] md:text-[18px]',
}

type Zajednicko = {
  varijanta?: Varijanta
  velicina?: Velicina
  ucitava?: boolean
  className?: string
  children: ReactNode
}

export function Dugme({
  varijanta = 'primarno',
  velicina = 'normalno',
  ucitava = false,
  className = '',
  children,
  ...rest
}: Zajednicko & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${osnova} ${varijante[varijanta]} ${velicine[velicina]} ${className}`}
      disabled={ucitava || rest.disabled}
      {...rest}
    >
      {ucitava ? (
        <>
          <Loader2 className="size-5 animate-spin" aria-hidden />
          <span>Šaljemo…</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export function DugmeLink({
  varijanta = 'primarno',
  velicina = 'normalno',
  href,
  className = '',
  children,
  onClick,
}: Zajednicko & { href: string; onClick?: () => void }) {
  const vanjski = href.startsWith('http') || href.startsWith('tel:') || href.startsWith('viber:')
  if (vanjski) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={`${osnova} ${varijante[varijanta]} ${velicine[velicina]} ${className}`}
        {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    )
  }
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${osnova} ${varijante[varijanta]} ${velicine[velicina]} ${className}`}
    >
      {children}
    </Link>
  )
}
