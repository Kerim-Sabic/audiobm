import { BREND } from '@/lib/brend'

/**
 * Logotip „Svijet Sluha" — vjerno prema brend dizajnu:
 * crveni blok „SVIJET" (bijela slova) + „SLUHA" + kružni znak (zvučni talasi),
 * uz opcioni slogan „Centar za zdravlje sluha".
 *
 * Izvedeno kao tekst + inline SVG (bez rasterskog asseta) — oštro na svakoj
 * veličini, podržava svijetlu i tamnu pozadinu. Ako kasnije poželiš zvanični
 * SVG/PNG, zamijeni samo unutrašnjost ove komponente.
 *
 * `varijanta`: „tamno" za svijetlu pozadinu (zaglavlje), „svijetlo" za tamnu (podnožje).
 */
export function ZnakSvijetSluha({ className = '' }: { className?: string }) {
  // Kružni znak: centralni prsten + četiri luka na dijagonalama (zvuk koji se širi).
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-hidden fill="none">
      <circle cx="50" cy="50" r="11" stroke="currentColor" strokeWidth="9" />
      <g stroke="currentColor" strokeWidth="9.5" strokeLinecap="round">
        <path d="M81.3 63.3 A34 34 0 0 1 63.3 81.3" />
        <path d="M36.7 81.3 A34 34 0 0 1 18.7 63.3" />
        <path d="M18.7 36.7 A34 34 0 0 1 36.7 18.7" />
        <path d="M63.3 18.7 A34 34 0 0 1 81.3 36.7" />
      </g>
    </svg>
  )
}

export function Logotip({
  varijanta = 'tamno',
  tagline = false,
  saIkonom = true,
  className = '',
}: {
  varijanta?: 'tamno' | 'svijetlo'
  tagline?: boolean
  saIkonom?: boolean
  className?: string
}) {
  const [prva, ...ostatak] = BREND.naziv.toUpperCase().split(' ')
  const bojaSluha = varijanta === 'svijetlo' ? 'text-white' : 'text-neutral-900'
  const bojaTagline = varijanta === 'svijetlo' ? 'text-neutral-400' : 'text-neutral-500'

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="inline-flex flex-col leading-none">
        <span className="inline-flex items-center text-[19px] font-extrabold tracking-tight md:text-[21px]">
          <span className="rounded-[6px] bg-brand-600 px-2 py-1 text-white">{prva}</span>
          <span className={`ml-1.5 ${bojaSluha}`}>{ostatak.join(' ')}</span>
        </span>
        {tagline && (
          <span className={`mt-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase ${bojaTagline}`}>
            {BREND.tagline}
          </span>
        )}
      </span>
      {saIkonom && <ZnakSvijetSluha className="size-7 shrink-0 text-brand-600 md:size-8" />}
    </span>
  )
}
