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
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/92 shadow-[0_1px_12px_rgb(28_25_23/0.04)] backdrop-blur-md">
      <div className="kontejner flex h-[68px] items-center justify-between gap-4 md:h-20">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Audio BM — početna stranica">
          {/* prostor oko logotipa ≥ visina slova A (pravilo čistog prostora) */}
          <Image
            src="/brand/logo-600.png"
            alt="Audio BM"
            width={168}
            height={35}
            priority
            className="h-8 w-auto md:h-9"
          />
        </Link>

        <nav aria-label="Glavna navigacija" className="hidden xl:block">
          <ul className="flex items-center gap-0.5">
            {stavke.map((s) => (
              <li key={s.id ?? s.putanja}>
                <Link
                  href={s.putanja}
                  className="relative rounded-md px-3.5 py-2.5 text-[15.5px] font-semibold text-neutral-700 transition-colors duration-150 after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand-600 after:transition-transform after:duration-250 hover:text-neutral-950 hover:after:scale-x-100"
                >
                  {s.oznaka}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3 md:gap-6">
          {podesavanja.telefonGlavni && (
            <span className="hidden flex-col items-end leading-tight md:flex">
              <span className="text-[12px] font-semibold tracking-wide text-neutral-500 uppercase">
                Pozovite nas
              </span>
              <TelefonLink
                broj={podesavanja.telefonGlavni}
                lokacija="zaglavlje"
                saIkonom={false}
                className="text-[19px] text-neutral-900 hover:text-brand-700"
              />
            </span>
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
