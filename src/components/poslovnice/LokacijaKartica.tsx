import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import { TelefonLink } from '@/components/ui/TelefonLink'

export type LokacijaPodaci = {
  slug: string
  grad: string
  adresa: string
  telefon?: string
  novaPoslovnica?: boolean | null
}

/** Kartica poslovnice: cijela klikabilna, podizanje 4px na prelaz, NOVO oznaka. */
export function LokacijaKartica({ lokacija }: { lokacija: LokacijaPodaci }) {
  const placeholderAdresa = lokacija.adresa.startsWith('[')
  const placeholderTelefon = !lokacija.telefon || lokacija.telefon.startsWith('[')

  return (
    <div className="group relative rounded-[16px] border border-neutral-200 bg-white p-6 shadow-sm transition-[box-shadow,transform] duration-250 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-h3">
          <Link
            href={`/poslovnice/${lokacija.slug}`}
            className="after:absolute after:inset-0 after:rounded-[16px] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--color-focus)]"
          >
            {lokacija.grad}
          </Link>
        </h3>
        {lokacija.novaPoslovnica && (
          <span className="rounded-full bg-brand-600 px-2.5 py-1 text-[12px] font-bold tracking-wide text-white uppercase">
            Novo
          </span>
        )}
      </div>
      <p className="mt-2 flex items-start gap-2 text-[16px] text-neutral-600">
        <MapPin className="mt-1 size-4 shrink-0 text-brand-600" aria-hidden />
        {placeholderAdresa ? <span className="font-medium text-warning-600">[ADRESA_PLACEHOLDER]</span> : lokacija.adresa}
      </p>
      {placeholderTelefon ? (
        <p className="mt-3 text-[15px] font-medium text-warning-600">[TELEFON_PLACEHOLDER]</p>
      ) : (
        <TelefonLink
          broj={lokacija.telefon!}
          lokacija={lokacija.slug}
          className="relative z-10 mt-3 text-[19px] text-neutral-900 hover:text-brand-700"
        />
      )}
      <span className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-semibold text-brand-700">
        Detalji i zakazivanje
        <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
      </span>
    </div>
  )
}
