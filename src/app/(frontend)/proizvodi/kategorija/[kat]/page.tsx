import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { dajPayload } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
import { OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import { ProizvodKartica } from '@/components/proizvodi/ProizvodKartica'
import { KATEGORIJE, type Kategorija } from '@/lib/catalog'

export function generateStaticParams() {
  return Object.keys(KATEGORIJE)
    .filter((k) => k !== 'slusni-aparati')
    .map((kat) => ({ kat }))
}

export async function generateMetadata({ params }: { params: Promise<{ kat: string }> }): Promise<Metadata> {
  const { kat } = await params
  const info = KATEGORIJE[kat as Kategorija]
  if (!info) return {}
  return metaStranice({
    naslov: `${info.naziv} — Audio BM ponuda`,
    opis: info.opis,
    putanja: `/proizvodi/kategorija/${kat}`,
  })
}

export default async function KategorijaStranica({ params }: { params: Promise<{ kat: string }> }) {
  const { kat } = await params
  const info = KATEGORIJE[kat as Kategorija]
  if (!info || kat === 'slusni-aparati') notFound()

  const payload = await dajPayload()
  const { docs: proizvodi } = await payload.find({
    collection: 'proizvodi',
    where: { and: [{ kategorija: { equals: kat } }, { aktivan: { equals: true } }] },
    sort: 'naziv',
    limit: 100,
    depth: 1,
    draft: false,
  })

  return (
    <div className="kontejner py-10 md:py-14">
      <Mrvice stavke={[{ naziv: 'Proizvodi', putanja: '/proizvodi' }, { naziv: info.naziv }]} />
      <h1 className="text-h1 mt-6">{info.naziv}</h1>
      <p className="mt-3 max-w-2xl text-[18px] text-neutral-600">{info.opis}</p>

      {proizvodi.length > 0 ? (
        <OtkrijGrupu className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {proizvodi.map((p) => (
            <OtkrijStavku key={p.id}>
              <ProizvodKartica proizvod={p} />
            </OtkrijStavku>
          ))}
        </OtkrijGrupu>
      ) : (
        <p className="mt-10 rounded-[16px] bg-neutral-50 p-8 text-center text-neutral-600">
          Trenutno nema proizvoda u ovoj kategoriji. Kontaktirajte nas za informacije o ponudi.
        </p>
      )}
    </div>
  )
}
