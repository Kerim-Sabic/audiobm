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
  return ''
}

/**
 * Kartica proizvoda — dvije varijante:
 *  - konsultacija (slušni aparati): bez cijene i korpe, CTA na savjetovanje
 *  - maloprodaja: stvarna cijena ili mirno „Cijena na upit" (bez placeholder oznaka)
 */
export function ProizvodKartica({ proizvod }: { proizvod: Proizvodi }) {
  const slika = (proizvod.slike as (Mediji | number)[] | undefined)?.[0]
  const putanja =
    proizvod.kategorija === 'slusni-aparati'
      ? `/slusni-aparati/modeli/${proizvod.slug}`
      : `/proizvodi/${proizvod.slug}`
  const cijena = cijenaPrikaz(proizvod)
  const napomena = proizvod.cijenaNapomena?.startsWith('[') ? null : proizvod.cijenaNapomena
  const opisKartice = proizvod.kratkiOpis?.startsWith('[') ? null : proizvod.kratkiOpis
  const prikaziOpisNaKartici = proizvod.nacin === 'konsultacija' && proizvod.kategorija !== 'slusni-aparati'

  return (
    <article className="povrsina povrsina-hover group relative flex h-full flex-col overflow-hidden">
      <div className="relative aspect-square overflow-hidden border-b border-neutral-100 bg-neutral-50">
        {proizvod.brend && (
          <span className="absolute top-3.5 left-3.5 z-10 rounded-full border border-neutral-200/80 bg-white/95 px-3 py-1 text-[11.5px] font-bold tracking-[0.08em] text-neutral-600 uppercase shadow-sm backdrop-blur-sm">
            {proizvod.brend}
          </span>
        )}
        <div className="grid h-full w-full place-items-center p-7">
          {slika && typeof slika === 'object' ? (
            <SlikaMedija
              medij={slika}
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 42vw, 86vw"
              className="max-h-full w-auto object-contain drop-shadow-md transition-transform duration-250 group-hover:scale-[1.06]"
            />
          ) : (
            <svg viewBox="0 0 24 24" className="size-12 text-neutral-200" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="9" cy="10" r="1.6" />
              <path d="m5 17 4.5-4 3 2.5L17 11l2 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[16.5px] leading-snug font-bold text-neutral-900">
          <Link
            href={putanja}
            className="after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--color-focus)]"
          >
            {proizvod.naziv}
          </Link>
        </h3>

        <div className="mt-3 flex-1">
          {proizvod.nacin === 'maloprodaja' ? (
            cijena ? (
              <p className="telefon text-[21px] text-neutral-900">{cijena}</p>
            ) : (
              <p className="text-[15px] font-semibold text-neutral-600">Cijena na upit</p>
            )
          ) : (
            <>
              {prikaziOpisNaKartici && opisKartice ? (
                <p className="line-clamp-4 text-[15px] leading-relaxed text-neutral-600">{opisKartice}</p>
              ) : (
                <>
                  {cijena && <p className="telefon text-[18px] text-neutral-800">{cijena}</p>}
                  <p className="text-small text-neutral-500">{napomena ?? 'Cijena na besplatnom savjetovanju'}</p>
                </>
              )}
            </>
          )}
        </div>

        <span className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3.5 text-[15px] font-semibold text-neutral-700 transition-colors duration-150 group-hover:text-brand-700">
          {proizvod.nacin === 'konsultacija' ? 'Detalji i savjetovanje' : 'Detalji i narudžba'}
          <span className="grid size-7.5 place-items-center rounded-full bg-neutral-100 transition-colors duration-250 group-hover:bg-brand-600 group-hover:text-white">
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </span>
      </div>
    </article>
  )
}
