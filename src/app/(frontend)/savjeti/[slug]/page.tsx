import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { dajPayload } from '@/lib/podaci'
import { clanakJsonLd, metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import { DugmeLink } from '@/components/ui/Dugme'
import type { Mediji } from '@/payload-types'

async function dajObjavu(slug: string) {
  const payload = await dajPayload()
  const { docs } = await payload.find({
    collection: 'objave',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    draft: false,
  })
  return docs[0] ?? null
}

export async function generateStaticParams() {
  const payload = await dajPayload()
  const { docs } = await payload.find({ collection: 'objave', limit: 100, depth: 0, draft: false })
  return docs.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const o = await dajObjavu(slug)
  if (!o) return {}
  return metaStranice({
    naslov: o.seo?.naslov ?? o.naslov,
    opis: o.seo?.opis ?? o.izvod,
    putanja: `/savjeti/${slug}`,
  })
}

export default async function ObjavaStranica({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const objava = await dajObjavu(slug)
  if (!objava) notFound()

  const payload = await dajPayload()
  const { docs: povezane } = await payload.find({
    collection: 'objave',
    where: { and: [{ kategorija: { equals: objava.kategorija } }, { slug: { not_equals: slug } }] },
    sort: '-datumObjave',
    limit: 3,
    depth: 0,
    draft: false,
  })

  return (
    <article className="kontejner py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            clanakJsonLd({
              naslov: objava.naslov,
              slug: objava.slug,
              izvod: objava.izvod,
              datumObjave: objava.datumObjave,
            }),
          ),
        }}
      />
      <Mrvice stavke={[{ naziv: 'Savjeti', putanja: '/savjeti' }, { naziv: objava.naslov }]} />

      <div className="mx-auto mt-8 max-w-3xl">
        {objava.datumObjave && (
          <p className="text-small font-semibold text-neutral-500">
            {new Date(objava.datumObjave).toLocaleDateString('bs-BA', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
        <h1 className="text-h1 mt-2">{objava.naslov}</h1>
        <p className="mt-4 text-[19px] text-neutral-600">{objava.izvod}</p>

        {objava.naslovnaSlika && typeof objava.naslovnaSlika === 'object' && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[24px] shadow-[var(--shadow-lift)]">
            <SlikaMedija medij={objava.naslovnaSlika as Mediji} fill sizes="(min-width: 768px) 768px, 100vw" prioritet />
          </div>
        )}

        <RichText data={objava.sadrzaj} className="prose-bm mt-10 text-[18px] text-neutral-800" />

        <div className="mt-14 rounded-[28px] border border-brand-200/60 bg-gradient-to-br from-white to-brand-50/50 p-8 text-center md:p-10">
          <h2 className="text-h3">Brinete za svoj sluh?</h2>
          <p className="mt-2 text-neutral-700">Provjera sluha kod nas je besplatna i traje pola sata.</p>
          <DugmeLink href="/zakazivanje" velicina="veliko" className="mt-6">
            Zakažite besplatan termin
          </DugmeLink>
        </div>

        {povezane.length > 0 && (
          <aside className="mt-14" aria-label="Povezane objave">
            <h2 className="text-h3 mb-4">Pročitajte i ovo</h2>
            <ul className="space-y-3">
              {povezane.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/savjeti/${p.slug}`}
                    className="povrsina block p-4.5 font-semibold text-neutral-900 transition-colors duration-150 hover:border-brand-300 hover:text-brand-700"
                  >
                    {p.naslov}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </article>
  )
}
