'use client'

import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Varijanta = 'primarno' | 'sekundarno' | 'duh' | 'destruktivno'
type Velicina = 'normalno' | 'veliko'

const osnova =
  'inline-flex items-center justify-center gap-2 rounded-[12px] font-semibold cursor-pointer select-none ' +
  'transition-[background-color,box-shadow,transform] duration-150 ' +
  'hover:-translate-y-px active:translate-y-0 active:scale-[0.98] ' +
  'disabled:pointer-events-none disabled:opacity-60 ' +
  'min-h-12' // 48px ciljna površina

const varijante: Record<Varijanta, string> = {
  primarno:
    'bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[0_8px_20px_-6px_rgb(237_28_36/0.45)] ' +
    'hover:from-brand-600 hover:to-brand-700 hover:shadow-[0_12px_26px_-6px_rgb(237_28_36/0.5)]',
  sekundarno:
    'bg-white text-neutral-900 border border-neutral-300 shadow-sm hover:border-neutral-400 hover:bg-neutral-50 hover:shadow-md',
  duh: 'bg-transparent text-brand-700 hover:bg-brand-50',
  destruktivno: 'bg-error-600 text-white shadow-sm hover:bg-red-800 hover:shadow-md',
}

const velicine: Record<Velicina, string> = {
  normalno: 'px-5 py-3 text-[16px]',
  veliko: 'px-7 py-3.5 text-[17px] md:text-[18px]',
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
