'use client'

import { m, AnimatePresence } from 'motion/react'
import { Menu, X, Phone, CalendarCheck, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { telHref } from '@/components/ui/TelefonLink'
import { zabiljezi } from '@/lib/analytics'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Mobilni meni: panel koji uklizava zdesna, postepeni ulaz stavki,
 * aktivna ruta istaknuta, telefon i CTA uvijek pri dnu — sve na dohvat palca.
 */
export function MobilniMeni({
  stavke,
  telefon,
}: {
  stavke: { oznaka: string; putanja: string }[]
  telefon?: string
}) {
  const [otvoren, setOtvoren] = useState(false)
  const putanja = usePathname()

  useEffect(() => setOtvoren(false), [putanja])

  useEffect(() => {
    document.body.style.overflow = otvoren ? 'hidden' : ''
    const naEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOtvoren(false)
    }
    window.addEventListener('keydown', naEsc)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', naEsc)
    }
  }, [otvoren])

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-expanded={otvoren}
        aria-label={otvoren ? 'Zatvorite meni' : 'Otvorite meni'}
        onClick={() => setOtvoren((o) => !o)}
        className="grid size-12 cursor-pointer place-items-center rounded-xl text-neutral-700 transition-colors duration-150 hover:bg-neutral-100"
      >
        {otvoren ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
      </button>

      <AnimatePresence>
        {otvoren && (
          <>
            {/* zatamnjena pozadina */}
            <m.button
              type="button"
              aria-label="Zatvorite meni"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOtvoren(false)}
              className="fixed inset-0 top-[68px] z-40 cursor-default bg-neutral-900/30 backdrop-blur-[2px] md:top-20"
            />
            {/* panel */}
            <m.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: EASE }}
              className="fixed top-[68px] right-0 bottom-0 z-50 flex w-[min(380px,92vw)] flex-col overflow-y-auto bg-white shadow-2xl md:top-20"
              role="dialog"
              aria-label="Glavni meni"
            >
              <nav className="flex-1 p-5" aria-label="Mobilna navigacija">
                <ul className="space-y-1">
                  {stavke.map((s, i) => {
                    const aktivna = putanja === s.putanja || (s.putanja !== '/' && putanja.startsWith(s.putanja))
                    return (
                      <m.li
                        key={s.putanja}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.04, duration: 0.3, ease: EASE }}
                      >
                        <Link
                          href={s.putanja}
                          aria-current={aktivna ? 'page' : undefined}
                          className={`flex min-h-12 items-center justify-between rounded-xl px-4 py-3.5 text-[18px] font-semibold transition-colors duration-150 ${
                            aktivna
                              ? 'bg-brand-50 text-brand-700'
                              : 'text-neutral-800 hover:bg-neutral-100'
                          }`}
                        >
                          {s.oznaka}
                          <ChevronRight className={`size-5 ${aktivna ? 'text-brand-400' : 'text-neutral-300'}`} aria-hidden />
                        </Link>
                      </m.li>
                    )
                  })}
                </ul>
              </nav>

              {/* kontakt blok pri dnu */}
              <div className="safe-bottom space-y-3 border-t border-neutral-100 bg-neutral-50 p-5">
                {telefon && (
                  <a
                    href={telHref(telefon)}
                    onClick={() => zabiljezi('call_click', { lokacija: 'mobilni-meni' })}
                    className="telefon flex min-h-12 items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-[20px] text-neutral-900 shadow-sm"
                  >
                    <Phone className="size-5 text-brand-600" aria-hidden />
                    {telefon}
                  </a>
                )}
                <Link
                  href="/zakazivanje"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-3.5 text-[17px] font-semibold text-white shadow-[0_8px_20px_-6px_rgb(237_28_36/0.45)]"
                >
                  <CalendarCheck className="size-5" aria-hidden />
                  Zakažite besplatnu provjeru
                </Link>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
