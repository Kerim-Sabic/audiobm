'use client'

import { useSearchParams } from 'next/navigation'
import { dajKategorijuObjave } from '@/lib/objave'
import { SavjetiKategorije, SavjetiMreza, type SavjetiKartica } from './SavjetiKartice'

export function SavjetiFilteri() {
  const searchParams = useSearchParams()
  const kategorija = dajKategorijuObjave(searchParams.get('kategorija'))

  return <SavjetiKategorije aktivna={kategorija} />
}

export function SavjetiInteraktivnaMreza({ objave }: { objave: SavjetiKartica[] }) {
  const searchParams = useSearchParams()
  const kategorija = dajKategorijuObjave(searchParams.get('kategorija'))
  const filtriraneObjave = kategorija ? objave.filter((objava) => objava.kategorija === kategorija) : objave

  return <SavjetiMreza objave={filtriraneObjave} />
}
