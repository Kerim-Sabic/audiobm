import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { dajPayload, dajOcjenu } from '@/lib/podaci'
import { dajLokacije, dajLokaciju } from '@/data/locations'
import { metaStranice, poslovnicaJsonLd } from '@/lib/seo'
import { stvarno } from '@/lib/tekst'
import { Mrvice } from '@/components/ui/Mrvice'
import { TelefonLink, ViberLink, WhatsAppLink } from '@/components/ui/TelefonLink'
import { DugmeLink } from '@/components/ui/Dugme'
import { SlikaMedija } from '@/components/ui/SlikaMedija'
import { Otkrij } from '@/components/motion/Otkrij'
import { uGradu } from '@/lib/gradovi'
import type { Mediji } from '@/payload-types'

export async function generateStaticParams() {
  const poslovnice = await dajLokacije()
  return poslovnice.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await dajLokaciju(slug)
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
  const poslovnica = await dajLokaciju(slug)
  if (!poslovnica) notFound()

  const payload = await dajPayload()
  const [tim, recenzije, ocjena] = await Promise.all([
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
    dajOcjenu(poslovnica.id),
  ])

  const telefon = stvarno(poslovnica.telefoni?.[0]?.broj)
  const adresa = stvarno(poslovnica.adresa)
  const email = stvarno(poslovnica.emaili?.[0]?.email)
  const fotografija = (poslovnica.fotografije as (Mediji | number)[] | undefined)?.[0]
  const imaFotografiju = fotografija && typeof fotografija === 'object'
  // nova poslovnica bez fotografije, mape, tima i recenzija → jedna centrirana kolona
  const imaGlavniSadrzaj =
    Boolean(imaFotografiju) || Boolean(adresa) || tim.docs.length > 0 || recenzije.docs.length > 0

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(poslovnicaJsonLd(poslovnica, ocjena)) }}
      />
      <header className="relative overflow-hidden border-b border-neutral-200/70 bg-neutral-50">
        <div className="mreza-audiogram absolute inset-0" aria-hidden />
        <div
          className="absolute -top-48 right-[-8%] size-[480px] rounded-full bg-brand-100/40 blur-[130px]"
          aria-hidden
        />
        <div className="kontejner relative py-10 md:py-16">
          <Mrvice stavke={[{ naziv: 'Poslovnice', putanja: '/poslovnice' }, { naziv: poslovnica.grad }]} />
          <div className="mt-7 flex flex-wrap items-center gap-3.5">
            <h1 className="text-h1">Audio BM {poslovnica.grad}</h1>
            {poslovnica.novaPoslovnica && (
              <span className="flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-[12px] font-bold tracking-wide text-white uppercase">
                <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden />
                Novo otvoreno
              </span>
            )}
          </div>
          {poslovnica.opis && <p className="uvodni mt-4 max-w-2xl">{poslovnica.opis}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2.5 text-[15.5px] font-medium text-neutral-700">
            {adresa && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4.5 text-brand-600" aria-hidden />
                {adresa}, {poslovnica.grad}
              </span>
            )}
            {telefon && (
              <TelefonLink
                broj={telefon}
                lokacija={poslovnica.slug}
                className="text-[18px] text-neutral-900 hover:text-brand-700"
              />
            )}
          </div>
        </div>
      </header>

      <div className="kontejner py-10 md:py-14">
        <div
          className={
            imaGlavniSadrzaj
              ? 'grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]'
              : 'mx-auto grid max-w-xl items-start gap-10'
          }
        >
          {imaGlavniSadrzaj && (
          <div className="space-y-10">
            {/* fotografija poslovnice — prikazuje se samo ako postoji */}
            {imaFotografiju && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-[24px] shadow-[var(--shadow-lift)]">
                <SlikaMedija
                  medij={fotografija}
                  altRezerva={`Audio BM ${poslovnica.grad} — poslovnica`}
                  fill
                  sizes="(min-width: 1024px) 640px, 100vw"
                />
              </div>
            )}

            {/* mapa — samo uz stvarnu adresu */}
            {adresa && (
              <div className="povrsina overflow-hidden !rounded-[24px]">
                <iframe
                  title={`Mapa — Audio BM ${poslovnica.grad}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${adresa}, ${poslovnica.grad}`)}&z=16&output=embed`}
                  className="h-[340px] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {poslovnica.googleMapsLink && (
                  <a
                    href={poslovnica.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-12 items-center justify-center gap-2 border-t border-neutral-100 bg-white py-3.5 font-semibold text-brand-700 transition-colors duration-150 hover:bg-brand-50"
                  >
                    <MapPin className="size-4" aria-hidden />
                    Upute za dolazak
                  </a>
                )}
              </div>
            )}

            {/* tim */}
            {tim.docs.length > 0 && (
              <Otkrij>
                <h2 className="text-h2 mb-6">Vaš tim {uGradu(poslovnica.grad)}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {tim.docs.map((clan) => (
                    <div key={clan.id} className="povrsina flex items-center gap-4 p-5">
                      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-50 text-[18px] font-bold text-brand-700">
                        {clan.ime.charAt(0)}
                      </span>
                      <div>
                        <p className="font-bold text-neutral-900">{clan.ime}</p>
                        {clan.titula && <p className="text-small text-neutral-600">{clan.titula}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </Otkrij>
            )}

            {/* lokalne recenzije */}
            {recenzije.docs.length > 0 && (
              <Otkrij>
                <h2 className="text-h2 mb-6">Iskustva korisnika</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {recenzije.docs.map((r) => (
                    <blockquote key={r.id} className="povrsina p-6">
                      <p className="text-[16px] text-neutral-700">„{r.tekst}"</p>
                      <footer className="text-small mt-3.5 font-semibold text-neutral-900">{r.ime}</footer>
                    </blockquote>
                  ))}
                </div>
              </Otkrij>
            )}
          </div>
          )}

          {/* bočna kolona: kontakt + radno vrijeme + CTA */}
          <aside className="space-y-5 lg:sticky lg:top-32 lg:self-start">
            <div className="povrsina !rounded-[24px] p-6 md:p-7">
              <h2 className="text-h3 mb-5">Kontakt</h2>
              <ul className="space-y-4">
                {adresa && (
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-1 size-5 shrink-0 text-brand-600" aria-hidden />
                    <span>
                      {adresa}, {poslovnica.grad}
                    </span>
                  </li>
                )}
                {telefon && (
                  <li className="flex items-start gap-3">
                    <Phone className="mt-1.5 size-5 shrink-0 text-brand-600" aria-hidden />
                    <TelefonLink
                      broj={telefon}
                      lokacija={poslovnica.slug}
                      saIkonom={false}
                      className="text-[22px] text-neutral-900 hover:text-brand-700"
                    />
                  </li>
                )}
                {email && (
                  <li className="flex items-start gap-3">
                    <Mail className="mt-1 size-5 shrink-0 text-brand-600" aria-hidden />
                    <a href={`mailto:${email}`} className="break-all text-brand-700 underline-offset-2 hover:underline">
                      {email}
                    </a>
                  </li>
                )}
                {!adresa && !telefon && (
                  <li className="text-neutral-600">
                    Uskoro objavljujemo kontakt podatke ove poslovnice. U međuvremenu nas
                    kontaktirajte putem obrasca ili centralnog telefona.
                  </li>
                )}
              </ul>

              {(poslovnica.whatsapp || poslovnica.viber) && (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {poslovnica.whatsapp && (
                    <WhatsAppLink
                      broj={poslovnica.whatsapp}
                      lokacija={poslovnica.slug}
                      poruka={`Poštovani, javljam se sa stranice poslovnice ${poslovnica.grad}. `}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-success-600 font-semibold text-white transition-colors duration-150 hover:bg-success-700"
                    >
                      <MessageCircle className="size-5" aria-hidden /> WhatsApp
                    </WhatsAppLink>
                  )}
                  {poslovnica.viber && (
                    <ViberLink
                      broj={poslovnica.viber}
                      lokacija={poslovnica.slug}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#7360f2] font-semibold text-white transition-opacity duration-150 hover:opacity-90"
                    >
                      <MessageCircle className="size-5" aria-hidden /> Viber
                    </ViberLink>
                  )}
                </div>
              )}
            </div>

            <div className="povrsina !rounded-[24px] p-6 md:p-7">
              <h2 className="text-h3 mb-4 flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-brand-50">
                  <Clock className="size-4.5 text-brand-600" aria-hidden />
                </span>
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
                  Radno vrijeme provjerite telefonom prije dolaska — rado ćemo Vas dočekati.
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
            <p className="text-small text-center text-neutral-500">
              Besplatno i bez obaveze · odgovaramo isti radni dan
            </p>
          </aside>
        </div>
      </div>
    </>
  )
}
