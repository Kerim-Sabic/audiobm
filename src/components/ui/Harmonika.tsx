'use client'

import { Plus } from 'lucide-react'
import { useState, useId } from 'react'

export type PitanjeOdgovor = { pitanje: string; odgovor: string }

/**
 * FAQ harmonika: visinska animacija 250ms (grid-rows trik — bez skoka rasporeda),
 * plus rotira u X, ARIA ispravno, prva stavka otvorena.
 * Izgled: samostalne mekane površine umjesto guste tabele.
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
    <div className="space-y-3">
      {stavke.map((stavka, i) => {
        const jeOtvoreno = otvoreno === i
        return (
          <div
            key={i}
            className={`povrsina overflow-hidden !rounded-[18px] transition-[border-color,box-shadow] duration-250 ${
              jeOtvoreno ? 'border-neutral-300 shadow-[var(--shadow-lift-lg)]' : ''
            }`}
          >
            <h3>
              <button
                type="button"
                aria-expanded={jeOtvoreno}
                aria-controls={`${baseId}-panel-${i}`}
                id={`${baseId}-dugme-${i}`}
                onClick={() => setOtvoreno(jeOtvoreno ? null : i)}
                className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 px-5 py-4.5 text-left text-[17px] font-semibold text-neutral-900 transition-colors duration-150 hover:text-brand-700 md:px-6"
              >
                {stavka.pitanje}
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full transition-[background-color,transform] duration-250 ${
                    jeOtvoreno ? 'rotate-45 bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-600'
                  }`}
                  aria-hidden
                >
                  <Plus className="size-4.5" strokeWidth={2.25} />
                </span>
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
                <p className="max-w-3xl px-5 pb-5 text-neutral-600 md:px-6">{stavka.odgovor}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
