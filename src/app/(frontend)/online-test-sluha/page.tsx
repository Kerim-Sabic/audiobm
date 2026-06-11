import type { Metadata } from 'next'
import Image from 'next/image'
import { Clock, Headphones, ShieldCheck, Activity } from 'lucide-react'
import { dajPoslovnice } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
import { TestSluha } from '@/components/online-test/TestSluha'

export const metadata: Metadata = metaStranice({
  naslov: 'Online test sluha — besplatni screening za 5 minuta',
  opis: 'Provjerite sluh od kuće za 3–5 minuta: tonovi po frekvencijama za lijevo i desno uho + kratki upitnik. Informativni screening — ne zamjenjuje profesionalnu provjeru sluha.',
  putanja: '/online-test-sluha',
})

export default async function OnlineTestSluhaStranica() {
  const poslovnice = await dajPoslovnice()

  return (
    <>
      {/* zaglavlje sa kliničkom fotografijom */}
      <header className="relative overflow-hidden border-b border-neutral-200/70 bg-neutral-50">
        <div className="mreza-audiogram absolute inset-0" aria-hidden />
        <div
          className="absolute -top-48 right-[-8%] hidden size-[480px] rounded-full bg-brand-100/40 blur-[130px] lg:block"
          aria-hidden
        />
        <div className="kontejner relative py-10 md:py-16">
          <Mrvice stavke={[{ naziv: 'Online test sluha' }]} />
          <div className="mt-7 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="nadnaslov">Besplatni online screening</p>
              <h1 className="text-h1 mt-3.5">Online test sluha</h1>
              <p className="uvodni mt-5 max-w-xl">
                Za 3–5 minuta provjerite kako čujete tihe tonove na lijevom i desnom uhu — uz kratki
                upitnik o svakodnevnim situacijama. Odmah dobijate jasan, razumljiv rezultat.
              </p>
              <ul className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-[15px] font-semibold text-neutral-700">
                <li className="flex items-center gap-2">
                  <Clock className="size-4.5 text-brand-600" aria-hidden /> 3–5 minuta
                </li>
                <li className="flex items-center gap-2">
                  <Headphones className="size-4.5 text-brand-600" aria-hidden /> Potrebne slušalice
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="size-4.5 text-brand-600" aria-hidden /> Oba uha posebno
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="size-4.5 text-success-600" aria-hidden /> Ništa se ne snima
                </li>
              </ul>
              <p className="text-small mt-6 max-w-xl rounded-[14px] border border-neutral-200 bg-white/80 p-4 text-neutral-600">
                Ovo je <strong className="font-semibold text-neutral-800">informativni online screening</strong>{' '}
                i ne zamjenjuje profesionalnu provjeru sluha u poslovnici. Rezultat ne predstavlja
                medicinsku dijagnozu.
              </p>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative overflow-hidden rounded-[32px] shadow-[var(--shadow-lift-lg)] ring-1 ring-neutral-900/5">
                <Image
                  src="/media/site-refresh/online-hearing-test-page.png"
                  alt="Starija žena sa slušalicama radi online test sluha na laptopu kod kuće"
                  width={793}
                  height={496}
                  priority
                  sizes="(min-width: 1024px) 540px, 0px"
                  className="h-auto w-full object-cover"
                />
              </div>
              <div className="staklo absolute -bottom-5 left-6 flex items-center gap-3 rounded-full py-2.5 pr-5 pl-3.5">
                <span className="ekvilajzer flex h-5 items-end gap-[3px]" aria-hidden>
                  <span className="block h-2.5 w-[3px] rounded-full bg-brand-600" />
                  <span className="block h-4 w-[3px] rounded-full bg-brand-600" />
                  <span className="block h-5 w-[3px] rounded-full bg-brand-500" />
                  <span className="block h-3.5 w-[3px] rounded-full bg-brand-600" />
                  <span className="block h-2 w-[3px] rounded-full bg-brand-400" />
                </span>
                <span className="text-[14px] font-bold text-neutral-800">Rezultat odmah, bez čekanja</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* test */}
      <div className="kontejner py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="povrsina !rounded-[28px] p-6 !shadow-[var(--shadow-lift-lg)] md:p-10" data-forma>
            <TestSluha poslovnice={poslovnice.map((p) => ({ id: p.id as number, grad: p.grad }))} />
          </div>
          <p className="text-small mt-6 text-center text-neutral-500">
            Imate simptome poput iznenadnog gubitka sluha, bola ili iscjetka iz uha? Ne čekajte
            online test — odmah se javite ljekaru ili ORL specijalisti.
          </p>
        </div>
      </div>
    </>
  )
}
