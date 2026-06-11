'use client'

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'

/**
 * Otkrivanje pri skrolanju — robusna izvedba bez JS animacija:
 * IntersectionObserver dodaje CSS klasu, CSS prelaz radi ostalo.
 * Sigurnosna mreža: sadržaj se BEZUSLOVNO prikazuje nakon 2 s,
 * pa nijedna sekcija nikad ne ostaje nevidljiva (brzo skrolanje,
 * stariji uređaji, ugašen JS — SSR sadržaj je vidljiv i bez JS-a).
 */

let posmatrac: IntersectionObserver | null = null
const cekanje = new Set<Element>()

function posmatraj(el: Element) {
  if (typeof window === 'undefined') return
  if (!('IntersectionObserver' in window)) {
    el.classList.add('otkrij-vidljivo')
    return
  }
  posmatrac ??= new IntersectionObserver(
    (unosi) => {
      for (const u of unosi) {
        if (u.isIntersecting) {
          u.target.classList.add('otkrij-vidljivo')
          posmatrac?.unobserve(u.target)
          cekanje.delete(u.target)
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  )
  posmatrac.observe(el)
  cekanje.add(el)
  // sigurnosna mreža — prikaži i bez presjeka
  setTimeout(() => {
    if (cekanje.has(el)) {
      el.classList.add('otkrij-vidljivo')
      posmatrac?.unobserve(el)
      cekanje.delete(el)
    }
  }, 2000)
}

export function Otkrij({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article'
}) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (ref.current) posmatraj(ref.current)
  }, [])
  return (
    <Tag
      ref={ref as never}
      data-otkrij
      className={className}
      style={delay ? ({ '--otkrij-kasni': `${Math.round(delay * 1000)}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  )
}

const GrupaKontekst = createContext<{ sljedeci: () => number } | null>(null)

/** Roditelj koji djecu (kartice) otkriva sa 60ms međukorakom. */
export function OtkrijGrupu({
  children,
  className = '',
  stagger = 0.06,
}: {
  children: ReactNode
  className?: string
  stagger?: number
}) {
  const brojac = useRef(0)
  brojac.current = 0
  const korak = Math.round(stagger * 1000)
  return (
    <GrupaKontekst.Provider value={{ sljedeci: () => brojac.current++ * korak }}>
      <div className={className}>{children}</div>
    </GrupaKontekst.Provider>
  )
}

/** Dijete unutar OtkrijGrupu. */
export function OtkrijStavku({ children, className = '' }: { children: ReactNode; className?: string }) {
  const grupa = useContext(GrupaKontekst)
  const kasni = useRef<number | null>(null)
  if (kasni.current === null) kasni.current = grupa?.sljedeci() ?? 0
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) posmatraj(ref.current)
  }, [])
  return (
    <div
      ref={ref}
      data-otkrij
      className={className}
      style={kasni.current ? ({ '--otkrij-kasni': `${kasni.current}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  )
}
