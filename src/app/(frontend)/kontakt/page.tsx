import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle, MapPin } from 'lucide-react'
import { dajPoslovnice } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { stvarno } from '@/lib/tekst'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
import { TelefonLink, ViberLink, WhatsAppLink } from '@/components/ui/TelefonLink'
import { KontaktObrazac } from '@/components/kontakt/KontaktObrazac'

export const metadata: Metadata = metaStranice({
  naslov: 'Kontakt — pišite nam ili pozovite najbližu poslovnicu',
  opis: 'Pitanje za doktora, poruka za poslovnicu ili kupovina — odgovaramo isti radni dan. Telefoni svih 6 poslovnica na jednom mjestu.',
  putanja: '/kontakt',
})

export default async function KontaktStranica() {
  const poslovnice = await dajPoslovnice()

  return (
    <>
      <ZaglavljeStranice
        mrvice={[{ naziv: 'Kontakt' }]}
        nadnaslov="Odgovaramo isti radni dan"
        naslov="Kontaktirajte nas"
        uvod="Pitanje za doktora, poruka za poslovnicu ili narudžba — tu smo za Vas."
      />

      <div className="kontejner pb-16 md:pb-24">
        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="povrsina !rounded-[28px] p-6 md:p-9">
            <h2 className="text-h3 mb-2">Pošaljite nam poruku</h2>
            <p className="text-small mb-7 text-neutral-500">
              Sva polja sa Vašim podacima čuvamo povjerljivo, u skladu sa politikom privatnosti.
            </p>
            <KontaktObrazac poslovnice={poslovnice.map((p) => ({ id: p.id as number, grad: p.grad }))} />
          </div>

          <aside className="lg:sticky lg:top-32">
            <h2 className="text-h3">Pozovite nas direktno</h2>
            <div className="mt-5 space-y-3.5">
              {poslovnice.map((p) => {
                const telefon = stvarno(p.telefoni?.[0]?.broj)
                return (
                  <div key={p.id} className="povrsina p-5">
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={`/poslovnice/${p.slug}`}
                        className="inline-flex items-center gap-2 font-bold text-neutral-900 transition-colors duration-150 hover:text-brand-700"
                      >
                        <MapPin className="size-4 text-brand-600" aria-hidden />
                        {p.grad}
                      </Link>
                      {p.novaPoslovnica && (
                        <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10.5px] font-bold tracking-wide text-white uppercase">
                          Novo
                        </span>
                      )}
                    </div>
                    {telefon ? (
                      <TelefonLink
                        broj={telefon}
                        lokacija={p.slug}
                        className="mt-1.5 text-[20px] text-neutral-900 hover:text-brand-700"
                      />
                    ) : (
                      <p className="text-small mt-1.5 text-neutral-500">
                        Broj telefona objavljujemo uskoro — pišite nam putem obrasca.
                      </p>
                    )}
                    {!p.radnoVrijemePotvrdjeno && telefon && (
                      <p className="text-small mt-1 text-neutral-500">
                        Radno vrijeme provjerite pozivom.
                      </p>
                    )}
                    {(p.whatsapp || p.viber) && (
                      <div className="mt-3 flex gap-2">
                        {p.whatsapp && (
                          <WhatsAppLink
                            broj={p.whatsapp}
                            lokacija={p.slug}
                            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-success-50 px-3.5 text-[14px] font-semibold text-success-700 transition-colors duration-150 hover:bg-success-600 hover:text-white"
                          >
                            <MessageCircle className="size-4" aria-hidden /> WhatsApp
                          </WhatsAppLink>
                        )}
                        {p.viber && (
                          <ViberLink
                            broj={p.viber}
                            lokacija={p.slug}
                            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#7360f2]/10 px-3.5 text-[14px] font-semibold text-[#5b4bd1] transition-colors duration-150 hover:bg-[#7360f2] hover:text-white"
                          >
                            <MessageCircle className="size-4" aria-hidden /> Viber
                          </ViberLink>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
