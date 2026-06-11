'use client'

import { m, AnimatePresence } from 'motion/react'
import { Phone, CalendarCheck } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { telHref } from '@/components/ui/TelefonLink'
import { zabiljezi } from '@/lib/analytics'

/**
 * Ljepljiva mobilna traka: poziv + zakazivanje, uvijek na dohvat palca.
 * Pojavljuje se (opruga) nakon 120px skrola, sakriva se pri brzom skrolu naniže,
 * vraća pri skrolu naviše; uvijek vidljiva dok je obrazac u ekranu.
 */
export function LjepljivaTraka({ telefon }: { telefon?: string }) {
  const [vidljiva, setVidljiva] = useState(false)
  const formaUEkranu = useRef(false)
  const zadnjiY = useRef(0)
  const putanja = usePathname()

  useEffect(() => {
    const posmatrac = new IntersectionObserver(
      (unosi) => {
        formaUEkranu.current = unosi.some((u) => u.isIntersecting)
        if (formaUEkranu.current) setVidljiva(true)
      },
      { threshold: 0.1 },
    )
    document.querySelectorAll('[data-forma]').forEach((el) => posmatrac.observe(el))

    const naSkrol = () => {
      const y = window.scrollY
      const razlika = y - zadnjiY.current
      zadnjiY.current = y
      if (formaUEkranu.current) {
        setVidljiva(true)
        return
      }
      if (y < 120) setVidljiva(false)
      else if (razlika > 14) setVidljiva(false) // brzi skrol naniže
      else if (razlika < -4) setVidljiva(true) // skrol naviše
      else if (!vidljiva && y > 120 && Math.abs(razlika) < 4) setVidljiva(true)
    }
    window.addEventListener('scroll', naSkrol, { passive: true })
    naSkrol()
    return () => {
      window.removeEventListener('scroll', naSkrol)
      posmatrac.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [putanja])

  // na stranici zakazivanja ne dupliramo CTA;
  // tokom online testa sluha traka bi prekrivala kontrole testa (fokusirani način)
  if (putanja === '/zakazivanje' || putanja === '/online-test-sluha') return null

  return (
    <AnimatePresence>
      {vidljiva && (
        <m.div
          initial={{ y: 96 }}
          animate={{ y: 0 }}
          exit={{ y: 96 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/97 shadow-[0_-4px_16px_rgb(28_25_23/0.08)] backdrop-blur-sm md:hidden"
        >
          <div className="grid grid-cols-2 gap-2 p-2.5">
            {telefon ? (
              <a
                href={telHref(telefon)}
                onClick={() => zabiljezi('call_click', { lokacija: 'mobilna-traka' })}
                className="telefon flex min-h-12 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-3 text-[16px] text-neutral-900"
              >
                <Phone className="size-5 text-brand-600" aria-hidden />
                Pozovite nas
              </a>
            ) : (
              <span />
            )}
            <Link
              href="/zakazivanje"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-600 px-3 text-[16px] font-semibold text-white shadow-[var(--shadow-cta)]"
            >
              <CalendarCheck className="size-5" aria-hidden />
              Zakažite termin
            </Link>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
