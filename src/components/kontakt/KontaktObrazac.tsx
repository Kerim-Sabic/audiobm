'use client'

import { useActionState, useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { posaljiUpit, type StanjeObrasca } from '@/app/actions/posaljiUpit'
import { Dugme } from '@/components/ui/Dugme'
import { PoljeUnos, PoljeTekst, PoljeIzbor, PoljeSaglasnost } from '@/components/ui/Polje'
import { Honeypot, Turnstile } from '@/components/ui/Turnstile'
import { AtribucijaPolja } from '@/components/ui/AtribucijaPolja'
import { zabiljezi } from '@/lib/analytics'

const pocetno: StanjeObrasca = { status: 'pocetno' }

const TEME = [
  { value: 'doktor', label: 'Pitanje za doktora' },
  { value: 'poslovnica', label: 'Poruka za poslovnicu' },
  { value: 'kupovina', label: 'Kupovina proizvoda' },
  { value: 'podrska', label: 'Opšta podrška' },
] as const

/** Kontakt obrazac sa usmjeravanjem po temi i poslovnici. */
export function KontaktObrazac({
  poslovnice,
}: {
  poslovnice: { id: number; grad: string }[]
}) {
  const [stanje, akcija, salje] = useActionState(posaljiUpit, pocetno)
  const [tema, setTema] = useState<string>('podrska')

  useEffect(() => {
    if (stanje.status === 'uspjeh') zabiljezi('lead_submit', { vrsta: tema, izvor: '/kontakt' })
  }, [stanje.status, tema])

  if (stanje.status === 'uspjeh') {
    return (
      <div className="flex items-start gap-3 rounded-[16px] bg-success-50 p-8 text-success-700" role="status">
        <CheckCircle2 className="mt-1 size-7 shrink-0" aria-hidden />
        <div>
          <p className="text-[18px] font-bold">Vaša poruka je zaprimljena.</p>
          <p className="mt-1">Odgovaramo isti radni dan — telefonom ili e-mailom, kako Vam više odgovara.</p>
        </div>
      </div>
    )
  }

  return (
    <form action={akcija} className="space-y-5" data-forma>
      <Honeypot />
      <input type="hidden" name="izvorStranica" value="/kontakt" />

      <PoljeIzbor
        oznaka="Tema Vaše poruke"
        name="vrsta"
        value={tema}
        onChange={(e) => setTema(e.target.value)}
      >
        {TEME.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </PoljeIzbor>

      {(tema === 'poslovnica' || tema === 'kupovina') && (
        <PoljeIzbor
          oznaka="Poslovnica"
          name="poslovnica"
          greska={stanje.greske?.poslovnica}
          defaultValue=""
        >
          <option value="">— odaberite poslovnicu —</option>
          {poslovnice.map((p) => (
            <option key={p.id} value={p.id}>
              {p.grad}
            </option>
          ))}
        </PoljeIzbor>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
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
      </div>
      <PoljeUnos oznaka="E-mail (nije obavezno)" name="email" type="email" autoComplete="email" greska={stanje.greske?.email} />
      <PoljeTekst
        oznaka={tema === 'doktor' ? 'Vaše pitanje za doktora' : 'Vaša poruka'}
        name="poruka"
        required={tema === 'doktor'}
        greska={stanje.greske?.poruka}
        rows={5}
      />
      <AtribucijaPolja pitaj />
      <PoljeSaglasnost name="saglasnost" greska={stanje.greske?.saglasnost} />
      <Turnstile />

      {stanje.status === 'greska' && stanje.poruka && (
        <p role="alert" className="rounded-[12px] bg-error-50 px-4 py-3 text-[15px] font-medium text-error-600">
          {stanje.poruka}
        </p>
      )}

      <Dugme type="submit" velicina="veliko" ucitava={salje}>
        Pošaljite poruku
      </Dugme>
      <p className="text-small text-neutral-500">
        Odgovaramo isti radni dan. Hitno? Pozovite najbližu poslovnicu — brojevi su desno.
      </p>
    </form>
  )
}
