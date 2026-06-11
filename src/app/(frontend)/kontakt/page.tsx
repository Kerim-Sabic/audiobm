import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { dajPoslovnice } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
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
    <div className="kontejner py-10 md:py-14">
      <Mrvice stavke={[{ naziv: 'Kontakt' }]} />
      <h1 className="text-h1 mt-6">Kontaktirajte nas</h1>
      <p className="mt-3 max-w-2xl text-[18px] text-neutral-600">
        Tu smo za svako pitanje — odgovaramo <strong>isti radni dan</strong>.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-[16px] border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-h3 mb-6">Pošaljite nam poruku</h2>
          <KontaktObrazac poslovnice={poslovnice.map((p) => ({ id: p.id as number, grad: p.grad }))} />
        </div>

        <aside className="space-y-4">
          <h2 className="text-h3">Pozovite nas direktno</h2>
          {poslovnice.map((p) => {
            const telefon = p.telefoni?.[0]?.broj
            const telefonPlaceholder = !telefon || telefon.startsWith('[')
            return (
              <div key={p.id} className="rounded-[16px] border border-neutral-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/poslovnice/${p.slug}`} className="font-bold text-neutral-900 hover:text-brand-700">
                    {p.grad}
                  </Link>
                  {p.novaPoslovnica && (
                    <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold tracking-wide text-white uppercase">
                      Novo
                    </span>
                  )}
                </div>
                {telefonPlaceholder ? (
                  <p className="mt-1 text-[15px] font-medium text-warning-600">[TELEFON_PLACEHOLDER]</p>
                ) : (
                  <TelefonLink
                    broj={telefon}
                    lokacija={p.slug}
                    className="mt-1 text-[20px] text-neutral-900 hover:text-brand-700"
                  />
                )}
                {!p.radnoVrijemePotvrdjeno && (
                  <p className="text-small mt-1 text-neutral-500">
                    Radno vrijeme provjerite pozivom [RADNO_VRIJEME_PLACEHOLDER]
                  </p>
                )}
                {(p.whatsapp || p.viber) && (
                  <div className="mt-3 flex gap-2">
                    {p.whatsapp && (
                      <WhatsAppLink
                        broj={p.whatsapp}
                        lokacija={p.slug}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-[8px] bg-success-50 px-3 text-[14px] font-semibold text-success-700"
                      >
                        <MessageCircle className="size-4" aria-hidden /> WhatsApp
                      </WhatsAppLink>
                    )}
                    {p.viber && (
                      <ViberLink
                        broj={p.viber}
                        lokacija={p.slug}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-[8px] bg-[#7360f2]/10 px-3 text-[14px] font-semibold text-[#5b4bd1]"
                      >
                        <MessageCircle className="size-4" aria-hidden /> Viber
                      </ViberLink>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          <p className="text-small rounded-[12px] bg-neutral-50 p-4 text-neutral-500">
            [BROJEVI_PLACEHOLDER] WhatsApp/Viber brojevi po poslovnici unose se u administraciji.
          </p>
        </aside>
      </div>
    </div>
  )
}
