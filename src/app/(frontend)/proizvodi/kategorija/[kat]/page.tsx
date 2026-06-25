import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { dajPayload } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
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
    naslov: `${info.naziv} — ponuda Svijet Sluha`,
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
    <>
      <ZaglavljeStranice
        mrvice={[{ naziv: 'Proizvodi', putanja: '/proizvodi' }, { naziv: info.naziv }]}
        nadnaslov="Kategorija proizvoda"
        naslov={info.naziv}
        uvod={info.opis}
      />

      <div className="kontejner pb-16 md:pb-24">
        {proizvodi.length > 0 ? (
          <OtkrijGrupu className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {proizvodi.map((p) => (
              <OtkrijStavku key={p.id} className="h-full">
                <ProizvodKartica proizvod={p} />
              </OtkrijStavku>
            ))}
          </OtkrijGrupu>
        ) : (
          <p className="povrsina mt-12 p-10 text-center text-neutral-600">
            Trenutno nema proizvoda u ovoj kategoriji. Kontaktirajte nas za informacije o ponudi.
          </p>
        )}
      </div>
    </>
  )
}
