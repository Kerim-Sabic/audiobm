'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const ZvucniTalasi = dynamic(() => import('./ZvucniTalasi'), { ssr: false })

/**
 * Učitava 3D scenu samo kad ima smisla: desktop, bez smanjenih animacija,
 * i tek nakon što je stranica interaktivna (ne blokira LCP).
 */
export function ZvucniTalasiOmot() {
  const [prikazi, setPrikazi] = useState(false)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)').matches
    const smanjeno = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const slabaVeza = (navigator as { connection?: { saveData?: boolean } }).connection?.saveData
    if (desktop && !smanjeno && !slabaVeza) {
      const id = window.requestIdleCallback
        ? window.requestIdleCallback(() => setPrikazi(true), { timeout: 2500 })
        : window.setTimeout(() => setPrikazi(true), 800)
      return () => {
        if (window.cancelIdleCallback && typeof id === 'number') window.cancelIdleCallback(id)
        else clearTimeout(id as number)
      }
    }
  }, [])

  if (!prikazi) return null
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 w-[62%] overflow-hidden" aria-hidden>
      <ZvucniTalasi />
      {/* prelaz prema bijelom samo na lijevoj strani — tekst ostaje čitljiv,
          talasi vidljivi oko fotografije */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
      <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/80 to-transparent" />
    </div>
  )
}
