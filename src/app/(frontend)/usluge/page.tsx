import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Ear, MessagesSquare, Settings2, ShieldCheck, Stethoscope } from 'lucide-react'
import { dajUsluge } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
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
    <div className="kontejner py-10 md:py-14">
      <Mrvice stavke={[{ naziv: 'Usluge' }]} />
      <h1 className="text-h1 mt-6">Naše usluge</h1>
      <p className="mt-3 max-w-2xl text-[18px] text-neutral-600">
        Od prve provjere sluha do dugogodišnjeg održavanja aparata — uz Vas smo u svakom koraku.
      </p>

      <OtkrijGrupu className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {usluge.map((u) => {
          const Ikona = IKONE[u.ikona ?? 'ear'] ?? Ear
          return (
            <OtkrijStavku key={u.id}>
              <Link
                href={`/usluge/${u.slug}`}
                className="group flex h-full flex-col rounded-[16px] border border-neutral-200 bg-white p-7 shadow-sm transition-[box-shadow,transform] duration-250 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="grid size-14 place-items-center rounded-[12px] bg-brand-50">
                  <Ikona className="size-7 text-brand-600" strokeWidth={1.75} aria-hidden />
                </div>
                <h2 className="text-h3 mt-5">{u.naziv}</h2>
                <p className="mt-2 text-neutral-600">{u.kratkiOpis}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-semibold text-brand-700">
                  Detalji usluge
                  <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </OtkrijStavku>
          )
        })}
      </OtkrijGrupu>
    </div>
  )
}
