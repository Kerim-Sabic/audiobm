'use client'

import { ChevronDown } from 'lucide-react'
import { useState, useId } from 'react'

export type PitanjeOdgovor = { pitanje: string; odgovor: string }

/**
 * FAQ harmonika: visinska animacija 250ms (grid-rows trik — bez skoka rasporeda),
 * strelica rotira 180°, ARIA ispravno, prva stavka otvorena.
 */
export function Harmonika({
  stavke,
  prvaOtvorena = true,
}: {
  stavke: PitanjeOdgovor[]
  prvaOtvorena?: boolean
}) {
  const [otvoreno, setOtvoreno] = useState<number | null>(prvaOtvorena ? 0 : null)
  const baseId = useId()

  return (
    <div className="divide-y divide-neutral-200 rounded-[16px] border border-neutral-200 bg-white">
      {stavke.map((stavka, i) => {
        const jeOtvoreno = otvoreno === i
        return (
          <div key={i}>
            <h3>
              <button
                type="button"
                aria-expanded={jeOtvoreno}
                aria-controls={`${baseId}-panel-${i}`}
                id={`${baseId}-dugme-${i}`}
                onClick={() => setOtvoreno(jeOtvoreno ? null : i)}
                className="flex min-h-12 w-full items-center justify-between gap-4 px-5 py-4 text-left text-[17px] font-semibold text-neutral-900 transition-colors duration-150 hover:bg-neutral-50 md:px-6"
              >
                {stavka.pitanje}
                <ChevronDown
                  aria-hidden
                  className={`size-5 shrink-0 text-brand-600 transition-transform duration-250 ${jeOtvoreno ? 'rotate-180' : ''}`}
                />
              </button>
            </h3>
            <div
              id={`${baseId}-panel-${i}`}
              role="region"
              aria-labelledby={`${baseId}-dugme-${i}`}
              className="grid transition-[grid-template-rows] duration-250 ease-in-out"
              style={{ gridTemplateRows: jeOtvoreno ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-neutral-700 md:px-6">{stavka.odgovor}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
