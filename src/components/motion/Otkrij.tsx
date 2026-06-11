'use client'

import { m } from 'motion/react'
import type { ReactNode } from 'react'

const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const

/**
 * Otkrivanje sekcije pri skrolanju: fade-up 16px na 20% presjeka, jednom.
 * Dovoljno suptilno da se ne doživljava kao „animacija".
 */
export function Otkrij({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article'
}) {
  const Tag = (m as Record<string, any>)[as] ?? m.div
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay, ease: EASE_OUT_QUINT }}
    >
      {children}
    </Tag>
  )
}

/** Roditelj koji djecu (kartice) otkriva sa 60ms međukorakom. */
export function OtkrijGrupu({
  children,
  className,
  stagger = 0.06,
}: {
  children: ReactNode
  className?: string
  stagger?: number
}) {
  return (
    <m.div
      className={className}
      initial="sakriveno"
      whileInView="vidljivo"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        sakriveno: {},
        vidljivo: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </m.div>
  )
}

/** Dijete unutar OtkrijGrupu. */
export function OtkrijStavku({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div
      className={className}
      variants={{
        sakriveno: { opacity: 0, y: 16 },
        vidljivo: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT_QUINT } },
      }}
    >
      {children}
    </m.div>
  )
}
