import Image from 'next/image'
import Link from 'next/link'
import { dajNavigaciju, dajPodesavanja } from '@/lib/podaci'
import { TelefonLink } from '@/components/ui/TelefonLink'
import { DugmeLink } from '@/components/ui/Dugme'
import { MobilniMeni } from './MobilniMeni'

/** Zaglavlje: logo, do 7 stavki menija, veliki telefon + glavni CTA. */
export async function Zaglavlje() {
  const [navigacija, podesavanja] = await Promise.all([dajNavigaciju(), dajPodesavanja()])
  const stavke = navigacija.glavniMeni ?? []

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="kontejner flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Audio BM — početna stranica">
          {/* prostor oko logotipa ≥ visina slova A (pravilo čistog prostora) */}
          <Image
            src="/brand/logo-600.png"
            alt="Audio BM"
            width={150}
            height={31}
            priority
            className="h-7 w-auto md:h-8"
          />
        </Link>

        <nav aria-label="Glavna navigacija" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {stavke.map((s) => (
              <li key={s.id ?? s.putanja}>
                <Link
                  href={s.putanja}
                  className="rounded-md px-3 py-2 text-[16px] font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  {s.oznaka}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          {podesavanja.telefonGlavni && (
            <TelefonLink
              broj={podesavanja.telefonGlavni}
              lokacija="zaglavlje"
              className="hidden text-[18px] text-neutral-900 hover:text-brand-700 md:inline-flex"
            />
          )}
          <DugmeLink href="/zakazivanje" className="hidden sm:inline-flex">
            Zakažite termin
          </DugmeLink>
          <MobilniMeni
            stavke={stavke.map((s) => ({ oznaka: s.oznaka, putanja: s.putanja }))}
            telefon={podesavanja.telefonGlavni ?? undefined}
          />
        </div>
      </div>
    </header>
  )
}
