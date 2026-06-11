import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Tag } from 'lucide-react'
import { dajAktivneAkcije } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import { DugmeLink } from '@/components/ui/Dugme'
import { OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import type { Mediji } from '@/payload-types'

export const metadata: Metadata = metaStranice({
  naslov: 'Akcije i popusti',
  opis: 'Aktuelne akcije na slušne aparate, baterije i pribor u Audio BM poslovnicama širom BiH.',
  putanja: '/akcije',
})

const datum = (d: string) => new Date(d).toLocaleDateString('bs-BA', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function AkcijeStranica() {
  const akcije = await dajAktivneAkcije()

  return (
    <>
      <ZaglavljeStranice
        mrvice={[{ naziv: 'Akcije' }]}
        nadnaslov="Promocije i popusti"
        naslov="Aktuelne akcije"
        uvod="Promocije vrijede do navedenog datuma ili do isteka zaliha — istekle akcije se automatski sklanjaju sa stranice."
      />

      <div className="kontejner pb-16 md:pb-24">
      {akcije.length > 0 ? (
        <OtkrijGrupu className="mt-12 grid gap-6 md:grid-cols-2">
          {akcije.map((a) => (
            <OtkrijStavku key={a.id}>
              <article className="povrsina povrsina-hover group relative flex h-full flex-col overflow-hidden">
                {a.slika && typeof a.slika === 'object' && (
                  <div className="relative aspect-[16/7] overflow-hidden">
                    <SlikaMedija
                      medij={a.slika as Mediji}
                      fill
                      sizes="(min-width: 768px) 560px, 100vw"
                      className="transition-transform duration-250 group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-7">
                  <p className="text-small flex items-center gap-2 font-bold tracking-wide text-brand-600 uppercase">
                    <Tag className="size-4" aria-hidden />
                    Vrijedi do {datum(a.vrijediDo)}
                  </p>
                  <h2 className="text-h3 mt-2">
                    <Link
                      href={`/akcije/${a.slug}`}
                      className="after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--color-focus)]"
                    >
                      {a.naslov}
                    </Link>
                  </h2>
                  <p className="mt-2 text-neutral-600">{a.kratkiOpis}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-semibold text-brand-700">
                    Detalji akcije
                    <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </article>
            </OtkrijStavku>
          ))}
        </OtkrijGrupu>
      ) : (
        <div className="relative mt-12 overflow-hidden rounded-[28px] border border-neutral-200/70 bg-neutral-50 p-12 text-center">
          <div className="mreza-audiogram absolute inset-0" aria-hidden />
          <div className="relative">
            <p className="text-h3 text-neutral-700">Trenutno nema aktivnih akcija.</p>
            <p className="mx-auto mt-3 max-w-md text-neutral-600">
              Pratite nas — nove promocije objavljujemo ovdje. U međuvremenu, provjera sluha je uvijek
              besplatna.
            </p>
            <DugmeLink href="/zakazivanje" className="mt-7">
              Zakažite besplatnu provjeru sluha
            </DugmeLink>
          </div>
        </div>
      )}
      </div>
    </>
  )
}
