import type { Metadata } from 'next'
import { ShieldCheck, Clock, PhoneCall } from 'lucide-react'
import { dajPoslovnice } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { stvarno } from '@/lib/tekst'
import { Mrvice } from '@/components/ui/Mrvice'
import { ZakazivanjeKoraci } from '@/components/zakazivanje/ZakazivanjeKoraci'

export const metadata: Metadata = metaStranice({
  naslov: 'Zakažite besplatnu provjeru sluha',
  opis: 'Zakazivanje za manje od 2 minute: odaberite poslovnicu, ostavite ime i telefon — kontaktiramo Vas isti radni dan radi potvrde termina.',
  putanja: '/zakazivanje',
})

export default async function ZakazivanjeStranica() {
  const poslovnice = await dajPoslovnice()

  const lokacije = poslovnice.map((p) => ({
    id: p.id as number,
    slug: p.slug,
    naziv: p.naziv,
    grad: p.grad,
    adresa: stvarno(p.adresa) ?? '',
    telefon: stvarno(p.telefoni?.[0]?.broj) ?? undefined,
    novaPoslovnica: Boolean(p.novaPoslovnica),
  }))

  return (
    <div className="relative overflow-hidden">
      <div className="mreza-audiogram absolute inset-x-0 top-0 h-[420px] [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <div className="kontejner relative py-8 md:py-12">
        <Mrvice stavke={[{ naziv: 'Zakazivanje termina' }]} />
        <div className="mx-auto mt-8 max-w-3xl">
          <p className="nadnaslov">Bez obaveze · traje 2 minute</p>
          <h1 className="text-h1 mt-3.5">Zakažite besplatnu provjeru sluha</h1>
          <p className="uvodni mt-4">
            Potrebne su samo dvije minute. Provjera je besplatna i ne obavezuje Vas ni na šta.
          </p>

          <ul className="mt-7 mb-10 flex flex-wrap gap-x-7 gap-y-2.5 text-[14.5px] font-semibold text-neutral-600">
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4.5 text-success-600" aria-hidden />
              100% besplatno
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4.5 text-brand-600" aria-hidden />
              Pregled traje 30–45 min
            </li>
            <li className="flex items-center gap-2">
              <PhoneCall className="size-4.5 text-brand-600" aria-hidden />
              Potvrda telefonom isti radni dan
            </li>
          </ul>

          <div className="povrsina !rounded-[28px] p-6 !shadow-[var(--shadow-lift-lg)] md:p-10">
            <ZakazivanjeKoraci lokacije={lokacije} />
          </div>
        </div>
      </div>
    </div>
  )
}
