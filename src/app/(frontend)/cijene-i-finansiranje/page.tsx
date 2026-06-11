import type { Metadata } from 'next'
import { BadgeCheck, FileText, Wallet } from 'lucide-react'
import { metaStranice } from '@/lib/seo'
import { ZaglavljeStranice } from '@/components/ui/ZaglavljeStranice'
import { DugmeLink } from '@/components/ui/Dugme'
import { Otkrij, OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'

export const metadata: Metadata = metaStranice({
  naslov: 'Cijene i finansiranje slušnih aparata',
  opis: 'Klase slušnih aparata, refundacija kroz zdravstveno osiguranje korak po korak, garancija i servis.',
  putanja: '/cijene-i-finansiranje',
})

const KLASE = [
  {
    naziv: 'Osnovna klasa',
    opis: 'Pouzdani aparati za mirniji svakodnevni život — razgovori u kući, televizor, telefon.',
  },
  {
    naziv: 'Srednja klasa',
    opis: 'Bolje razumijevanje u društvu i vani, automatsko prilagođavanje okolini, Bluetooth.',
  },
  {
    naziv: 'Premium klasa',
    opis: 'Najprirodniji zvuk i najbolje razumijevanje govora u buci, punjive baterije, sve mogućnosti povezivanja.',
  },
]

const REFUNDACIJA = [
  'Posjetite ljekara porodične medicine i zatražite uputnicu za ORL specijalistu.',
  'ORL specijalista utvrđuje oštećenje sluha i izdaje nalaz sa preporukom slušnog aparata.',
  'Sa nalazom i dokumentacijom podnosite zahtjev fondu zdravstvenog osiguranja.',
  'Nakon odobrenja, aparat preuzimate u našoj poslovnici — pomažemo Vam kroz svaki korak.',
]

export default function CijeneStranica() {
  return (
    <>
      <ZaglavljeStranice
        mrvice={[{ naziv: 'Cijene i finansiranje' }]}
        nadnaslov="Jasno i pošteno"
        naslov="Cijene i finansiranje"
        uvod="Šta utiče na cijenu, koje klase aparata postoje i kako do refundacije kroz zdravstveno osiguranje — bez sitnih slova."
      />

      <div className="kontejner pb-16 md:pb-24">
        {/* klase aparata */}
        <section className="sekcija !pb-0" aria-labelledby="klase-naslov">
          <Otkrij>
            <p className="nadnaslov">Tri nivoa tehnologije</p>
            <h2 id="klase-naslov" className="text-h2 mt-3.5">
              Klase slušnih aparata
            </h2>
            <p className="mt-3 max-w-2xl text-neutral-600">
              Tačna cijena zavisi od modela, tipa i Vašeg nalaza — konačnu ponudu dobijate na
              besplatnom savjetovanju, bez obaveze.
            </p>
          </Otkrij>
          <OtkrijGrupu className="mt-9 grid gap-5 md:grid-cols-3">
            {KLASE.map((k, i) => (
              <OtkrijStavku key={k.naziv} className="h-full">
                <div className="povrsina flex h-full flex-col p-7">
                  <span className="text-[13px] font-extrabold tracking-[0.2em] text-neutral-300" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-h3 mt-3">{k.naziv}</h3>
                  <p className="mt-2 flex-1 text-neutral-600">{k.opis}</p>
                  <p className="mt-5 border-t border-neutral-100 pt-4 text-[15px] font-semibold text-neutral-700">
                    Cijenu i ponudu dobijate na besplatnom savjetovanju
                  </p>
                </div>
              </OtkrijStavku>
            ))}
          </OtkrijGrupu>
        </section>

        {/* refundacija */}
        <section className="sekcija !pb-0" aria-labelledby="refundacija-naslov">
          <Otkrij>
            <p className="nadnaslov">Zdravstveno osiguranje</p>
            <h2 id="refundacija-naslov" className="text-h2 mt-3.5">
              Refundacija — korak po korak
            </h2>
            <p className="mt-3 max-w-2xl text-neutral-600">
              U određenim slučajevima fond zdravstvenog osiguranja pokriva dio ili cijelu cijenu
              aparata. Postupak se razlikuje po entitetima i kategorijama osiguranika — pozovite nas
              i provjerit ćemo šta vrijedi za Vas.
            </p>
          </Otkrij>
          <OtkrijGrupu className="mt-9 max-w-3xl">
            {REFUNDACIJA.map((korak, i) => (
              <OtkrijStavku key={i}>
                <div className="flex gap-5 border-b border-neutral-200/80 py-6 first:pt-0 last:border-b-0">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-brand-100 bg-brand-50 text-[17px] font-extrabold text-brand-700">
                    {i + 1}
                  </span>
                  <p className="self-center text-neutral-700">{korak}</p>
                </div>
              </OtkrijStavku>
            ))}
          </OtkrijGrupu>
        </section>

        {/* garancija i servis */}
        <section className="sekcija !pb-0" aria-labelledby="garancija-naslov">
          <Otkrij>
            <p className="nadnaslov">Nakon kupovine</p>
            <h2 id="garancija-naslov" className="text-h2 mt-3.5">
              Garancija i servis
            </h2>
          </Otkrij>
          <OtkrijGrupu className="mt-9 grid gap-5 md:grid-cols-3">
            {[
              {
                ikona: BadgeCheck,
                naslov: 'Garancija',
                opis: 'Svi aparati dolaze sa garancijom proizvođača — tačne uslove za odabrani model dobijate uz ponudu, jasno i napismeno.',
              },
              {
                ikona: Wallet,
                naslov: 'Plaćanje',
                opis: 'O dostupnim načinima plaćanja informišite se u najbližoj poslovnici — rado ćemo pronaći rješenje koje Vam odgovara.',
              },
              {
                ikona: FileText,
                naslov: 'Servis nakon kupovine',
                opis: 'Čišćenje, podešavanja i zamjena potrošnih dijelova u svim našim poslovnicama. Manje zahvate obavimo odmah, dok čekate.',
              },
            ].map((s) => (
              <OtkrijStavku key={s.naslov} className="h-full">
                <div className="povrsina h-full p-7">
                  <div className="grid size-13 place-items-center rounded-2xl bg-brand-50">
                    <s.ikona className="size-6.5 text-brand-600" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="text-h3 mt-5">{s.naslov}</h3>
                  <p className="mt-2 text-neutral-600">{s.opis}</p>
                </div>
              </OtkrijStavku>
            ))}
          </OtkrijGrupu>
        </section>

        <Otkrij className="relative mt-16 overflow-hidden rounded-[28px] border border-brand-200/60 bg-gradient-to-br from-white to-brand-50/50 p-8 text-center md:p-12">
          <h2 className="text-h2">Najtačniju cijenu saznajete za pola sata</h2>
          <p className="mx-auto mt-3 max-w-xl text-neutral-700">
            Dođite na besplatnu provjeru sluha — dobijate nalaz, preporuku i jasnu ponudu. Odluka je
            uvijek Vaša.
          </p>
          <DugmeLink href="/zakazivanje" velicina="veliko" className="mt-7">
            Zakažite besplatan termin
          </DugmeLink>
        </Otkrij>
      </div>
    </>
  )
}
