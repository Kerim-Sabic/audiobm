import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Clock, Users } from 'lucide-react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { dajPayload, dajUsluge } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
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
    <div className="kontejner py-10 md:py-14">
      <Mrvice stavke={[{ naziv: 'Usluge', putanja: '/usluge' }, { naziv: usluga.naziv }]} />

      <div className="mt-6 max-w-3xl">
        <h1 className="text-h1">{usluga.naziv}</h1>
        <p className="mt-4 text-[18px] text-neutral-600">{usluga.kratkiOpis}</p>

        <div className="mt-6 flex flex-wrap gap-6 text-[16px] text-neutral-700">
          {usluga.trajanje && (
            <p className="flex items-center gap-2">
              <Clock className="size-5 text-brand-600" aria-hidden />
              <strong>Trajanje:</strong> {usluga.trajanje}
            </p>
          )}
        </div>
      </div>

      {usluga.zaKoga && (
        <Otkrij className="mt-10 max-w-3xl rounded-[16px] bg-neutral-50 p-7">
          <h2 className="text-h3 flex items-center gap-2">
            <Users className="size-6 text-brand-600" aria-hidden />
            Za koga je ova usluga?
          </h2>
          <p className="mt-3 text-neutral-700">{usluga.zaKoga}</p>
        </Otkrij>
      )}

      {usluga.koraci && usluga.koraci.length > 0 && (
        <section className="sekcija" aria-labelledby="koraci-naslov">
          <h2 id="koraci-naslov" className="text-h2">
            Kako izgleda, korak po korak
          </h2>
          <OtkrijGrupu className="mt-8 grid max-w-3xl gap-4">
            {usluga.koraci.map((k, i) => (
              <OtkrijStavku key={k.id ?? i}>
                <div className="flex gap-5 rounded-[16px] border border-neutral-200 bg-white p-6 shadow-sm">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-600 text-[18px] font-bold text-white">
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
        <RichText data={usluga.sadrzaj} className="prose-bm max-w-3xl text-neutral-700" />
      )}

      <div className="mt-14 max-w-3xl rounded-[16px] bg-brand-50/60 p-8 text-center">
        <h2 className="text-h3">Zainteresovani ste?</h2>
        <p className="mt-2 text-neutral-700">
          Zakažite termin ili nam pošaljite pitanje — sve bez obaveze.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-4">
          <DugmeLink href="/zakazivanje" velicina="veliko">
            Zakažite termin
          </DugmeLink>
          <DugmeLink href="/kontakt" varijanta="sekundarno" velicina="veliko">
            Pošaljite upit
          </DugmeLink>
        </div>
      </div>
    </div>
  )
}
