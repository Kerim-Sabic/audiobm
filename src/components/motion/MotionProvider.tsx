'use client'

import { LazyMotion, domAnimation, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * Globalna motion konfiguracija:
 *  - LazyMotion drži motion JS unutar budžeta (≤30KB gzip)
 *  - reducedMotion="user" automatski gasi transform animacije
 *    za korisnike sa prefers-reduced-motion (ostaje samo prozirnost)
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
