import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { dajPayload, dajPodesavanja } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import { TelefonLink } from '@/components/ui/TelefonLink'
import { UpitZaProizvod } from '@/components/proizvodi/UpitZaProizvod'
import { KATEGORIJE, type Kategorija } from '@/lib/catalog'
import type { Mediji } from '@/payload-types'

async function dajProizvod(slug: string) {
  const payload = await dajPayload()
  const { docs } = await payload.find({
    collection: 'proizvodi',
    where: { and: [{ slug: { equals: slug } }, { kategorija: { not_equals: 'slusni-aparati' } }] },
    limit: 1,
    depth: 1,
    draft: false,
  })
  return docs[0] ?? null
}

export async function generateStaticParams() {
  const payload = await dajPayload()
  const { docs } = await payload.find({
    collection: 'proizvodi',
    where: { kategorija: { not_equals: 'slusni-aparati' } },
    limit: 200,
    depth: 0,
    draft: false,
  })
  return docs.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await dajProizvod(slug)
  if (!p) return {}
  return metaStranice({
    naslov: p.seo?.naslov ?? p.naziv,
    opis: p.seo?.opis ?? p.kratkiOpis ?? `${p.naziv} — dostupno u Audio BM poslovnicama.`,
    putanja: `/proizvodi/${slug}`,
  })
}

export default async function ProizvodStranica({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [proizvod, podesavanja] = await Promise.all([dajProizvod(slug), dajPodesavanja()])
  if (!proizvod) notFound()

  const slike = (proizvod.slike as (Mediji | number)[] | undefined) ?? []
  const kategorija = KATEGORIJE[proizvod.kategorija as Kategorija]
  const imaCijenu = proizvod.nacin === 'maloprodaja' && proizvod.cijena != null && proizvod.cijena > 0

  return (
    <div className="kontejner py-10 md:py-14">
      <Mrvice
        stavke={[
          { naziv: 'Proizvodi', putanja: '/proizvodi' },
          ...(kategorija
            ? [{ naziv: kategorija.naziv, putanja: `/proizvodi/kategorija/${proizvod.kategorija}` }]
            : []),
          { naziv: proizvod.naziv },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          {slike[0] && typeof slike[0] === 'object' ? (
            <div className="relative aspect-square overflow-hidden rounded-[16px] border border-neutral-200 bg-white p-8">
              <SlikaMedija
                medij={slike[0]}
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                prioritet
                className="!relative h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="grid aspect-square place-items-center rounded-[16px] bg-neutral-100 text-neutral-400">
              [MISSING_ASSET]
            </div>
          )}
        </div>

        <div>
          {proizvod.brend && (
            <p className="text-small font-semibold tracking-wide text-neutral-500 uppercase">{proizvod.brend}</p>
          )}
          <h1 className="text-h1 mt-1">{proizvod.naziv}</h1>

          <div className="mt-5 rounded-[12px] bg-neutral-50 p-5">
            {imaCijenu ? (
              <>
                <p className="telefon text-[30px] text-neutral-900">{proizvod.cijena} KM</p>
                {proizvod.staraCijena != null && proizvod.staraCijena > (proizvod.cijena ?? 0) && (
                  <p className="text-neutral-500 line-through">{proizvod.staraCijena} KM</p>
                )}
              </>
            ) : (
              <p className="text-[18px] font-semibold text-warning-600">
                Cijena na upit {proizvod.cijenaNapomena?.startsWith('[') ? '[CIJENA_PLACEHOLDER]' : ''}
              </p>
            )}
            {proizvod.cijenaNapomena && !proizvod.cijenaNapomena.startsWith('[') && (
              <p className="text-small mt-1 text-neutral-600">{proizvod.cijenaNapomena}</p>
            )}
            <p className="text-small mt-3 text-neutral-600">
              Narudžba upitom ili telefonom — preuzimanje u najbližoj poslovnici.
            </p>
            {podesavanja.telefonGlavni && (
              <TelefonLink
                broj={podesavanja.telefonGlavni}
                lokacija={`proizvod-${slug}`}
                className="mt-2 text-[20px] text-neutral-900 hover:text-brand-700"
              />
            )}
          </div>

          {proizvod.opis && <RichText data={proizvod.opis} className="prose-bm mt-6 text-neutral-700" />}

          <div className="mt-8 rounded-[16px] border border-neutral-200 p-6">
            <h2 className="text-h3 mb-4">Naručite ili pošaljite pitanje</h2>
            <UpitZaProizvod
              proizvodId={proizvod.id as number}
              nazivProizvoda={proizvod.naziv}
              putanja={`/proizvodi/${slug}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
