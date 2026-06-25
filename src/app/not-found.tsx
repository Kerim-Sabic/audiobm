import Link from 'next/link'
import { inter } from '@/fonts'
import './(frontend)/globals.css'

/**
 * Globalni 404 — prikazuje se za sve neuparene URL-ove (aplikacija ima više
 * root rasporeda zbog route grupa, pa ovaj fajl nosi vlastiti <html>/<body>).
 * Daje korisniku jasne korisne veze umjesto generičke greške.
 */
export default function GlobalnaNijePronadjena() {
  return (
    <html lang="bs" className={inter.variable}>
      <body className="bg-white">
        <main className="kontejner grid min-h-screen place-items-center py-16 text-center">
          <div className="max-w-lg">
            <p className="text-[72px] leading-none font-extrabold text-brand-600">404</p>
            <h1 className="text-h1 mt-3 text-neutral-900">Ova stranica ne postoji</h1>
            <p className="mt-4 text-[18px] leading-relaxed text-neutral-600">
              Možda je adresa pogrešno ukucana ili je stranica premještena — ali sve važno je na
              dohvat ruke.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3.5">
              <Link
                href="/"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-brand-600 px-7 text-[16px] font-semibold text-white transition-colors duration-150 hover:bg-brand-700"
              >
                Na početnu stranicu
              </Link>
              <Link
                href="/poslovnice"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-neutral-300 px-7 text-[16px] font-semibold text-neutral-800 transition-colors duration-150 hover:bg-neutral-50"
              >
                Naše poslovnice
              </Link>
              <Link
                href="/zakazivanje"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-neutral-300 px-7 text-[16px] font-semibold text-neutral-800 transition-colors duration-150 hover:bg-neutral-50"
              >
                Zakažite provjeru sluha
              </Link>
            </div>
            <p className="mt-8 text-[15px] text-neutral-500">
              Trebate pomoć?{' '}
              <Link href="/kontakt" className="font-semibold text-brand-700 underline underline-offset-2">
                Kontaktirajte nas
              </Link>
              .
            </p>
          </div>
        </main>
      </body>
    </html>
  )
}
