import Link from 'next/link'
import { MapPin, ArrowRight, Phone } from 'lucide-react'
import { TelefonLink } from '@/components/ui/TelefonLink'

export type LokacijaPodaci = {
  slug: string
  grad: string
  adresa: string
  telefon?: string
  novaPoslovnica?: boolean | null
}

/** Kartica poslovnice: cijela klikabilna, podizanje na prelaz, NOVO oznaka. */
export function LokacijaKartica({ lokacija }: { lokacija: LokacijaPodaci }) {
  const placeholderAdresa = lokacija.adresa.startsWith('[')
  const placeholderTelefon = !lokacija.telefon || lokacija.telefon.startsWith('[')

  return (
    <div className="group relative flex h-full flex-col rounded-[16px] border border-neutral-200 bg-white p-6 shadow-[var(--shadow-lift)] transition-[box-shadow,transform,border-color] duration-250 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift-lg)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 transition-colors duration-250 group-hover:bg-brand-600">
            <MapPin className="size-6 text-brand-600 transition-colors duration-250 group-hover:text-white" aria-hidden />
          </span>
          <h3 className="text-h3">
            <Link
              href={`/poslovnice/${lokacija.slug}`}
              className="after:absolute after:inset-0 after:rounded-[16px] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--color-focus)]"
            >
              {lokacija.grad}
            </Link>
          </h3>
        </div>
        {lokacija.novaPoslovnica && (
          <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 px-3 py-1 text-[12px] font-bold tracking-wide text-white uppercase shadow-[0_4px_12px_-2px_rgb(237_28_36/0.5)]">
            <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden />
            Novo
          </span>
        )}
      </div>

      <p className="mt-4 text-[16px] text-neutral-600">
        {placeholderAdresa ? (
          <span className="font-medium text-warning-600">[ADRESA_PLACEHOLDER]</span>
        ) : (
          lokacija.adresa
        )}
      </p>

      {placeholderTelefon ? (
        <p className="mt-1.5 text-[15px] font-medium text-warning-600">[TELEFON_PLACEHOLDER]</p>
      ) : (
        <span className="relative z-10 mt-1.5 inline-flex w-fit items-center gap-2">
          <Phone className="size-4 text-brand-600" aria-hidden />
          <TelefonLink
            broj={lokacija.telefon!}
            lokacija={lokacija.slug}
            saIkonom={false}
            className="text-[19px] text-neutral-900 hover:text-brand-700"
          />
        </span>
      )}

      <span className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4 text-[15px] font-semibold text-brand-700">
        Detalji i zakazivanje
        <span className="grid size-8 place-items-center rounded-full bg-brand-50 transition-all duration-250 group-hover:bg-brand-600 group-hover:text-white">
          <ArrowRight className="size-4" aria-hidden />
        </span>
      </span>
    </div>
  )
}
