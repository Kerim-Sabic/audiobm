'use client'

import { useEffect, useState } from 'react'
import { dajAtribuciju, KAKO_CULI, type Atribucija } from '@/lib/atribucija'
import { PoljeIzbor } from './Polje'

/**
 * Skrivena polja atribucije (UTM/referrer/landing) + opciono vidljivo pitanje
 * „Kako ste čuli za nas?". Ubacuje se u svaki obrazac da bi svaki lead nosio
 * svoj izvor (osnova za 5% provizije).
 *
 * `pitaj` — prikaži vidljivi izbor (za veće obrasce); mikro-forme samo skrivena.
 */
export function AtribucijaPolja({ pitaj = false }: { pitaj?: boolean }) {
  const [a, setA] = useState<Atribucija>({})
  useEffect(() => setA(dajAtribuciju()), [])

  return (
    <>
      <input type="hidden" name="utmIzvor" value={a.izvor ?? ''} readOnly />
      <input type="hidden" name="utmMedij" value={a.medij ?? ''} readOnly />
      <input type="hidden" name="utmKampanja" value={a.kampanja ?? ''} readOnly />
      <input type="hidden" name="utmSadrzaj" value={a.sadrzaj ?? ''} readOnly />
      <input type="hidden" name="referer" value={a.referer ?? ''} readOnly />
      <input type="hidden" name="landingStranica" value={a.landing ?? ''} readOnly />
      {pitaj && (
        <PoljeIzbor oznaka="Kako ste čuli za nas? (nije obavezno)" name="izvorCuo" defaultValue="">
          <option value="">— odaberite —</option>
          {KAKO_CULI.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </PoljeIzbor>
      )}
    </>
  )
}
