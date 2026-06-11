import Link from 'next/link'
import { MapPin, ArrowRight, Phone } from 'lucide-react'
import { TelefonLink } from '@/components/ui/TelefonLink'
import { stvarno } from '@/lib/tekst'

export type LokacijaPodaci = {
  slug: string
  grad: string
  adresa: string
  telefon?: string
  novaPoslovnica?: boolean | null
}

/** Kartica poslovnice: cijela klikabilna, podizanje na prelaz, NOVO oznaka.
 *  Placeholder adresa/telefon se ne prikazuju — umjesto njih poziv na detalje. */
export function LokacijaKartica({ lokacija }: { lokacija: LokacijaPodaci }) {
  const adresa = stvarno(lokacija.adresa)
  const telefon = stvarno(lokacija.telefon)

  return (
    <div className="povrsina povrsina-hover group relative flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 transition-colors duration-250 group-hover:bg-brand-600">
            <MapPin className="size-6 text-brand-600 transition-colors duration-250 group-hover:text-white" aria-hidden />
          </span>
          <h3 className="text-h3">
            <Link
              href={`/poslovnice/${lokacija.slug}`}
              className="after:absolute after:inset-0 after:rounded-[20px] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--color-focus)]"
            >
              {lokacija.grad}
            </Link>
          </h3>
        </div>
        {lokacija.novaPoslovnica && (
          <span className="flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-[11.5px] font-bold tracking-wide text-white uppercase shadow-[0_4px_12px_-2px_rgb(237_28_36/0.4)]">
            <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden />
            Novo
          </span>
        )}
      </div>

      <div className="mt-4 flex-1">
        {adresa ? (
          <p className="text-[16px] text-neutral-600">{adresa}</p>
        ) : (
          <p className="text-[16px] text-neutral-500">Uskoro objavljujemo adresu i radno vrijeme.</p>
        )}
        {telefon && (
          <span className="relative z-10 mt-1.5 inline-flex w-fit items-center gap-2">
            <Phone className="size-4 text-brand-600" aria-hidden />
            <TelefonLink
              broj={telefon}
              lokacija={lokacija.slug}
              saIkonom={false}
              className="text-[18px] text-neutral-900 hover:text-brand-700"
            />
          </span>
        )}
      </div>

      <span className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4 text-[15px] font-semibold text-brand-700">
        Detalji i zakazivanje
        <span className="grid size-8 place-items-center rounded-full bg-brand-50 transition-all duration-250 group-hover:bg-brand-600 group-hover:text-white">
          <ArrowRight className="size-4" aria-hidden />
        </span>
      </span>
    </div>
  )
}
