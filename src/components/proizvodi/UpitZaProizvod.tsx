'use client'

import { useActionState, useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { posaljiUpit, type StanjeObrasca } from '@/app/actions/posaljiUpit'
import { Dugme } from '@/components/ui/Dugme'
import { PoljeUnos, PoljeTekst, PoljeSaglasnost } from '@/components/ui/Polje'
import { Honeypot, Turnstile } from '@/components/ui/Turnstile'
import { AtribucijaPolja } from '@/components/ui/AtribucijaPolja'
import { zabiljezi } from '@/lib/analytics'

const pocetno: StanjeObrasca = { status: 'pocetno' }

/** Upit za konkretan proizvod — nosi naziv i ID proizvoda u inbox. */
export function UpitZaProizvod({
  proizvodId,
  nazivProizvoda,
  putanja,
}: {
  proizvodId: number
  nazivProizvoda: string
  putanja: string
}) {
  const [stanje, akcija, salje] = useActionState(posaljiUpit, pocetno)

  useEffect(() => {
    if (stanje.status === 'uspjeh') zabiljezi('lead_submit', { vrsta: 'kupovina', proizvod: nazivProizvoda })
  }, [stanje.status, nazivProizvoda])

  if (stanje.status === 'uspjeh') {
    return (
      <div className="flex items-start gap-3 rounded-[16px] bg-success-50 p-6 text-success-700" role="status">
        <CheckCircle2 className="mt-0.5 size-6 shrink-0" aria-hidden />
        <div>
          <p className="font-bold">Vaš upit je zaprimljen.</p>
          <p className="mt-1 text-[15px]">Kontaktirat ćemo Vas isti radni dan sa svim informacijama.</p>
        </div>
      </div>
    )
  }

  return (
    <form action={akcija} className="space-y-4" data-forma id="upit">
      <Honeypot />
      <input type="hidden" name="vrsta" value="kupovina" />
      <input type="hidden" name="proizvod" value={proizvodId} />
      <input type="hidden" name="izvorStranica" value={putanja} />
      <p className="rounded-[8px] bg-neutral-50 px-3 py-2 text-small text-neutral-600">
        Upit za: <strong>{nazivProizvoda}</strong>
      </p>
      <PoljeUnos oznaka="Ime i prezime" name="ime" autoComplete="name" required greska={stanje.greske?.ime} />
      <PoljeUnos
        oznaka="Broj telefona"
        name="telefon"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required
        greska={stanje.greske?.telefon}
        placeholder="npr. 065 123 456"
      />
      <PoljeUnos oznaka="E-mail (nije obavezno)" name="email" type="email" autoComplete="email" greska={stanje.greske?.email} />
      <PoljeTekst
        oznaka="Pitanje ili napomena (nije obavezno)"
        name="poruka"
        greska={stanje.greske?.poruka}
        placeholder="npr. Zanima me dostupnost i način preuzimanja."
      />
      <AtribucijaPolja pitaj />
      <PoljeSaglasnost name="saglasnost" greska={stanje.greske?.saglasnost} />
      <Turnstile />
      {stanje.status === 'greska' && stanje.poruka && (
        <p role="alert" className="rounded-[12px] bg-error-50 px-4 py-3 text-[15px] font-medium text-error-600">
          {stanje.poruka}
        </p>
      )}
      <Dugme type="submit" ucitava={salje} className="w-full">
        Pošaljite upit
      </Dugme>
    </form>
  )
}
