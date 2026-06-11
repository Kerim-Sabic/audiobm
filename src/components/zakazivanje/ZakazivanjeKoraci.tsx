'use client'

import { m, AnimatePresence } from 'motion/react'
import { MapPin, ChevronLeft } from 'lucide-react'
import { useActionState, useEffect, useRef, useState } from 'react'
import { posaljiUpit, type StanjeObrasca } from '@/app/actions/posaljiUpit'
import { Dugme } from '@/components/ui/Dugme'
import { PoljeUnos, PoljeTekst, PoljeSaglasnost } from '@/components/ui/Polje'
import { Honeypot, Turnstile } from '@/components/ui/Turnstile'
import { TelefonLink } from '@/components/ui/TelefonLink'
import { zabiljezi } from '@/lib/analytics'

export type LokacijaIzbor = {
  id: number
  naziv: string
  grad: string
  adresa: string
  telefon?: string
  novaPoslovnica?: boolean
}

const EASE = [0.22, 1, 0.36, 1] as const
const pocetno: StanjeObrasca = { status: 'pocetno' }

/**
 * Zakazivanje u 3 koraka, ispod 2 minute:
 * 1) izbor poslovnice → 2) ime + telefon → 3) potvrda.
 */
export function ZakazivanjeKoraci({
  lokacije,
  predodabranaLokacija,
}: {
  lokacije: LokacijaIzbor[]
  predodabranaLokacija?: number
}) {
  const [korak, setKorak] = useState(predodabranaLokacija ? 2 : 1)
  const [lokacija, setLokacija] = useState<LokacijaIzbor | null>(
    lokacije.find((l) => l.id === predodabranaLokacija) ?? null,
  )
  const [stanje, akcija, salje] = useActionState(posaljiUpit, pocetno)
  const pokrenuto = useRef(false)

  useEffect(() => {
    if (stanje.status === 'uspjeh') {
      setKorak(3)
      zabiljezi('booking_complete', { lokacija: lokacija?.grad ?? 'nepoznato' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [stanje.status, lokacija?.grad])

  const odaberiLokaciju = (l: LokacijaIzbor) => {
    if (!pokrenuto.current) {
      pokrenuto.current = true
      zabiljezi('booking_start', { lokacija: l.grad })
    }
    setLokacija(l)
    setKorak(2)
  }

  return (
    <div data-forma>
      {/* indikator koraka */}
      <ol className="mb-8 flex items-center gap-2" aria-label="Koraci zakazivanja">
        {[1, 2, 3].map((k) => (
          <li key={k} className="flex flex-1 flex-col gap-1.5" aria-current={korak === k ? 'step' : undefined}>
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-brand-600 transition-[width] duration-300 ease-out"
                style={{ width: korak >= k ? '100%' : '0%' }}
              />
            </div>
            <span className={`text-small ${korak >= k ? 'font-semibold text-neutral-800' : 'text-neutral-500'}`}>
              {k === 1 ? '1. Poslovnica' : k === 2 ? '2. Vaši podaci' : '3. Potvrda'}
            </span>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        {korak === 1 && (
          <m.div
            key="korak1"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <h2 className="text-h3 mb-2">Gdje Vam najviše odgovara?</h2>
            <p className="mb-6 text-neutral-600">Odaberite poslovnicu u koju želite doći.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {lokacije.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => odaberiLokaciju(l)}
                  className="group flex min-h-12 cursor-pointer items-start gap-3 rounded-[16px] border border-neutral-300 bg-white p-5 text-left shadow-sm transition-[box-shadow,transform,border-color] duration-250 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
                >
                  <MapPin className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                  <span>
                    <span className="flex items-center gap-2 text-[18px] font-bold text-neutral-900">
                      {l.grad}
                      {l.novaPoslovnica && (
                        <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold tracking-wide text-white uppercase">
                          Novo
                        </span>
                      )}
                    </span>
                    {l.adresa && (
                      <span className="mt-0.5 block text-[15px] text-neutral-600">{l.adresa}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </m.div>
        )}

        {korak === 2 && lokacija && (
          <m.div
            key="korak2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <button
              type="button"
              onClick={() => setKorak(1)}
              className="mb-4 inline-flex min-h-12 cursor-pointer items-center gap-1 text-[15px] font-medium text-neutral-600 transition-colors duration-150 hover:text-neutral-900"
            >
              <ChevronLeft className="size-4" aria-hidden />
              Promijenite poslovnicu
            </button>
            <h2 className="text-h3 mb-2">
              Vaši podaci — poslovnica {lokacija.grad}
            </h2>
            <p className="mb-6 text-neutral-600">
              Trebamo samo ime i broj telefona. Pozvat ćemo Vas da zajedno dogovorimo tačan termin.
            </p>

            <form action={akcija} className="space-y-5">
              <Honeypot />
              <input type="hidden" name="vrsta" value="zakazivanje" />
              <input type="hidden" name="poslovnica" value={lokacija.id} />
              <input type="hidden" name="izvorStranica" value="/zakazivanje" />

              <PoljeUnos
                oznaka="Ime i prezime"
                name="ime"
                autoComplete="name"
                required
                greska={stanje.greske?.ime}
                placeholder="npr. Marija Kovačević"
              />
              <PoljeUnos
                oznaka="Broj telefona"
                name="telefon"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                required
                greska={stanje.greske?.telefon}
                placeholder="npr. 065 123 456"
                pomoc="Pozvat ćemo Vas na ovaj broj radi dogovora o terminu."
              />
              <PoljeUnos
                oznaka="E-mail (nije obavezno)"
                name="email"
                type="email"
                autoComplete="email"
                greska={stanje.greske?.email}
                placeholder="npr. ime@example.com"
              />
              <PoljeUnos
                oznaka="Kada Vam najviše odgovara? (nije obavezno)"
                name="preferiraniTermin"
                placeholder="npr. radnim danima prije podne"
              />
              <PoljeTekst
                oznaka="Napomena (nije obavezno)"
                name="poruka"
                greska={stanje.greske?.poruka}
                placeholder="Ako želite, ukratko opišite Vaš problem sa sluhom."
              />
              <PoljeSaglasnost name="saglasnost" greska={stanje.greske?.saglasnost} />
              <Turnstile />

              {stanje.status === 'greska' && stanje.poruka && (
                <p role="alert" className="rounded-[12px] bg-error-50 px-4 py-3 text-[15px] font-medium text-error-600">
                  {stanje.poruka}
                </p>
              )}

              <Dugme type="submit" velicina="veliko" ucitava={salje} className="w-full sm:w-auto">
                Pošaljite zahtjev za termin
              </Dugme>
            </form>
          </m.div>
        )}

        {korak === 3 && (
          <m.div
            key="korak3"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="rounded-[16px] border border-success-600/20 bg-success-50 p-8 text-center md:p-12"
          >
            <Kvacica />
            <h2 className="text-h2 mt-6 text-neutral-900">Hvala! Vaš zahtjev je zaprimljen.</h2>
            <p className="mx-auto mt-3 max-w-md text-[18px] text-neutral-700">
              Kontaktirat ćemo Vas <strong>isti radni dan</strong> radi potvrde termina
              {lokacija ? ` u poslovnici ${lokacija.grad}` : ''}.
            </p>
            {lokacija?.telefon && !lokacija.telefon.startsWith('[') && (
              <p className="mt-6 text-neutral-600">
                Želite li odmah razgovarati? Pozovite nas:{' '}
                <TelefonLink broj={lokacija.telefon} lokacija={lokacija.grad} className="text-[20px] text-neutral-900" />
              </p>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Dostojanstvena kvačica: iscrtavanje SVG poteza 600ms, zatim mirno. */
function Kvacica() {
  return (
    <m.svg
      viewBox="0 0 52 52"
      className="mx-auto size-16"
      aria-hidden
      initial="sakriveno"
      animate="vidljivo"
    >
      <m.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="#15803D"
        strokeWidth="2.5"
        variants={{
          sakriveno: { pathLength: 0, opacity: 0 },
          vidljivo: { pathLength: 1, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
        }}
      />
      <m.path
        d="M15 27.5 L22.5 35 L37 18.5"
        fill="none"
        stroke="#15803D"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          sakriveno: { pathLength: 0, opacity: 0 },
          vidljivo: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.45, delay: 0.35, ease: 'easeOut' },
          },
        }}
      />
    </m.svg>
  )
}
