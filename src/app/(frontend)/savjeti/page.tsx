import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { dajPayload } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import { OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import type { Mediji } from '@/payload-types'

export const metadata: Metadata = metaStranice({
  naslov: 'Savjeti i novosti o sluhu',
  opis: 'Praktični savjeti o sluhu i slušnim aparatima, novosti iz Audio BM poslovnica i vijesti iz Sarajeva.',
  putanja: '/savjeti',
})

const KATEGORIJE = [
  { value: 'savjeti', label: 'Savjeti' },
  { value: 'novosti', label: 'Novosti' },
  { value: 'sarajevo', label: 'Sarajevo' },
] as const

export default async function SavjetiStranica({
  searchParams,
}: {
  searchParams: Promise<{ kategorija?: string }>
}) {
  const [payload, params] = await Promise.all([dajPayload(), searchParams])
  const kategorija = KATEGORIJE.find((k) => k.value === params.kategorija)?.value

  const { docs: objave } = await payload.find({
    collection: 'objave',
    where: kategorija ? { kategorija: { equals: kategorija } } : {},
    sort: '-datumObjave',
    limit: 30,
    depth: 1,
    draft: false,
  })

  return (
    <>
      <ZaglavljeStranice
        mrvice={[{ naziv: 'Savjeti' }]}
        nadnaslov="Razumljivo o sluhu"
        naslov="Savjeti i novosti"
        uvod="Razumljivi tekstovi o sluhu, aparatima i svemu što Vas zanima — bez komplikovanih izraza."
        slika={{
          src: '/media/site-refresh/blog-advice-page.png',
          alt: 'Stariji par u opuštenom razgovoru kod kuće — život sa zdravim sluhom',
        }}
      >
        <nav aria-label="Kategorije objava" className="flex flex-wrap gap-2">
          <Link
            href="/savjeti"
            className={`rounded-full border px-4 py-2 text-[14.5px] font-semibold shadow-sm transition-colors duration-150 ${
              !kategorija
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Sve objave
          </Link>
          {KATEGORIJE.map((k) => (
            <Link
              key={k.value}
              href={`/savjeti?kategorija=${k.value}`}
              className={`rounded-full border px-4 py-2 text-[14.5px] font-semibold shadow-sm transition-colors duration-150 ${
                kategorija === k.value
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {k.label}
            </Link>
          ))}
        </nav>
      </ZaglavljeStranice>

      <div className="kontejner pb-16 md:pb-24">
      <OtkrijGrupu className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {objave.map((o) => (
          <OtkrijStavku key={o.id}>
            <article className="povrsina povrsina-hover group relative flex h-full flex-col overflow-hidden">
              {o.naslovnaSlika && typeof o.naslovnaSlika === 'object' ? (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <SlikaMedija
                    medij={o.naslovnaSlika as Mediji}
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
                  {KATEGORIJE.find((k) => k.value === o.kategorija)?.label}
                  {o.datumObjave &&
                    ` · ${new Date(o.datumObjave).toLocaleDateString('bs-BA', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                </p>
                <h2 className="mt-2 text-[19px] leading-snug font-bold text-neutral-900">
                  <Link
                    href={`/savjeti/${o.slug}`}
                    className="after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--color-focus)]"
                  >
                    {o.naslov}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 text-[15px] text-neutral-600">{o.izvod}</p>
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
      </div>
    </>
  )
}
