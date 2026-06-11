'use client'

import { useEffect, useRef, useState } from 'react'

const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5)

/**
 * Brojač statistike: broji do cilja 1,2 s (rAF, bez biblioteka), jednom kad
 * uđe u ekran. Sigurnosna mreža prikazuje konačan broj nakon 2,5 s u svakom
 * slučaju; uz smanjene animacije broj se prikazuje odmah.
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
  const [vrijednost, setVrijednost] = useState(0)
  const pokrenut = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const pokreni = () => {
      if (pokrenut.current) return
      pokrenut.current = true
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setVrijednost(cilj)
        return
      }
      const start = performance.now()
      const korak = (sada: number) => {
        const t = Math.min((sada - start) / 1200, 1)
        setVrijednost(Math.round(easeOutQuint(t) * cilj))
        if (t < 1) requestAnimationFrame(korak)
      }
      requestAnimationFrame(korak)
    }

    let posmatrac: IntersectionObserver | undefined
    if ('IntersectionObserver' in window) {
      posmatrac = new IntersectionObserver(
        (unosi) => {
          if (unosi.some((u) => u.isIntersecting)) {
            pokreni()
            posmatrac?.disconnect()
          }
        },
        { threshold: 0.4 },
      )
      posmatrac.observe(el)
    }
    const rezerva = setTimeout(pokreni, 2500)
    return () => {
      posmatrac?.disconnect()
      clearTimeout(rezerva)
    }
  }, [cilj])

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {vrijednost}
      {sufiks}
    </span>
  )
}
