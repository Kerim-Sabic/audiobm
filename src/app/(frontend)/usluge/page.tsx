import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Ear, MessagesSquare, Settings2, ShieldCheck, Stethoscope } from 'lucide-react'
import { dajUsluge } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
import { OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'

export const metadata: Metadata = metaStranice({
  naslov: 'Usluge — provjera sluha, servis aparata, implanti',
  opis: 'Besplatna provjera sluha, prilagođavanje i servis slušnih aparata, podrška za kohlearne implante — u 6 gradova BiH.',
  putanja: '/usluge',
})

const IKONE: Record<string, typeof Ear> = {
  ear: Ear,
  settings: Settings2,
  stethoscope: Stethoscope,
  chat: MessagesSquare,
  shield: ShieldCheck,
}

export default async function UslugeStranica() {
  const usluge = await dajUsluge()

  return (
    <>
      <ZaglavljeStranice
        mrvice={[{ naziv: 'Usluge' }]}
        nadnaslov="Uz Vas u svakom koraku"
        naslov="Naše usluge"
        uvod="Od prve provjere sluha do dugogodišnjeg održavanja aparata — uz Vas smo u svakom koraku."
        slika={{
          src: '/media/site-refresh/services-page.png',
          alt: 'Profesionalna provjera sluha u audiometrijskoj kabini Audio BM poslovnice',
        }}
      />

      <div className="kontejner pb-16 md:pb-24">
        <OtkrijGrupu className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {usluge.map((u, i) => {
            const Ikona = IKONE[u.ikona ?? 'ear'] ?? Ear
            return (
              <OtkrijStavku key={u.id} className="h-full">
                <Link
                  href={`/usluge/${u.slug}`}
                  className="povrsina povrsina-hover group flex h-full flex-col p-7"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid size-13 place-items-center rounded-2xl bg-brand-50 transition-colors duration-250 group-hover:bg-brand-600">
                      <Ikona
                        className="size-6.5 text-brand-600 transition-colors duration-250 group-hover:text-white"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </div>
                    <span className="text-[13px] font-extrabold tracking-[0.2em] text-neutral-300" aria-hidden>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h2 className="text-h3 mt-5">{u.naziv}</h2>
                  <p className="mt-2 flex-1 text-neutral-600">{u.kratkiOpis}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-semibold text-brand-700">
                    Detalji usluge
                    <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </OtkrijStavku>
            )
          })}
        </OtkrijGrupu>
      </div>
    </>
  )
}
