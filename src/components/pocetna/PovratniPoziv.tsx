'use client'

import { useActionState } from 'react'
import { posaljiUpit, type StanjeObrasca } from '@/app/actions/posaljiUpit'
import { Dugme } from '@/components/ui/Dugme'
import { PoljeUnos, PoljeSaglasnost } from '@/components/ui/Polje'
import { Honeypot, Turnstile } from '@/components/ui/Turnstile'
import { AtribucijaPolja } from '@/components/ui/AtribucijaPolja'
import { zabiljezi } from '@/lib/analytics'
import { CheckCircle2 } from 'lucide-react'
import { useEffect } from 'react'

const pocetno: StanjeObrasca = { status: 'pocetno' }

/** Mikro-obrazac „Nazvat ćemo Vas": ime + telefon, ponavlja se kroz stranicu. */
export function PovratniPoziv({ izvor = 'pocetna' }: { izvor?: string }) {
  const [stanje, akcija, salje] = useActionState(posaljiUpit, pocetno)

  useEffect(() => {
    if (stanje.status === 'uspjeh') zabiljezi('lead_submit', { vrsta: 'povratni-poziv', izvor })
  }, [stanje.status, izvor])

  if (stanje.status === 'uspjeh') {
    return (
      <div className="flex items-center gap-3 rounded-[16px] bg-success-50 p-6 text-success-700" role="status">
        <CheckCircle2 className="size-7 shrink-0" aria-hidden />
        <p className="font-semibold">{stanje.poruka}</p>
      </div>
    )
  }

  return (
    <form action={akcija} className="space-y-4" data-forma>
      <Honeypot />
      <input type="hidden" name="vrsta" value="povratni-poziv" />
      <input type="hidden" name="izvorStranica" value={izvor} />
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <PoljeUnos
          oznaka="Vaše ime"
          name="ime"
          autoComplete="name"
          required
          greska={stanje.greske?.ime}
          placeholder="npr. Marija"
        />
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
        <Dugme type="submit" ucitava={salje} className="sm:mb-0">
          Nazovite me
        </Dugme>
      </div>
      <AtribucijaPolja />
      <PoljeSaglasnost name="saglasnost" greska={stanje.greske?.saglasnost} />
      <Turnstile />
      {stanje.status === 'greska' && stanje.poruka && !stanje.greske && (
        <p role="alert" className="rounded-[12px] bg-error-50 px-4 py-3 text-[15px] font-medium text-error-600">
          {stanje.poruka}
        </p>
      )}
    </form>
  )
}
