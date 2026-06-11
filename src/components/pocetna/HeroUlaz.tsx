'use client'

import { useEffect, useRef } from 'react'

const KLJUC = 'audiobm-hero-odigran'

/**
 * Pokreće hero animaciju (CSS klasa) samo jednom po sesiji —
 * pri povratku na početnu se ne ponavlja. Bez pomjeranja rasporeda.
 */
export function HeroUlaz({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(KLJUC)) {
        ref.current?.classList.add('hero-animira')
        sessionStorage.setItem(KLJUC, '1')
      }
    } catch {
      /* privatni način rada — bez animacije */
    }
  }, [])

  return <div ref={ref}>{children}</div>
}
