import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Clock, Users } from 'lucide-react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { dajPayload, dajUsluge } from '@/lib/podaci'
import { metaStranice, uslugaJsonLd } from '@/lib/seo'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
import { DugmeLink } from '@/components/ui/Dugme'
import { Otkrij, OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'

async function dajUslugu(slug: string) {
  const payload = await dajPayload()
  const { docs } = await payload.find({
    collection: 'usluge',
    where: { and: [{ slug: { equals: slug } }, { aktivna: { equals: true } }] },
    limit: 1,
    depth: 1,
    draft: false,
  })
  return docs[0] ?? null
}

export async function generateStaticParams() {
  const usluge = await dajUsluge()
  return usluge.map((u) => ({ slug: u.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const u = await dajUslugu(slug)
  if (!u) return {}
  return metaStranice({
    naslov: u.seo?.naslov ?? u.naziv,
    opis: u.seo?.opis ?? u.kratkiOpis,
    putanja: `/usluge/${slug}`,
  })
}

export default async function UslugaStranica({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const usluga = await dajUslugu(slug)
  if (!usluga) notFound()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            uslugaJsonLd({ naziv: usluga.naziv, slug: usluga.slug, kratkiOpis: usluga.kratkiOpis }),
          ),
        }}
      />
      <ZaglavljeStranice
        mrvice={[{ naziv: 'Usluge', putanja: '/usluge' }, { naziv: usluga.naziv }]}
        nadnaslov="Usluga"
        naslov={usluga.naziv}
        uvod={usluga.kratkiOpis}
      >
        {usluga.trajanje && (
          <p className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-[15px] font-semibold text-neutral-700 shadow-sm">
            <Clock className="size-4.5 text-brand-600" aria-hidden />
            Trajanje: {usluga.trajanje}
          </p>
        )}
      </ZaglavljeStranice>

      <div className="kontejner pb-16 md:pb-24">
        {usluga.zaKoga && (
          <Otkrij className="povrsina mt-12 max-w-3xl !rounded-[24px] p-7 md:p-8">
            <h2 className="text-h3 flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-50">
                <Users className="size-5 text-brand-600" aria-hidden />
              </span>
              Za koga je ova usluga?
            </h2>
            <p className="mt-4 text-neutral-700">{usluga.zaKoga}</p>
          </Otkrij>
        )}

        {usluga.koraci && usluga.koraci.length > 0 && (
          <section className="sekcija !pb-0" aria-labelledby="koraci-naslov">
            <h2 id="koraci-naslov" className="text-h2">
              Kako izgleda, korak po korak
            </h2>
            <OtkrijGrupu className="mt-9 max-w-3xl">
              {usluga.koraci.map((k, i) => (
                <OtkrijStavku key={k.id ?? i}>
                  <div className="flex gap-5 border-b border-neutral-200/80 py-6 first:pt-0 last:border-b-0">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-brand-100 bg-brand-50 text-[17px] font-extrabold text-brand-700">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-[18px] font-bold text-neutral-900">{k.naslov}</h3>
                      <p className="mt-1 text-neutral-600">{k.opis}</p>
                    </div>
                  </div>
                </OtkrijStavku>
              ))}
            </OtkrijGrupu>
          </section>
        )}

        {usluga.sadrzaj && (
          <RichText data={usluga.sadrzaj} className="prose-bm mt-12 max-w-3xl text-neutral-700" />
        )}

        <Otkrij className="relative mt-16 max-w-3xl overflow-hidden rounded-[28px] border border-brand-200/60 bg-gradient-to-br from-white to-brand-50/50 p-8 text-center md:p-10">
          <h2 className="text-h3">Zainteresovani ste?</h2>
          <p className="mt-2 text-neutral-700">
            Zakažite termin ili nam pošaljite pitanje — sve bez obaveze.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3.5">
            <DugmeLink href="/zakazivanje" velicina="veliko">
              Zakažite termin
            </DugmeLink>
            <DugmeLink href="/kontakt" varijanta="sekundarno" velicina="veliko">
              Pošaljite upit
            </DugmeLink>
          </div>
        </Otkrij>
      </div>
    </>
  )
}
