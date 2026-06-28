import type { Metadata } from 'next'
import { Suspense } from 'react'
import { dajPayload } from '@/lib/podaci'
import { dajKategorijuObjave, objavaJeUklonjena } from '@/lib/objave'
import { metaStranice } from '@/lib/seo'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
import type { Mediji } from '@/payload-types'
import { SavjetiFilteri, SavjetiInteraktivnaMreza } from './SavjetiInteraktivno'
import { SavjetiKategorije, SavjetiMreza, type SavjetiKartica } from './SavjetiKartice'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return metaStranice({
    naslov: 'Savjeti i novosti o sluhu',
    opis: 'Praktični savjeti o sluhu i slušnim aparatima, novosti iz naših poslovnica i vijesti iz Sarajeva.',
    putanja: '/savjeti',
  })
}

function uKarticu(objava: {
  id: number
  slug: string
  naslov: string
  izvod: string
  kategorija?: string | null
  datumObjave?: string | null
  naslovnaSlika?: number | Mediji | null
}): SavjetiKartica {
  return {
    id: objava.id,
    slug: objava.slug,
    naslov: objava.naslov,
    izvod: objava.izvod,
    kategorija: dajKategorijuObjave(objava.kategorija) ?? 'savjeti',
    datumObjave: objava.datumObjave ?? null,
    naslovnaSlika:
      objava.naslovnaSlika && typeof objava.naslovnaSlika === 'object' ? objava.naslovnaSlika : null,
  }
}

export default async function SavjetiStranica() {
  const payload = await dajPayload()
  const { docs: objave } = await payload.find({
    collection: 'objave',
    sort: '-datumObjave',
    limit: 30,
    depth: 1,
    draft: false,
  })
  const vidljiveObjave = objave.filter((objava) => !objavaJeUklonjena(objava.slug)).map(uKarticu)

  return (
    <>
      <ZaglavljeStranice
        mrvice={[{ naziv: 'Savjeti' }]}
        nadnaslov="Razumljivo o sluhu"
        naslov="Savjeti i novosti"
        uvod="Razumljivi tekstovi o sluhu, aparatima i svemu što Vas zanima - bez komplikovanih izraza."
        slika={{
          src: '/media/site-refresh/blog-advice-page.png',
          alt: 'Stariji par u opuštenom razgovoru kod kuće - život sa zdravim sluhom',
        }}
      >
        <Suspense fallback={<SavjetiKategorije />}>
          <SavjetiFilteri />
        </Suspense>
      </ZaglavljeStranice>

      <div className="kontejner pb-16 md:pb-24">
        <Suspense fallback={<SavjetiMreza objave={vidljiveObjave} />}>
          <SavjetiInteraktivnaMreza objave={vidljiveObjave} />
        </Suspense>
      </div>
    </>
  )
}
