import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Camera, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { dajPayload, dajPoslovnice, dajPoslovnicu } from '@/lib/podaci'
import { metaStranice, poslovnicaJsonLd } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
import { TelefonLink, ViberLink, WhatsAppLink } from '@/components/ui/TelefonLink'
import { DugmeLink } from '@/components/ui/Dugme'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import { Otkrij } from '@/components/motion/Otkrij'
import { uGradu } from '@/lib/gradovi'
import type { Mediji } from '@/payload-types'

export async function generateStaticParams() {
  const poslovnice = await dajPoslovnice()
  return poslovnice.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await dajPoslovnicu(slug)
  if (!p) return {}
  return metaStranice({
    naslov: p.seo?.naslov ?? `Audio BM ${p.grad} — slušni aparati i provjera sluha`,
    opis:
      p.seo?.opis ??
      `Audio BM poslovnica — ${p.grad}. Besplatna provjera sluha, slušni aparati, baterije i servis.`,
    putanja: `/poslovnice/${slug}`,
  })
}

const DANI: Record<string, string> = {
  ponedjeljak: 'Ponedjeljak',
  utorak: 'Utorak',
  srijeda: 'Srijeda',
  cetvrtak: 'Četvrtak',
  petak: 'Petak',
  subota: 'Subota',
  nedjelja: 'Nedjelja',
}

export default async function PoslovnicaStranica({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const poslovnica = await dajPoslovnicu(slug)
  if (!poslovnica) notFound()

  const payload = await dajPayload()
  const [tim, recenzije] = await Promise.all([
    payload.find({
      collection: 'tim',
      where: { and: [{ poslovnica: { equals: poslovnica.id } }, { aktivan: { equals: true } }] },
      sort: 'redoslijed',
      limit: 10,
      depth: 1,
    }),
    payload.find({
      collection: 'recenzije',
      where: { and: [{ poslovnica: { equals: poslovnica.id } }, { odobreno: { equals: true } }] },
      limit: 4,
      depth: 0,
    }),
  ])

  const telefon = poslovnica.telefoni?.[0]?.broj
  const telefonPlaceholder = !telefon || telefon.startsWith('[')
  const adresaPlaceholder = poslovnica.adresa.startsWith('[')
  const email = poslovnica.emaili?.[0]?.email
  const fotografija = (poslovnica.fotografije as (Mediji | number)[] | undefined)?.[0]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(poslovnicaJsonLd(poslovnica)) }}
      />
      <div className="kontejner py-10 md:py-14">
        <Mrvice stavke={[{ naziv: 'Poslovnice', putanja: '/poslovnice' }, { naziv: poslovnica.grad }]} />

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <h1 className="text-h1">Audio BM {poslovnica.grad}</h1>
          {poslovnica.novaPoslovnica && (
            <span className="rounded-full bg-brand-600 px-3 py-1 text-[13px] font-bold tracking-wide text-white uppercase">
              Novo otvoreno
            </span>
          )}
        </div>
        {poslovnica.opis && <p className="mt-3 max-w-2xl text-[18px] text-neutral-600">{poslovnica.opis}</p>}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-8">
            {/* fotografija poslovnice */}
            {fotografija && typeof fotografija === 'object' ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-[16px]">
                <SlikaMedija medij={fotografija} fill sizes="(min-width: 1024px) 640px, 100vw" />
              </div>
            ) : (
              <div className="grid aspect-[16/9] place-items-center rounded-[16px] border-2 border-dashed border-neutral-300 bg-neutral-50 text-center">
                <div className="px-6 text-neutral-500">
                  <Camera className="mx-auto mb-2 size-8 text-neutral-400" aria-hidden />
                  <p className="font-medium">[OWNER_PHOTOSHOOT_PLACEHOLDER]</p>
                  <p className="text-small">Fotografija poslovnice — dodajte je u administraciji</p>
                </div>
              </div>
            )}

            {/* mapa */}
            {!adresaPlaceholder ? (
              <div className="overflow-hidden rounded-[16px] border border-neutral-200">
                <iframe
                  title={`Mapa — Audio BM ${poslovnica.grad}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${poslovnica.adresa}, ${poslovnica.grad}`)}&z=16&output=embed`}
                  className="h-[320px] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {poslovnica.googleMapsLink && (
                  <a
                    href={poslovnica.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-12 items-center justify-center gap-2 bg-white py-3 font-semibold text-brand-700 transition-colors duration-150 hover:bg-brand-50"
                  >
                    <MapPin className="size-4" aria-hidden />
                    Upute za dolazak
                  </a>
                )}
              </div>
            ) : (
              <div className="rounded-[16px] bg-warning-50 p-6 text-warning-600">
                <p className="font-semibold">[ADRESA_PLACEHOLDER]</p>
                <p className="text-small mt-1">
                  Tačna adresa poslovnice u Sarajevu biće objavljena uskoro. Za informacije nas
                  kontaktirajte telefonom ili putem obrasca.
                </p>
              </div>
            )}

            {/* tim */}
            {tim.docs.length > 0 && (
              <Otkrij>
                <h2 className="text-h2 mb-5">Vaš tim {uGradu(poslovnica.grad)}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {tim.docs.map((clan) => (
                    <div key={clan.id} className="rounded-[16px] border border-neutral-200 bg-white p-5">
                      <p className="font-bold">{clan.ime}</p>
                      {clan.titula && <p className="text-small text-neutral-600">{clan.titula}</p>}
                    </div>
                  ))}
                </div>
              </Otkrij>
            )}

            {/* lokalne recenzije */}
            {recenzije.docs.length > 0 && (
              <Otkrij>
                <h2 className="text-h2 mb-5">Iskustva korisnika</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {recenzije.docs.map((r) => (
                    <blockquote key={r.id} className="rounded-[16px] border border-neutral-200 bg-white p-5">
                      <p className="text-[16px] text-neutral-700">„{r.tekst}"</p>
                      <footer className="mt-3 text-small font-semibold text-neutral-900">{r.ime}</footer>
                    </blockquote>
                  ))}
                </div>
              </Otkrij>
            )}
          </div>

          {/* bočna kolona: kontakt + radno vrijeme + CTA */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[16px] border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-h3 mb-4">Kontakt</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-1 size-5 shrink-0 text-brand-600" aria-hidden />
                  <span className={adresaPlaceholder ? 'font-medium text-warning-600' : ''}>
                    {poslovnica.adresa}, {poslovnica.grad}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-1 size-5 shrink-0 text-brand-600" aria-hidden />
                  {telefonPlaceholder ? (
                    <span className="font-medium text-warning-600">[TELEFON_PLACEHOLDER]</span>
                  ) : (
                    <TelefonLink
                      broj={telefon!}
                      lokacija={poslovnica.slug}
                      saIkonom={false}
                      className="text-[22px] text-neutral-900 hover:text-brand-700"
                    />
                  )}
                </li>
                {email && (
                  <li className="flex items-start gap-3">
                    <Mail className="mt-1 size-5 shrink-0 text-brand-600" aria-hidden />
                    <a href={`mailto:${email}`} className="break-all text-brand-700 underline-offset-2 hover:underline">
                      {email}
                    </a>
                  </li>
                )}
              </ul>

              {/* Viber / WhatsApp */}
              {poslovnica.viber || poslovnica.whatsapp ? (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {poslovnica.whatsapp && (
                    <WhatsAppLink
                      broj={poslovnica.whatsapp}
                      lokacija={poslovnica.slug}
                      poruka={`Poštovani, javljam se sa stranice poslovnice ${poslovnica.grad}. `}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-[12px] bg-success-600 font-semibold text-white transition-colors duration-150 hover:bg-success-700"
                    >
                      <MessageCircle className="size-5" aria-hidden /> WhatsApp
                    </WhatsAppLink>
                  )}
                  {poslovnica.viber && (
                    <ViberLink
                      broj={poslovnica.viber}
                      lokacija={poslovnica.slug}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-[12px] bg-[#7360f2] font-semibold text-white transition-opacity duration-150 hover:opacity-90"
                    >
                      <MessageCircle className="size-5" aria-hidden /> Viber
                    </ViberLink>
                  )}
                </div>
              ) : (
                <p className="text-small mt-5 rounded-[8px] bg-neutral-50 p-3 text-neutral-500">
                  [BROJEVI_PLACEHOLDER] Viber i WhatsApp brojevi se dodaju u administraciji
                  (Poslovnice → {poslovnica.grad}).
                </p>
              )}
            </div>

            <div className="rounded-[16px] border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-h3 mb-4 flex items-center gap-2">
                <Clock className="size-5 text-brand-600" aria-hidden />
                Radno vrijeme
              </h2>
              {poslovnica.radnoVrijemePotvrdjeno && poslovnica.radnoVrijeme?.length ? (
                <table className="w-full text-[16px]">
                  <tbody>
                    {poslovnica.radnoVrijeme.map((rv, i) => (
                      <tr key={i} className="border-b border-neutral-100 last:border-0">
                        <th scope="row" className="py-2 text-left font-medium text-neutral-700">
                          {DANI[rv.dan] ?? rv.dan}
                        </th>
                        <td className="telefon py-2 text-right text-[15px]">
                          {rv.zatvoreno ? 'Zatvoreno' : `${rv.od ?? ''} – ${rv.do ?? ''}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-[15px] text-neutral-600">
                  <span className="font-medium text-warning-600">[RADNO_VRIJEME_PLACEHOLDER]</span>
                  <br />
                  Molimo provjerite radno vrijeme telefonom prije dolaska — rado ćemo Vas dočekati.
                </p>
              )}
            </div>

            <DugmeLink
              href={`/zakazivanje?poslovnica=${poslovnica.slug}`}
              velicina="veliko"
              className="w-full"
            >
              Zakažite termin {uGradu(poslovnica.grad)}
            </DugmeLink>
          </aside>
        </div>
      </div>
    </>
  )
}
