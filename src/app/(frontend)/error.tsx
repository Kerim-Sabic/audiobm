'use client'

import { Phone, RotateCcw } from 'lucide-react'
import Link from 'next/link'

/** 500 — tehnička greška: korisnik uvijek može pozvati telefonom. */
export default function Greska({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="kontejner grid min-h-[60vh] place-items-center py-16 text-center">
      <div className="max-w-lg">
        <p className="text-display text-brand-600">Ups!</p>
        <h1 className="text-h1 mt-2">Došlo je do tehničke greške</h1>
        <p className="mt-4 text-[18px] text-neutral-600">
          Izvinjavamo se na neugodnosti. Pokušajte ponovo — a ako se greška ponavlja, slobodno nas
          pozovite, rado ćemo pomoći.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-brand-600 px-7 py-3.5 text-[17px] font-semibold text-white transition-colors duration-150 hover:bg-brand-700"
          >
            <RotateCcw className="size-5" aria-hidden />
            Pokušajte ponovo
          </button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-[12px] border border-neutral-300 bg-white px-7 py-3.5 text-[17px] font-semibold text-neutral-900 transition-colors duration-150 hover:bg-neutral-50"
          >
            Na početnu stranicu
          </Link>
        </div>
        <p className="mt-8 flex items-center justify-center gap-2 text-neutral-600">
          <Phone className="size-5 text-brand-600" aria-hidden />
          <a href="tel:+38751218781" className="telefon text-[22px] text-neutral-900 hover:text-brand-700">
            051 218 781
          </a>
        </p>
      </div>
    </div>
  )
}
