import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShieldCheck, CalendarCheck } from 'lucide-react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { dajPayload } from '@/lib/podaci'
import { metaStranice, proizvodJsonLd, OSNOVNI_URL } from '@/lib/seo'
import { stvarno } from '@/lib/tekst'
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
    opis: p.seo?.opis ?? p.kratkiOpis ?? `${p.naziv} — saznajte da li je pravi za Vas na besplatnom savjetovanju kod nas.`,
    putanja: `/slusni-aparati/modeli/${slug}`,
  })
}

export default async function ModelStranica({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const proizvod = await dajAparat(slug)
  if (!proizvod) notFound()

  const slike = (proizvod.slike as (Mediji | number)[] | undefined) ?? []
  const tip = proizvod.tipAparata ? TIPOVI_APARATA[proizvod.tipAparata as keyof typeof TIPOVI_APARATA] : null
  const napomena = stvarno(proizvod.cijenaNapomena)
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
              cijena: proizvod.cijena,
              slika: slikaUrl,
            }),
          ),
        }}
      />
      <Mrvice
        stavke={[
          { naziv: 'Slušni aparati', putanja: '/slusni-aparati' },
          ...(tip && proizvod.tipAparata
            ? [{ naziv: tip.naziv, putanja: `/slusni-aparati/${proizvod.tipAparata}` }]
            : []),
          { naziv: proizvod.naziv },
        ]}
      />

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="lg:sticky lg:top-32">
          <div className="povrsina relative grid aspect-square place-items-center overflow-hidden !rounded-[28px] bg-gradient-to-br from-white to-neutral-50 p-10">
            <div className="mreza-audiogram absolute inset-0" aria-hidden />
            <SlikaMedija
              medij={typeof slike[0] === 'object' ? slike[0] : null}
              altRezerva={`${proizvod.naziv} — slušni aparat${tip ? ` (${tip.naziv})` : ''}`}
              sizes="(min-width: 1024px) 560px, 100vw"
              prioritet
              className="relative max-h-full w-auto object-contain drop-shadow-xl"
            />
          </div>
          {slike.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {slike.slice(1, 5).map(
                (s, i) =>
                  typeof s === 'object' && (
                    <div key={i} className="povrsina grid aspect-square place-items-center overflow-hidden !rounded-[14px] p-3">
                      <SlikaMedija medij={s} sizes="140px" className="max-h-full w-auto object-contain" />
                    </div>
                  ),
              )}
            </div>
          )}
        </div>

        <div>
          {proizvod.brend && (
            <p className="text-[13px] font-bold tracking-[0.16em] text-neutral-500 uppercase">{proizvod.brend}</p>
          )}
          <h1 className="text-h1 mt-1.5">{proizvod.naziv}</h1>
          {tip && <p className="mt-2 font-medium text-brand-700">{tip.naziv}</p>}

          <div className="povrsina mt-6 !rounded-[18px] bg-neutral-50 p-5">
            {proizvod.cijenaOd && proizvod.cijenaDo ? (
              <p className="telefon text-[24px] text-neutral-900">
                {proizvod.cijenaOd} – {proizvod.cijenaDo} KM
              </p>
            ) : null}
            <p className="text-[15px] text-neutral-600">
              {napomena ??
                'Cijena zavisi od modela i stepena oštećenja sluha — saznajte na besplatnom savjetovanju.'}
            </p>
            <p className="mt-3 flex items-center gap-2 border-t border-neutral-200/70 pt-3 text-[14px] font-medium text-neutral-600">
              <ShieldCheck className="size-4 text-success-600" aria-hidden />
              Proba aparata i savjetovanje su besplatni i bez obaveze
            </p>
          </div>

          {proizvod.opis && <RichText data={proizvod.opis} className="prose-bm mt-7 text-neutral-700" />}

          <div className="mt-8 space-y-3">
            <DugmeLink href="/zakazivanje" velicina="veliko" className="w-full">
              <CalendarCheck className="size-5" aria-hidden />
              Zakažite besplatno savjetovanje
            </DugmeLink>
            <DugmeLink href="#upit" varijanta="sekundarno" velicina="veliko" className="w-full">
              Pošaljite upit za ovaj model
            </DugmeLink>
          </div>

          <div id="upit" className="povrsina mt-10 scroll-mt-32 !rounded-[24px] p-6 md:p-8">
            <h2 className="text-h3 mb-5">Upit za ovaj model</h2>
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
