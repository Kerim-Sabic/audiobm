import type { Metadata } from 'next'
import { dajPoslovnice } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
import { ZakazivanjeKoraci } from '@/components/zakazivanje/ZakazivanjeKoraci'

export const metadata: Metadata = metaStranice({
  naslov: 'Zakažite besplatnu provjeru sluha',
  opis: 'Zakazivanje za manje od 2 minute: odaberite poslovnicu, ostavite ime i telefon — kontaktiramo Vas isti radni dan radi potvrde termina.',
  putanja: '/zakazivanje',
})

export default async function ZakazivanjeStranica({
  searchParams,
}: {
  searchParams: Promise<{ poslovnica?: string }>
}) {
  const [poslovnice, params] = await Promise.all([dajPoslovnice(), searchParams])

  const lokacije = poslovnice.map((p) => ({
    id: p.id as number,
    naziv: p.naziv,
    grad: p.grad,
    adresa: p.adresa,
    telefon: p.telefoni?.[0]?.broj,
    novaPoslovnica: Boolean(p.novaPoslovnica),
  }))

  const predodabrana = params.poslovnica
    ? poslovnice.find((p) => p.slug === params.poslovnica)?.id
    : undefined

  return (
    <div className="kontejner py-10 md:py-14">
      <Mrvice stavke={[{ naziv: 'Zakazivanje termina' }]} />
      <div className="mx-auto mt-6 max-w-3xl">
        <p className="nadnaslov">Bez obaveze · traje 2 minute</p>
        <h1 className="text-h1 mt-3">Zakažite besplatnu provjeru sluha</h1>
        <p className="uvodni mt-3 mb-10">
          Potrebne su samo dvije minute. Provjera je besplatna i ne obavezuje Vas ni na šta.
        </p>
        <ZakazivanjeKoraci lokacije={lokacije} predodabranaLokacija={predodabrana as number | undefined} />
      </div>
    </div>
  )
}
