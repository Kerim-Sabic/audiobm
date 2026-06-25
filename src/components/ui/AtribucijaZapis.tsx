'use client'

import { useEffect } from 'react'
import { zabiljeziAtribuciju } from '@/lib/atribucija'

/** Bilježi first-touch atribuciju na prvom učitavanju (montira se u rasporedu). */
export function AtribucijaZapis() {
  useEffect(() => {
    zabiljeziAtribuciju()
  }, [])
  return null
}
