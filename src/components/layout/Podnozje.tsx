import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { dajNavigaciju, dajPodesavanja, dajPoslovnice } from '@/lib/podaci'
import { stvarno } from '@/lib/tekst'
import { BREND } from '@/lib/brend'
import { Logotip } from '@/components/ui/Logotip'
import { TelefonLink } from '@/components/ui/TelefonLink'

// Lucide više ne sadrži brend-ikone — jednostavne inline SVG zamjene
const Facebook = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5Z" />
  </svg>
)
const Instagram = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)
const Youtube = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z" />
  </svg>
)

const REGIJA = [
  { naziv: 'Srbija', url: 'https://audiobm.rs' },
  { naziv: 'Slovenija', url: 'https://audiobm.si' },
  { naziv: 'Crna Gora', url: 'https://audiobm.me' },
  { naziv: 'Makedonija', url: 'https://audiobm.mk' },
]

/**
 * Podnožje: završni CTA pojas sa zvučnom krivuljom, zatim uredna
 * informacijska arhitektura — brend, poslovnice (svaka sa SVOJIM podacima),
 * navigacija i region. Placeholder podaci se nikad ne prikazuju.
 */
export async function Podnozje() {
  const [navigacija, podesavanja, poslovnice] = await Promise.all([
    dajNavigaciju(),
    dajPodesavanja(),
    dajPoslovnice(),
  ])
  const telefon = stvarno(podesavanja.telefonGlavni)

  return (
    <footer className="bg-charcoal text-neutral-300">
      {/* CTA pojas iznad podnožja */}
      <div className="relative overflow-hidden border-b border-white/10">
        <svg
          viewBox="0 0 1200 260"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0 200 C 220 180, 340 90, 500 100 S 780 200, 940 160 S 1140 60, 1200 50"
            fill="none"
            stroke="white"
            strokeOpacity="0.05"
            strokeWidth="70"
            strokeLinecap="round"
          />
          <path
            d="M0 215 C 230 195, 350 105, 510 115 S 790 215, 950 175 S 1150 75, 1200 65"
            fill="none"
            stroke="#ED1C24"
            strokeOpacity="0.3"
            strokeWidth="2"
          />
        </svg>
        <div className="absolute -top-28 right-[12%] size-72 rounded-full bg-brand-600/15 blur-[110px]" aria-hidden />
        <div className="kontejner relative flex flex-col items-start justify-between gap-8 py-14 md:flex-row md:items-center md:py-16">
          <div className="max-w-xl">
            <h2 className="text-h2 text-white">Spremni da ponovo čujete svijet oko sebe?</h2>
            <p className="mt-3 text-neutral-400">
              Prvi korak je najlakši — besplatna provjera sluha traje pola sata i ništa Vas ne
              obavezuje.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-4">
            <Link
              href="/zakazivanje"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 text-[17px] font-semibold text-white shadow-[var(--shadow-cta)] transition-[background-color,transform,box-shadow] duration-150 hover:-translate-y-px hover:bg-brand-700 hover:shadow-[var(--shadow-cta-hover)]"
            >
              Zakažite termin <ArrowRight className="size-5" aria-hidden />
            </Link>
            {telefon && (
              <TelefonLink
                broj={telefon}
                lokacija="podnozje-cta"
                className="inline-flex min-h-[52px] items-center rounded-full border border-white/20 px-7 text-[18px] text-white transition-colors duration-150 hover:bg-white/10"
              />
            )}
          </div>
        </div>
      </div>

      <div className="kontejner py-14 md:py-20">
        <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-[1.1fr_1.5fr_0.8fr]">
          <div>
            <Logotip varijanta="svijetlo" tagline />
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-neutral-400">
              Više od 30 godina brinemo o sluhu — slušni aparati, besplatne provjere sluha i stručno
              savjetovanje u šest gradova Bosne i Hercegovine.
            </p>
            {telefon && (
              <p className="mt-6">
                <span className="block text-[12px] font-bold tracking-[0.16em] text-neutral-500 uppercase">
                  Centralni telefon
                </span>
                <TelefonLink
                  broj={telefon}
                  lokacija="podnozje"
                  saIkonom={false}
                  className="mt-1 text-[22px] text-white hover:text-brand-300"
                />
              </p>
            )}
            <div className="mt-6 flex gap-3">
              {podesavanja.facebook && (
                <a
                  href={podesavanja.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${BREND.naziv} na Facebooku`}
                  className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 transition-colors duration-150 hover:bg-white/15"
                >
                  <Facebook className="size-5" aria-hidden />
                </a>
              )}
              {podesavanja.instagram && (
                <a
                  href={podesavanja.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${BREND.naziv} na Instagramu`}
                  className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 transition-colors duration-150 hover:bg-white/15"
                >
                  <Instagram className="size-5" aria-hidden />
                </a>
              )}
              {podesavanja.youtube && (
                <a
                  href={podesavanja.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${BREND.naziv} na YouTube-u`}
                  className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 transition-colors duration-150 hover:bg-white/15"
                >
                  <Youtube className="size-5" aria-hidden />
                </a>
              )}
            </div>
          </div>

          {/* Poslovnice — svaka sa SVOJIM telefonom; placeholder podaci se preskaču */}
          <nav aria-label="Poslovnice">
            <h2 className="text-[13px] font-bold tracking-[0.16em] text-neutral-500 uppercase">
              Naše poslovnice
            </h2>
            <ul className="mt-5 grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {poslovnice.map((p) => {
                const adresa = stvarno(p.adresa)
                const brojTel = stvarno(p.telefoni?.[0]?.broj)
                return (
                  <li key={p.id} className="text-[15px]">
                    <Link
                      href={`/poslovnice/${p.slug}`}
                      className="group inline-flex items-center gap-2 font-semibold text-white transition-colors duration-150 hover:text-brand-300"
                    >
                      <MapPin className="size-3.5 text-brand-500" aria-hidden />
                      {p.grad}
                      {p.novaPoslovnica && (
                        <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10.5px] font-bold tracking-wide text-white uppercase">
                          Novo
                        </span>
                      )}
                    </Link>
                    {adresa && <div className="mt-0.5 pl-[22px] text-neutral-400">{adresa}</div>}
                    {brojTel && (
                      <div className="pl-[22px]">
                        <TelefonLink
                          broj={brojTel}
                          lokacija={p.slug}
                          saIkonom={false}
                          className="!font-semibold text-[15px] text-neutral-300 hover:text-white"
                        />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="space-y-9">
            {(navigacija.podnozje ?? []).map((kolona) => (
              <nav key={kolona.id ?? kolona.naslov} aria-label={kolona.naslov}>
                <h2 className="text-[13px] font-bold tracking-[0.16em] text-neutral-500 uppercase">
                  {kolona.naslov}
                </h2>
                <ul className="mt-5 space-y-2.5">
                  {(kolona.linkovi ?? []).map((l) => (
                    <li key={l.id ?? l.putanja}>
                      <Link
                        href={l.putanja}
                        className="text-[15px] text-neutral-400 transition-colors duration-150 hover:text-white"
                      >
                        {l.oznaka}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <nav aria-label="Audio BM u regionu">
              <h2 className="text-[13px] font-bold tracking-[0.16em] text-neutral-500 uppercase">
                Audio BM u regionu
              </h2>
              <ul className="mt-5 space-y-2.5">
                {REGIJA.map((r) => (
                  <li key={r.url}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[15px] text-neutral-400 transition-colors duration-150 hover:text-white"
                    >
                      {r.naziv}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-7 text-[14px] text-neutral-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {BREND.naziv} · {BREND.potpis}. Sva prava zadržana.
          </p>
          <div className="flex gap-6">
            <Link href="/politika-privatnosti" className="transition-colors duration-150 hover:text-white">
              Politika privatnosti
            </Link>
            <Link href="/uslovi-koristenja" className="transition-colors duration-150 hover:text-white">
              Uslovi korištenja
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
