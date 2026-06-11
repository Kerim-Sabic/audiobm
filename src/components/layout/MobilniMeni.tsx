'use client'

import { m, AnimatePresence } from 'motion/react'
import {
  Menu,
  X,
  Phone,
  CalendarCheck,
  ChevronRight,
  Ear,
  Stethoscope,
  Package,
  MapPin,
  Wallet,
  BookOpen,
  Mail,
  Home,
  Headphones,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { telHref } from '@/components/ui/TelefonLink'
import { zabiljezi } from '@/lib/analytics'

const EASE = [0.22, 1, 0.36, 1] as const

const IKONE_RUTA: Record<string, typeof Ear> = {
  '/': Home,
  '/slusni-aparati': Ear,
  '/usluge': Stethoscope,
  '/proizvodi': Package,
  '/poslovnice': MapPin,
  '/cijene-i-finansiranje': Wallet,
  '/savjeti': BookOpen,
  '/kontakt': Mail,
  '/online-test-sluha': Headphones,
}

/**
 * Mobilni meni — ladica preko cijele visine ekrana, poput medicinske aplikacije:
 * vlastito zaglavlje sa logotipom, velike dodirne stavke sa ikonama,
 * aktivna ruta jasno označena, telefon i CTA usidreni pri dnu (dohvat palca).
 */
export function MobilniMeni({
  stavke,
  telefon,
}: {
  stavke: { oznaka: string; putanja: string }[]
  telefon?: string
}) {
  const [otvoren, setOtvoren] = useState(false)
  // portal cilj postoji tek nakon montiranja (SSR nema document)
  const [montiran, setMontiran] = useState(false)
  const putanja = usePathname()

  useEffect(() => setMontiran(true), [])
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
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={otvoren}
        aria-label="Otvorite meni"
        onClick={() => setOtvoren(true)}
        className="grid size-11 cursor-pointer place-items-center rounded-full border border-neutral-200 bg-white text-neutral-800 transition-colors duration-150 hover:bg-neutral-50"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {/* portal na <body>: backdrop-blur na zaglavlju pravi containing block
          za fixed elemente, pa ladica unutar zaglavlja ne bi pokrila ekran */}
      {montiran &&
        createPortal(
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
              className="fixed inset-0 z-50 cursor-default bg-charcoal/40 backdrop-blur-[3px]"
            />
            {/* ladica */}
            <m.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.34, ease: EASE }}
              className="fixed inset-y-0 right-0 z-50 flex w-[min(400px,94vw)] flex-col bg-white shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Glavni meni"
            >
              {/* zaglavlje ladice */}
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-100 px-5">
                <Image src="/brand/logo-600.png" alt="Audio BM" width={134} height={28} className="h-6 w-auto" />
                <button
                  type="button"
                  onClick={() => setOtvoren(false)}
                  aria-label="Zatvorite meni"
                  className="grid size-10 cursor-pointer place-items-center rounded-full bg-neutral-100 text-neutral-700 transition-colors duration-150 hover:bg-neutral-200"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4" aria-label="Mobilna navigacija">
                <ul className="space-y-1">
                  {stavke.map((s, i) => {
                    const aktivna =
                      putanja === s.putanja || (s.putanja !== '/' && putanja.startsWith(s.putanja))
                    const Ikona = IKONE_RUTA[s.putanja] ?? ChevronRight
                    return (
                      <m.li
                        key={s.putanja}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.06 + i * 0.04, duration: 0.32, ease: EASE }}
                      >
                        <Link
                          href={s.putanja}
                          aria-current={aktivna ? 'page' : undefined}
                          className={`flex min-h-[54px] items-center gap-3.5 rounded-2xl px-3.5 py-3 text-[17px] font-semibold transition-colors duration-150 ${
                            aktivna ? 'bg-brand-50 text-brand-800' : 'text-neutral-800 hover:bg-neutral-100'
                          }`}
                        >
                          <span
                            className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                              aktivna ? 'bg-white text-brand-600 shadow-sm' : 'bg-neutral-100 text-neutral-500'
                            }`}
                          >
                            <Ikona className="size-5" strokeWidth={1.9} aria-hidden />
                          </span>
                          {s.oznaka}
                          <ChevronRight
                            className={`ml-auto size-5 ${aktivna ? 'text-brand-400' : 'text-neutral-300'}`}
                            aria-hidden
                          />
                        </Link>
                      </m.li>
                    )
                  })}
                </ul>
              </nav>

              {/* kontakt blok pri dnu — dohvat palca */}
              <div className="safe-bottom shrink-0 space-y-2.5 border-t border-neutral-100 bg-neutral-50 p-4">
                <Link
                  href="/zakazivanje"
                  className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-brand-600 px-4 py-3.5 text-[17px] font-semibold text-white shadow-[var(--shadow-cta)]"
                >
                  <CalendarCheck className="size-5" aria-hidden />
                  Zakažite besplatnu provjeru
                </Link>
                {telefon && (
                  <a
                    href={telHref(telefon)}
                    onClick={() => zabiljezi('call_click', { lokacija: 'mobilni-meni' })}
                    className="telefon flex min-h-[52px] items-center justify-center gap-2.5 rounded-full border border-neutral-200 bg-white px-4 py-3.5 text-[18px] text-neutral-900"
                  >
                    <Phone className="size-5 text-brand-600" aria-hidden />
                    {telefon}
                  </a>
                )}
                <p className="text-center text-[13px] text-neutral-500">
                  Besplatno i bez obaveze · odgovaramo isti radni dan
                </p>
              </div>
            </m.div>
          </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  )
}
