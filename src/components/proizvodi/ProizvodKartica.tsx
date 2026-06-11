import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import type { Mediji, Proizvodi } from '@/payload-types'

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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[16px] border border-neutral-200 bg-white shadow-[var(--shadow-lift)] transition-[box-shadow,transform,border-color] duration-250 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift-lg)]">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100/60">
        {proizvod.brend && (
          <span className="absolute top-3 left-3 z-10 rounded-full border border-neutral-200 bg-white/95 px-3 py-1 text-[12px] font-bold tracking-wide text-neutral-600 uppercase shadow-sm">
            {proizvod.brend}
          </span>
        )}
        {slika && typeof slika === 'object' ? (
          <div className="grid h-full w-full place-items-center p-7">
            <SlikaMedija
              medij={slika}
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 42vw, 86vw"
              className="max-h-full w-auto object-contain drop-shadow-md transition-transform duration-250 group-hover:scale-[1.06]"
            />
          </div>
        ) : (
          <div className="grid h-full place-items-center text-small text-neutral-400">[MISSING_ASSET]</div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[17px] leading-snug font-bold text-neutral-900">
          <Link
            href={putanja}
            className="after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--color-focus)]"
          >
            {proizvod.naziv}
          </Link>
        </h3>

        <div className="mt-3">
          {proizvod.nacin === 'maloprodaja' ? (
            cijena === '[CIJENA_PLACEHOLDER]' ? (
              <p className="text-[15px] font-semibold text-warning-600">Cijena na upit [CIJENA_PLACEHOLDER]</p>
            ) : (
              <p className="telefon text-[22px] text-brand-700">{cijena}</p>
            )
          ) : (
            <>
              {cijena && <p className="telefon text-[18px] text-neutral-800">{cijena}</p>}
              <p className="text-small text-neutral-500">
                {proizvod.cijenaNapomena?.startsWith('[')
                  ? 'Cijena na besplatnom savjetovanju'
                  : (proizvod.cijenaNapomena ?? 'Cijena na besplatnom savjetovanju')}
              </p>
            </>
          )}
        </div>

        <div className="mt-auto pt-4">
          <span className="flex items-center justify-center gap-2 rounded-[10px] bg-neutral-100 py-2.5 text-[15px] font-semibold text-neutral-800 transition-colors duration-250 group-hover:bg-brand-600 group-hover:text-white">
            {proizvod.nacin === 'konsultacija' ? 'Detalji i savjetovanje' : 'Detalji i narudžba'}
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  )
}
