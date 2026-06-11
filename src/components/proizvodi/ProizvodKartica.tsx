import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import type { Mediji, Proizvodi } from '@/payload-types'

const BRENDOVI_BOJA = 'text-small font-semibold tracking-wide text-neutral-500 uppercase'

export function cijenaPrikaz(p: Proizvodi): string {
  if (p.nacin === 'konsultacija') {
    if (p.cijenaOd && p.cijenaDo) return `${p.cijenaOd} – ${p.cijenaDo} KM`
    return ''
  }
  if (p.cijena != null && p.cijena > 0) return `${p.cijena} KM`
  return '[CIJENA_PLACEHOLDER]'
}

/**
 * Kartica proizvoda — dvije varijante:
 *  - konsultacija (slušni aparati): bez cijene i korpe, CTA na savjetovanje
 *  - maloprodaja: stvarna cijena ili vidljiv [CIJENA_PLACEHOLDER]
 */
export function ProizvodKartica({ proizvod }: { proizvod: Proizvodi }) {
  const slika = (proizvod.slike as (Mediji | number)[] | undefined)?.[0]
  const putanja =
    proizvod.kategorija === 'slusni-aparati'
      ? `/slusni-aparati/modeli/${proizvod.slug}`
      : `/proizvodi/${proizvod.slug}`
  const cijena = cijenaPrikaz(proizvod)

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[16px] border border-neutral-200 bg-white shadow-sm transition-[box-shadow,transform] duration-250 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-white p-4">
        {slika && typeof slika === 'object' ? (
          <SlikaMedija
            medij={slika}
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
            className="!relative h-full w-full object-contain transition-transform duration-250 group-hover:scale-[1.03]"
            fill
          />
        ) : (
          <div className="grid h-full place-items-center text-small text-neutral-400">[MISSING_ASSET]</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {proizvod.brend && <p className={BRENDOVI_BOJA}>{proizvod.brend}</p>}
        <h3 className="mt-1 text-[18px] leading-snug font-bold text-neutral-900">
          <Link
            href={putanja}
            className="after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--color-focus)]"
          >
            {proizvod.naziv}
          </Link>
        </h3>
        {proizvod.kratkiOpis && (
          <p className="mt-2 line-clamp-2 text-[15px] text-neutral-600">{proizvod.kratkiOpis}</p>
        )}

        <div className="mt-auto pt-4">
          {proizvod.nacin === 'maloprodaja' ? (
            <p className="telefon text-[20px] text-neutral-900">
              {cijena === '[CIJENA_PLACEHOLDER]' ? (
                <span className="text-[15px] font-semibold text-warning-600">
                  Cijena na upit [CIJENA_PLACEHOLDER]
                </span>
              ) : (
                cijena
              )}
            </p>
          ) : (
            <>
              {cijena && <p className="telefon text-[17px] text-neutral-700">{cijena}</p>}
              <p className="text-small text-neutral-500">
                {proizvod.cijenaNapomena?.startsWith('[')
                  ? 'Cijena zavisi od modela — saznajte na besplatnom savjetovanju.'
                  : (proizvod.cijenaNapomena ?? 'Cijena na besplatnom savjetovanju')}
              </p>
            </>
          )}
          <span className="mt-2 inline-flex items-center gap-1.5 text-[15px] font-semibold text-brand-700">
            {proizvod.nacin === 'konsultacija' ? 'Detalji i savjetovanje' : 'Detalji i narudžba'}
            <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  )
}
