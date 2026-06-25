import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Check } from 'lucide-react'
import { dajPayload } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
import { DugmeLink } from '@/components/ui/Dugme'
import { SekcijaZaglavlje } from '@/components/ui/SekcijaZaglavlje'
import { Otkrij, OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
import { ProizvodKartica } from '@/components/proizvodi/ProizvodKartica'
import { TIPOVI_APARATA } from '@/lib/catalog'

const DETALJI: Record<string, { opis: string; pogodniZa: string[] }> = {
  kanalni: {
    opis: 'Kanalni slušni aparati („bubice") izrađuju se po mjeri Vašeg uha — sva elektronika smještena je u ušni umetak, pa su gotovo neprimjetni. Idealni su ako nosite naočale ili jednostavno želite diskretno rješenje.',
    pogodniZa: [
      'slabiji, srednji i srednje-teški gubitak sluha',
      'osobe koje nose naočale',
      'one koji žele najdiskretniji mogući izgled',
    ],
  },
  zausni: {
    opis: 'Zaušni aparati sa tankom žicom (RITE) najprodavanija su vrsta na svijetu: elegantno kućište skriveno iza uha i nevidljiva žica do zvučnika u ušnom kanalu. Nude najbolji odnos snage, kvaliteta zvuka i udobnosti.',
    pogodniZa: [
      'sve stepene oštećenja sluha',
      'povezivanje sa mobitelom i televizorom (Bluetooth)',
      'korisnike koji žele punjive baterije',
    ],
  },
  'zausni-snazni': {
    opis: 'Snažni zaušni aparati (Power/Super Power) pružaju glasniji zvuk i bolje razumijevanje govora kod teških i izrazito teških oštećenja sluha — uz jednostavno rukovanje i pouzdan rad.',
    pogodniZa: [
      'teška i izrazito teška oštećenja sluha',
      'korisnike kojima je važna jednostavnost',
      'povezivanje sa mobitelom i TV-om',
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(TIPOVI_APARATA).map((tip) => ({ tip }))
}

export async function generateMetadata({ params }: { params: Promise<{ tip: string }> }): Promise<Metadata> {
  const { tip } = await params
  const info = TIPOVI_APARATA[tip as keyof typeof TIPOVI_APARATA]
  if (!info) return {}
  return metaStranice({
    naslov: `${info.naziv} — modeli i savjetovanje`,
    opis: `${info.kratko} Pogledajte modele i zakažite besplatno savjetovanje u našim poslovnicama.`,
    putanja: `/slusni-aparati/${tip}`,
  })
}

export default async function TipAparataStranica({ params }: { params: Promise<{ tip: string }> }) {
  const { tip } = await params
  const info = TIPOVI_APARATA[tip as keyof typeof TIPOVI_APARATA]
  const detalji = DETALJI[tip]
  if (!info || !detalji) notFound()

  const payload = await dajPayload()
  const { docs: aparati } = await payload.find({
    collection: 'proizvodi',
    where: { and: [{ tipAparata: { equals: tip } }, { aktivan: { equals: true } }] },
    sort: 'naziv',
    limit: 30,
    depth: 1,
    draft: false,
  })

  return (
    <>
      <ZaglavljeStranice
        mrvice={[{ naziv: 'Slušni aparati', putanja: '/slusni-aparati' }, { naziv: info.naziv }]}
        nadnaslov={info.kratko}
        naslov={info.naziv}
        uvod={detalji.opis}
      />

      <div className="kontejner">
        <Otkrij className="mt-12 md:mt-16">
          <div className="povrsina max-w-3xl !rounded-[24px] p-7 md:p-9">
            <h2 className="text-h3">Pogodni su za:</h2>
            <ul className="mt-4 space-y-3">
              {detalji.pogodniZa.map((z) => (
                <li key={z} className="flex items-start gap-3 text-neutral-700">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-success-50">
                    <Check className="size-3.5 text-success-600" strokeWidth={2.5} aria-hidden />
                  </span>
                  {z}
                </li>
              ))}
            </ul>
            <DugmeLink href="/zakazivanje" velicina="veliko" className="mt-7">
              Zakažite besplatno savjetovanje
            </DugmeLink>
          </div>
        </Otkrij>

        {aparati.length > 0 && (
          <section className="sekcija" aria-labelledby="modeli-naslov">
            <SekcijaZaglavlje id="modeli-naslov" nadnaslov="Katalog" naslov="Modeli iz ove grupe" centrirano={false} />
            <OtkrijGrupu className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {aparati.map((p) => (
                <OtkrijStavku key={p.id} className="h-full">
                  <ProizvodKartica proizvod={p} />
                </OtkrijStavku>
              ))}
            </OtkrijGrupu>
          </section>
        )}
      </div>
    </>
  )
}
