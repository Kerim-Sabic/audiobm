import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { dajPayload } from '@/lib/podaci'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
import { DugmeLink } from '@/components/ui/Dugme'
import { OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'
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
    opis: `${info.kratko} Pogledajte modele i zakažite besplatno savjetovanje u Audio BM poslovnicama.`,
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
    <div className="kontejner py-10 md:py-14">
      <Mrvice
        stavke={[{ naziv: 'Slušni aparati', putanja: '/slusni-aparati' }, { naziv: info.naziv }]}
      />
      <div className="mt-6 max-w-3xl">
        <h1 className="text-h1">{info.naziv}</h1>
        <p className="mt-1 text-[18px] font-medium text-brand-700">{info.kratko}</p>
        <p className="mt-4 text-[18px] text-neutral-600">{detalji.opis}</p>
        <h2 className="text-h3 mt-8">Pogodni su za:</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-6 text-neutral-700">
          {detalji.pogodniZa.map((z) => (
            <li key={z}>{z}</li>
          ))}
        </ul>
        <DugmeLink href="/zakazivanje" velicina="veliko" className="mt-8">
          Zakažite besplatno savjetovanje
        </DugmeLink>
      </div>

      {aparati.length > 0 && (
        <section className="sekcija" aria-label="Modeli">
          <h2 className="text-h2">Modeli iz ove grupe</h2>
          <OtkrijGrupu className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {aparati.map((p) => (
              <OtkrijStavku key={p.id}>
                <ProizvodKartica proizvod={p} />
              </OtkrijStavku>
            ))}
          </OtkrijGrupu>
        </section>
      )}
    </div>
  )
}
