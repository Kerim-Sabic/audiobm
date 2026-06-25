import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Store } from 'lucide-react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { dajPayload, dajPodesavanja } from '@/lib/podaci'
import { metaStranice, proizvodJsonLd, OSNOVNI_URL } from '@/lib/seo'
import { stvarno } from '@/lib/tekst'
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
    opis: p.seo?.opis ?? p.kratkiOpis ?? `${p.naziv} — dostupno u našim poslovnicama.`,
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
  const napomena = stvarno(proizvod.cijenaNapomena)
  const telefon = stvarno(podesavanja.telefonGlavni)
  const prvaSlika = typeof slike[0] === 'object' ? slike[0] : null
  const slikaUrl = prvaSlika?.url
    ? prvaSlika.url.startsWith('http')
      ? prvaSlika.url
      : `${OSNOVNI_URL}${prvaSlika.url}`
    : undefined

  return (
    <div className="kontejner py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            proizvodJsonLd({
              naziv: proizvod.naziv,
              slug: proizvod.slug,
              kategorija: proizvod.kategorija,
              brend: proizvod.brend,
              kratkiOpis: proizvod.kratkiOpis,
              cijena: imaCijenu ? proizvod.cijena : undefined,
              slika: slikaUrl,
            }),
          ),
        }}
      />
      <Mrvice
        stavke={[
          { naziv: 'Proizvodi', putanja: '/proizvodi' },
          ...(kategorija
            ? [{ naziv: kategorija.naziv, putanja: `/proizvodi/kategorija/${proizvod.kategorija}` }]
            : []),
          { naziv: proizvod.naziv },
        ]}
      />

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="povrsina relative grid aspect-square place-items-center overflow-hidden !rounded-[28px] bg-gradient-to-br from-white to-neutral-50 p-10 lg:sticky lg:top-32">
          <div className="mreza-audiogram absolute inset-0" aria-hidden />
          <SlikaMedija
            medij={typeof slike[0] === 'object' ? slike[0] : null}
            altRezerva={proizvod.brend ? `${proizvod.naziv} — ${proizvod.brend}` : proizvod.naziv}
            sizes="(min-width: 1024px) 560px, 100vw"
            prioritet
            className="relative max-h-full w-auto object-contain drop-shadow-xl"
          />
        </div>

        <div>
          {proizvod.brend && (
            <p className="text-[13px] font-bold tracking-[0.16em] text-neutral-500 uppercase">{proizvod.brend}</p>
          )}
          <h1 className="text-h1 mt-1.5">{proizvod.naziv}</h1>

          <div className="povrsina mt-6 !rounded-[18px] bg-neutral-50 p-5">
            {imaCijenu ? (
              <>
                <p className="telefon text-[30px] text-neutral-900">{proizvod.cijena} KM</p>
                {proizvod.staraCijena != null && proizvod.staraCijena > (proizvod.cijena ?? 0) && (
                  <p className="text-neutral-500 line-through">{proizvod.staraCijena} KM</p>
                )}
              </>
            ) : (
              <p className="text-[19px] font-bold text-neutral-900">Cijena na upit</p>
            )}
            {napomena && <p className="text-small mt-1 text-neutral-600">{napomena}</p>}
            <p className="mt-3 flex items-center gap-2 border-t border-neutral-200/70 pt-3 text-[14.5px] text-neutral-600">
              <Store className="size-4 shrink-0 text-brand-600" aria-hidden />
              Narudžba upitom ili telefonom — preuzimanje u najbližoj poslovnici.
            </p>
            {telefon && (
              <TelefonLink
                broj={telefon}
                lokacija={`proizvod-${slug}`}
                className="mt-2.5 text-[20px] text-neutral-900 hover:text-brand-700"
              />
            )}
          </div>

          {proizvod.opis && <RichText data={proizvod.opis} className="prose-bm mt-7 text-neutral-700" />}

          <div className="povrsina mt-8 !rounded-[24px] p-6 md:p-8">
            <h2 className="text-h3 mb-5">Naručite ili pošaljite pitanje</h2>
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
