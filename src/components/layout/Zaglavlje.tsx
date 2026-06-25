import Link from 'next/link'
import { Headphones, MapPin, Phone } from 'lucide-react'
import { dajNavigaciju, dajPodesavanja, dajPoslovnice } from '@/lib/podaci'
import { stvarno } from '@/lib/tekst'
import { BREND } from '@/lib/brend'
import { Logotip } from '@/components/ui/Logotip'
import { TelefonLink } from '@/components/ui/TelefonLink'
import { telHref } from '@/lib/telefon'
import { DugmeLink } from '@/components/ui/Dugme'
import { MobilniMeni } from './MobilniMeni'
import { NavLinkovi } from './NavLinkovi'

/**
 * Zaglavlje u dva pojasa:
 *  - servisni pojas (samo desktop): poslovnice + telefon — skliže pri skrolu (sticky -top trik)
 *  - glavni pojas: logo, navigacija, CTA — uvijek vidljiv, nikad se ne lomi
 * Mobilno: logo + okrugla tipka za poziv + meni. CTA živi u meniju i ljepljivoj traci.
 */
export async function Zaglavlje() {
  const [navigacija, podesavanja, poslovnice] = await Promise.all([
    dajNavigaciju(),
    dajPodesavanja(),
    dajPoslovnice(),
  ])
  const stavke = (navigacija.glavniMeni ?? []).map((s) => ({ oznaka: s.oznaka, putanja: s.putanja }))
  // online test je proizvodna funkcija stranice (fiksna ruta) — u mobilnom meniju
  // stoji uz CMS stavke, na desktopu u servisnom pojasu
  const stavkeMobilne = [...stavke, { oznaka: 'Online test sluha', putanja: '/online-test-sluha' }]
  const telefon = stvarno(podesavanja.telefonGlavni)

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/92 shadow-[0_1px_16px_rgb(28_25_23/0.05)] backdrop-blur-xl lg:-top-10">
      {/* servisni pojas — skliže nakon 40px skrola */}
      <div className="hidden border-b border-neutral-100 bg-neutral-50/85 lg:block">
        <div className="kontejner flex h-10 items-center justify-between text-[13.5px] font-medium text-neutral-600">
          <div className="flex items-center gap-6">
            <Link
              href="/poslovnice"
              className="inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-neutral-900"
            >
              <MapPin className="size-3.5 text-brand-600" aria-hidden />
              {poslovnice.length} poslovnica širom Bosne i Hercegovine
            </Link>
            <Link
              href="/online-test-sluha"
              className="inline-flex items-center gap-1.5 font-semibold text-brand-700 transition-colors duration-150 hover:text-brand-800"
            >
              <Headphones className="size-3.5" aria-hidden />
              Online test sluha — besplatno, za 5 minuta
            </Link>
          </div>
          {telefon && (
            <span className="inline-flex items-baseline gap-2.5">
              <span className="text-[12px] font-semibold tracking-[0.08em] text-neutral-500 uppercase">
                Pozovite nas
              </span>
              <TelefonLink
                broj={telefon}
                lokacija="zaglavlje"
                saIkonom={false}
                className="!text-[15px] text-neutral-900 hover:text-brand-700"
              />
            </span>
          )}
        </div>
      </div>

      {/* glavni pojas */}
      <div className="kontejner flex h-16 items-center justify-between gap-4 md:h-[72px] lg:gap-8">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label={`${BREND.naziv} ${BREND.potpis} — početna stranica`}
        >
          <Logotip />
        </Link>

        <nav aria-label="Glavna navigacija" className="hidden min-w-0 lg:block">
          <NavLinkovi stavke={stavke} />
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          {/* omotač rješava sukob display utiliti klasa (hidden vs inline-flex) */}
          <div className="hidden lg:block">
            <DugmeLink href="/zakazivanje" velicina="malo" className="!px-5 xl:min-h-11">
              Zakažite termin
            </DugmeLink>
          </div>

          {/* mobilno: poziv jednim dodirom */}
          {telefon && (
            <a
              href={telHref(telefon)}
              aria-label={`Pozovite nas: ${telefon}`}
              className="grid size-11 place-items-center rounded-full border border-neutral-200 bg-neutral-50 text-brand-700 transition-colors duration-150 hover:bg-brand-50 lg:hidden"
            >
              <Phone className="size-5" aria-hidden />
            </a>
          )}
          <MobilniMeni stavke={stavkeMobilne} telefon={telefon ?? undefined} />
        </div>
      </div>
    </header>
  )
}
