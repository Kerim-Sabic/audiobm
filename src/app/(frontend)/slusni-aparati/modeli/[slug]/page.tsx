import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { dajPayload } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
import { DugmeLink } from '@/components/ui/Dugme'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import { UpitZaProizvod } from '@/components/proizvodi/UpitZaProizvod'
import { TIPOVI_APARATA } from '@/lib/catalog'
import type { Mediji } from '@/payload-types'

async function dajAparat(slug: string) {
  const payload = await dajPayload()
  const { docs } = await payload.find({
    collection: 'proizvodi',
    where: { and: [{ slug: { equals: slug } }, { kategorija: { equals: 'slusni-aparati' } }] },
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
    where: { kategorija: { equals: 'slusni-aparati' } },
    limit: 100,
    depth: 0,
    draft: false,
  })
  return docs.map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await dajAparat(slug)
  if (!p) return {}
  return metaStranice({
    naslov: p.seo?.naslov ?? `${p.naziv} — besplatno savjetovanje`,
    opis: p.seo?.opis ?? p.kratkiOpis ?? `${p.naziv} — saznajte da li je pravi za Vas na besplatnom savjetovanju u Audio BM.`,
    putanja: `/slusni-aparati/modeli/${slug}`,
  })
}

export default async function ModelStranica({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const proizvod = await dajAparat(slug)
  if (!proizvod) notFound()

  const slike = (proizvod.slike as (Mediji | number)[] | undefined) ?? []
  const tip = proizvod.tipAparata ? TIPOVI_APARATA[proizvod.tipAparata as keyof typeof TIPOVI_APARATA] : null

  return (
    <div className="kontejner py-10 md:py-14">
      <Mrvice
        stavke={[
          { naziv: 'Slušni aparati', putanja: '/slusni-aparati' },
          ...(tip && proizvod.tipAparata
            ? [{ naziv: tip.naziv, putanja: `/slusni-aparati/${proizvod.tipAparata}` }]
            : []),
          { naziv: proizvod.naziv },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1fr]">
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
          {slike.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {slike.slice(1, 5).map(
                (s, i) =>
                  typeof s === 'object' && (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-[12px] border border-neutral-200 bg-white p-2">
                      <SlikaMedija medij={s} fill sizes="140px" className="!relative h-full w-full object-contain" />
                    </div>
                  ),
              )}
            </div>
          )}
        </div>

        <div>
          {proizvod.brend && (
            <p className="text-small font-semibold tracking-wide text-neutral-500 uppercase">{proizvod.brend}</p>
          )}
          <h1 className="text-h1 mt-1">{proizvod.naziv}</h1>
          {tip && <p className="mt-2 font-medium text-brand-700">{tip.naziv}</p>}

          <div className="mt-5 rounded-[12px] bg-neutral-50 p-4">
            {proizvod.cijenaOd && proizvod.cijenaDo ? (
              <p className="telefon text-[22px]">{proizvod.cijenaOd} – {proizvod.cijenaDo} KM</p>
            ) : null}
            <p className="text-[15px] text-neutral-600">
              {proizvod.cijenaNapomena?.startsWith('[')
                ? proizvod.cijenaNapomena
                : (proizvod.cijenaNapomena ?? 'Cijena zavisi od modela i stepena oštećenja sluha — saznajte na besplatnom savjetovanju.')}
            </p>
          </div>

          {proizvod.opis && (
            <RichText data={proizvod.opis} className="prose-bm mt-6 text-neutral-700" />
          )}

          <div className="mt-8 space-y-3">
            <DugmeLink href="/zakazivanje" velicina="veliko" className="w-full">
              Zakažite besplatno savjetovanje
            </DugmeLink>
            <DugmeLink href="#upit" varijanta="sekundarno" velicina="veliko" className="w-full">
              Pošaljite upit za ovaj model
            </DugmeLink>
          </div>

          <div className="mt-10 rounded-[16px] border border-neutral-200 p-6">
            <h2 className="text-h3 mb-4">Upit za ovaj model</h2>
            <UpitZaProizvod
              proizvodId={proizvod.id as number}
              nazivProizvoda={proizvod.naziv}
              putanja={`/slusni-aparati/modeli/${slug}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
