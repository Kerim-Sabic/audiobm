import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  KATEGORIJE_OBJAVA,
  oznakaKategorijeObjave,
  type KategorijaObjave,
} from '@/lib/objave'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import { OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import type { Mediji } from '@/payload-types'

export type SavjetiKartica = {
  id: number
  slug: string
  naslov: string
  izvod: string
  kategorija: KategorijaObjave
  datumObjave?: string | null
  naslovnaSlika?: Mediji | null
}

export function SavjetiKategorije({ aktivna }: { aktivna?: KategorijaObjave }) {
  return (
    <nav aria-label="Kategorije objava" className="flex flex-wrap gap-2">
      <Link
        href="/savjeti"
        className={`rounded-full border px-4 py-2 text-[14.5px] font-semibold shadow-sm transition-colors duration-150 ${
          !aktivna
            ? 'border-brand-600 bg-brand-600 text-white'
            : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
        }`}
      >
        Sve objave
      </Link>
      {KATEGORIJE_OBJAVA.map((kategorija) => (
        <Link
          key={kategorija.value}
          href={`/savjeti?kategorija=${kategorija.value}`}
          className={`rounded-full border px-4 py-2 text-[14.5px] font-semibold shadow-sm transition-colors duration-150 ${
            aktivna === kategorija.value
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          {kategorija.label}
        </Link>
      ))}
    </nav>
  )
}

export function SavjetiMreza({ objave }: { objave: SavjetiKartica[] }) {
  return (
    <>
      <OtkrijGrupu className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {objave.map((objava) => (
          <OtkrijStavku key={objava.id}>
            <article className="povrsina povrsina-hover group relative flex h-full flex-col overflow-hidden">
              {objava.naslovnaSlika ? (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <SlikaMedija
                    medij={objava.naslovnaSlika}
                    fill
                    sizes="(min-width: 640px) 380px, 90vw"
                    className="transition-transform duration-250 group-hover:scale-[1.03]"
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] bg-gradient-to-br from-brand-50 to-neutral-100" aria-hidden />
              )}
              <div className="flex flex-1 flex-col p-6">
                <p className="text-small font-bold tracking-wide text-brand-600 uppercase">
                  {oznakaKategorijeObjave(objava.kategorija)}
                  {objava.datumObjave &&
                    ` · ${new Date(objava.datumObjave).toLocaleDateString('bs-BA', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}`}
                </p>
                <h2 className="mt-2 text-[19px] leading-snug font-bold text-neutral-900">
                  <Link
                    href={`/savjeti/${objava.slug}`}
                    className="after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--color-focus)]"
                  >
                    {objava.naslov}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 text-[15px] text-neutral-600">{objava.izvod}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[15px] font-semibold text-brand-700">
                  Pročitajte
                  <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </article>
          </OtkrijStavku>
        ))}
      </OtkrijGrupu>

      {objave.length === 0 && (
        <p className="povrsina mt-12 p-12 text-center text-neutral-600">
          U ovoj kategoriji još nema objava.
        </p>
      )}
    </>
  )
}
