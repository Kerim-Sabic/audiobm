'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion, animate } from 'motion/react'

/**
 * Brojač statistike (npr. „32 godine"): broji do cilja 1,2 s uz usporavanje,
 * jednom kad uđe u ekran. Uz smanjene animacije prikazuje konačan broj odmah.
 */
export function Brojac({
  do: cilj,
  sufiks = '',
  className,
}: {
  do: number
  sufiks?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const uEkranu = useInView(ref, { once: true, amount: 0.6 })
  const smanjeno = useReducedMotion()
  const [vrijednost, setVrijednost] = useState(smanjeno ? cilj : 0)

  useEffect(() => {
    if (!uEkranu) return
    if (smanjeno) {
      setVrijednost(cilj)
      return
    }
    const kontrola = animate(0, cilj, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVrijednost(Math.round(v)),
    })
    return () => kontrola.stop()
  }, [uEkranu, cilj, smanjeno])

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {vrijednost}
      {sufiks}
    </span>
  )
}
