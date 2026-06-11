'use client'

import { m, AnimatePresence } from 'motion/react'
import { Menu, X, Phone } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { telHref } from '@/components/ui/TelefonLink'
import { zabiljezi } from '@/lib/analytics'

/** Mobilni meni: pristupačan dijalog, velike dodirne površine, zatvara se pri navigaciji. */
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
    return () => {
      document.body.style.overflow = ''
    }
  }, [otvoren])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={otvoren}
        aria-label={otvoren ? 'Zatvorite meni' : 'Otvorite meni'}
        onClick={() => setOtvoren((o) => !o)}
        className="grid size-12 cursor-pointer place-items-center rounded-md text-neutral-700 transition-colors duration-150 hover:bg-neutral-100"
      >
        {otvoren ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
      </button>

      <AnimatePresence>
        {otvoren && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto bg-white md:top-20"
            role="dialog"
            aria-label="Glavni meni"
          >
            <nav className="kontejner py-6" aria-label="Mobilna navigacija">
              <ul className="space-y-1">
                {stavke.map((s) => (
                  <li key={s.putanja}>
                    <Link
                      href={s.putanja}
                      className="block rounded-md px-4 py-3.5 text-[18px] font-semibold text-neutral-800 transition-colors duration-150 hover:bg-neutral-100"
                    >
                      {s.oznaka}
                    </Link>
                  </li>
                ))}
              </ul>
              {telefon && (
                <a
                  href={telHref(telefon)}
                  onClick={() => zabiljezi('call_click', { lokacija: 'mobilni-meni' })}
                  className="telefon mt-6 flex items-center justify-center gap-3 rounded-[12px] bg-neutral-100 px-4 py-4 text-[20px] text-neutral-900"
                >
                  <Phone className="size-5 text-brand-600" aria-hidden />
                  {telefon}
                </a>
              )}
              <Link
                href="/zakazivanje"
                className="mt-3 flex min-h-12 items-center justify-center rounded-[12px] bg-brand-600 px-4 py-3.5 text-[17px] font-semibold text-white transition-colors duration-150 hover:bg-brand-700"
              >
                Zakažite besplatnu provjeru sluha
              </Link>
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
