'use client'

import { m, AnimatePresence } from 'motion/react'
import { X, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { zabiljezi } from '@/lib/analytics'

const KLJUC = 'audiobm-baner-sakriven'
const SEDAM_DANA = 7 * 24 * 60 * 60 * 1000

/**
 * Promo baner (otvaranje u Sarajevu / akcije): blagi fade-down pri prvom učitavanju,
 * zatvaranje pamti izbor 7 dana.
 */
export function PromoBaner({ tekst, link }: { tekst: string; link: string }) {
  const [vidljiv, setVidljiv] = useState(false)

  useEffect(() => {
    try {
      const sakriven = localStorage.getItem(KLJUC)
      if (sakriven && Date.now() - Number(sakriven) < SEDAM_DANA) return
    } catch {
      /* privatni način rada */
    }
    setVidljiv(true)
  }, [])

  const zatvori = () => {
    setVidljiv(false)
    try {
      localStorage.setItem(KLJUC, String(Date.now()))
    } catch {
      /* ignorisano */
    }
  }

  return (
    <AnimatePresence initial>
      {vidljiv && (
        <m.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden bg-brand-50 text-brand-900"
        >
          <div className="kontejner flex items-center justify-between gap-3 py-2.5">
            <Link
              href={link}
              onClick={() => zabiljezi('promo_click', { baner: 'sarajevo' })}
              className="flex items-center gap-2 text-[15px] font-semibold hover:underline md:text-[16px]"
            >
              <MapPin className="size-4 shrink-0 text-brand-600" aria-hidden />
              <span>{tekst}</span>
            </Link>
            <button
              type="button"
              onClick={zatvori}
              aria-label="Zatvorite obavještenje"
              className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full transition-colors duration-150 hover:bg-brand-100"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
