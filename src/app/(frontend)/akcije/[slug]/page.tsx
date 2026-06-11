import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Tag } from 'lucide-react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { dajPayload } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import { DugmeLink } from '@/components/ui/Dugme'
import { ProizvodKartica } from '@/components/proizvodi/ProizvodKartica'
import type { Mediji, Proizvodi } from '@/payload-types'

async function dajAkciju(slug: string) {
  const payload = await dajPayload()
  const danas = new Date().toISOString()
  const { docs } = await payload.find({
    collection: 'akcije',
    where: {
      and: [
        { slug: { equals: slug } },
        { vrijediOd: { less_than_equal: danas } },
        { vrijediDo: { greater_than_equal: danas } },
      ],
    },
    limit: 1,
    depth: 2,
    draft: false,
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = await dajAkciju(slug)
  if (!a) return {}
  return metaStranice({
    naslov: a.seo?.naslov ?? a.naslov,
    opis: a.seo?.opis ?? a.kratkiOpis,
    putanja: `/akcije/${slug}`,
  })
}

const datum = (d: string) => new Date(d).toLocaleDateString('bs-BA', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function AkcijaStranica({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const akcija = await dajAkciju(slug)
  if (!akcija) notFound() // istekla ili nepostojeća akcija

  const proizvodi = (akcija.proizvodi as (Proizvodi | number)[] | undefined)?.filter(
    (p): p is Proizvodi => typeof p === 'object',
  )

  return (
    <div className="kontejner py-10 md:py-14">
      <Mrvice stavke={[{ naziv: 'Akcije', putanja: '/akcije' }, { naziv: akcija.naslov }]} />

      <div className="mt-6 max-w-3xl">
        <p className="text-small flex items-center gap-2 font-bold tracking-wide text-brand-600 uppercase">
          <Tag className="size-4" aria-hidden />
          Akcija vrijedi: {datum(akcija.vrijediOd)} — {datum(akcija.vrijediDo)}
        </p>
        <h1 className="text-h1 mt-2">{akcija.naslov}</h1>
        <p className="mt-4 text-[18px] text-neutral-600">{akcija.kratkiOpis}</p>
      </div>

      {akcija.slika && typeof akcija.slika === 'object' && (
        <div className="relative mt-8 aspect-[21/9] max-w-4xl overflow-hidden rounded-[16px]">
          <SlikaMedija medij={akcija.slika as Mediji} fill sizes="(min-width: 1024px) 900px, 100vw" prioritet />
        </div>
      )}

      {akcija.sadrzaj && <RichText data={akcija.sadrzaj} className="prose-bm mt-8 text-neutral-700" />}

      {proizvodi && proizvodi.length > 0 && (
        <section className="sekcija" aria-label="Proizvodi u akciji">
          <h2 className="text-h2">Proizvodi u akciji</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {proizvodi.map((p) => (
              <ProizvodKartica key={p.id} proizvod={p} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 rounded-[16px] bg-brand-50/60 p-8 text-center">
        <h2 className="text-h3">Iskoristite akciju</h2>
        <p className="mt-2 text-neutral-700">Pozovite najbližu poslovnicu ili zakažite termin.</p>
        <DugmeLink href="/zakazivanje" velicina="veliko" className="mt-5">
          Zakažite termin
        </DugmeLink>
      </div>
    </div>
  )
}
