import Image from 'next/image'
import Link from 'next/link'
import { dajNavigaciju, dajPodesavanja, dajPoslovnice } from '@/lib/podaci'
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

/** Podnožje: duboki topli ugljen, bijela varijanta logotipa, ispravni podaci po poslovnici. */
export async function Podnozje() {
  const [navigacija, podesavanja, poslovnice] = await Promise.all([
    dajNavigaciju(),
    dajPodesavanja(),
    dajPoslovnice(),
  ])

  return (
    <footer className="bg-charcoal text-neutral-300">
      <div className="kontejner py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image
              src="/brand/logo-bijeli.png"
              alt="Audio BM"
              width={160}
              height={33}
              className="h-8 w-auto"
            />
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-neutral-400">
              Više od 30 godina brinemo o sluhu — slušni aparati, besplatne provjere sluha i stručno
              savjetovanje u šest gradova Bosne i Hercegovine.
            </p>
            <div className="mt-5 flex gap-3">
              {podesavanja.facebook && (
                <a
                  href={podesavanja.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Audio BM na Facebooku"
                  className="grid size-11 place-items-center rounded-full bg-white/10 transition-colors duration-150 hover:bg-white/20"
                >
                  <Facebook className="size-5" aria-hidden />
                </a>
              )}
              {podesavanja.instagram && (
                <a
                  href={podesavanja.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Audio BM na Instagramu"
                  className="grid size-11 place-items-center rounded-full bg-white/10 transition-colors duration-150 hover:bg-white/20"
                >
                  <Instagram className="size-5" aria-hidden />
                </a>
              )}
              {podesavanja.youtube && (
                <a
                  href={podesavanja.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Audio BM na YouTube-u"
                  className="grid size-11 place-items-center rounded-full bg-white/10 transition-colors duration-150 hover:bg-white/20"
                >
                  <Youtube className="size-5" aria-hidden />
                </a>
              )}
            </div>
          </div>

          {/* Poslovnice — svaka sa SVOJIM telefonom (stara stranica je miješala podatke) */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-[16px] font-semibold text-white">Naše poslovnice</h2>
            <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {poslovnice.map((p) => (
                <li key={p.id} className="text-[15px]">
                  <Link
                    href={`/poslovnice/${p.slug}`}
                    className="font-semibold text-white transition-colors duration-150 hover:text-brand-300"
                  >
                    {p.grad}
                    {p.novaPoslovnica && (
                      <span className="ml-2 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold tracking-wide text-white uppercase">
                        Novo
                      </span>
                    )}
                  </Link>
                  <div className="text-neutral-400">{p.adresa}</div>
                  {p.telefoni?.[0] && (
                    <TelefonLink
                      broj={p.telefoni[0].broj}
                      lokacija={p.slug}
                      saIkonom={false}
                      className="text-[15px] text-neutral-300 hover:text-white"
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            {(navigacija.podnozje ?? []).map((kolona) => (
              <div key={kolona.id ?? kolona.naslov}>
                <h2 className="mb-4 text-[16px] font-semibold text-white">{kolona.naslov}</h2>
                <ul className="space-y-2.5">
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
              </div>
            ))}
            <div>
              <h2 className="mb-4 text-[16px] font-semibold text-white">Audio BM u regionu</h2>
              <ul className="space-y-2.5">
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
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-[14px] text-neutral-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Audio BM. Sva prava zadržana.</p>
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
