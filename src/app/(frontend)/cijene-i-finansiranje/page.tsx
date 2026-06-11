import type { Metadata } from 'next'
import { BadgeCheck, FileText, Wallet } from 'lucide-react'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'
import { DugmeLink } from '@/components/ui/Dugme'
import { Otkrij, OtkrijGrupu, OtkrijStavku } from '@/components/motion/Otkrij'

export const metadata: Metadata = metaStranice({
  naslov: 'Cijene i finansiranje slušnih aparata',
  opis: 'Okvirne cijene po klasama aparata, refundacija kroz zdravstveno osiguranje korak po korak, garancija i servis.',
  putanja: '/cijene-i-finansiranje',
})

const KLASE = [
  {
    naziv: 'Osnovna klasa',
    opis: 'Pouzdani aparati za mirniji svakodnevni život — razgovori u kući, televizor, telefon.',
    cijena: '[CIJENA_PLACEHOLDER]',
  },
  {
    naziv: 'Srednja klasa',
    opis: 'Bolje razumijevanje u društvu i vani, automatsko prilagođavanje okolini, Bluetooth.',
    cijena: '[CIJENA_PLACEHOLDER]',
  },
  {
    naziv: 'Premium klasa',
    opis: 'Najprirodniji zvuk i najbolje razumijevanje govora u buci, punjive baterije, sve mogućnosti povezivanja.',
    cijena: '[CIJENA_PLACEHOLDER]',
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
    <div className="kontejner py-10 md:py-14">
      <Mrvice stavke={[{ naziv: 'Cijene i finansiranje' }]} />
      <h1 className="text-h1 mt-6">Cijene i finansiranje</h1>
      <p className="mt-3 max-w-2xl text-[18px] text-neutral-600">
        Jasno i pošteno: šta utiče na cijenu, koliko okvirno koštaju aparati po klasama i kako do
        refundacije kroz zdravstveno osiguranje.
      </p>

      {/* klase aparata */}
      <section className="sekcija" aria-labelledby="klase-naslov">
        <Otkrij>
          <h2 id="klase-naslov" className="text-h2">
            Okvirne cijene po klasama
          </h2>
          <p className="mt-2 max-w-2xl text-neutral-600">
            Tačna cijena zavisi od modela, tipa i Vašeg nalaza — konačnu ponudu dobijate na
            besplatnom savjetovanju, bez obaveze.
          </p>
        </Otkrij>
        <OtkrijGrupu className="mt-8 grid gap-6 md:grid-cols-3">
          {KLASE.map((k) => (
            <OtkrijStavku key={k.naziv}>
              <div className="flex h-full flex-col rounded-[16px] border border-neutral-200 bg-white p-7 shadow-sm">
                <h3 className="text-h3">{k.naziv}</h3>
                <p className="mt-2 flex-1 text-neutral-600">{k.opis}</p>
                <p className="mt-5 text-[18px] font-bold text-warning-600">{k.cijena}</p>
                <p className="text-small text-neutral-500">raspon cijena potvrđuje vlasnik</p>
              </div>
            </OtkrijStavku>
          ))}
        </OtkrijGrupu>
      </section>

      {/* refundacija */}
      <section className="sekcija border-t border-neutral-100" aria-labelledby="refundacija-naslov">
        <Otkrij>
          <h2 id="refundacija-naslov" className="text-h2">
            Refundacija kroz zdravstveno osiguranje — korak po korak
          </h2>
          <p className="mt-2 max-w-2xl text-neutral-600">
            U određenim slučajevima fond zdravstvenog osiguranja pokriva dio ili cijelu cijenu
            aparata. Postupak se razlikuje po entitetima i kategorijama osiguranika.{' '}
            <strong className="text-warning-600">[OWNER_INPUT_PLACEHOLDER: tačni uslovi po entitetima/kantonima]</strong>
          </p>
        </Otkrij>
        <OtkrijGrupu className="mt-8 grid max-w-3xl gap-4">
          {REFUNDACIJA.map((korak, i) => (
            <OtkrijStavku key={i}>
              <div className="flex gap-5 rounded-[16px] border border-neutral-200 bg-white p-6 shadow-sm">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-600 text-[18px] font-bold text-white">
                  {i + 1}
                </span>
                <p className="self-center text-neutral-700">{korak}</p>
              </div>
            </OtkrijStavku>
          ))}
        </OtkrijGrupu>
      </section>

      {/* garancija i servis */}
      <section className="sekcija border-t border-neutral-100" aria-labelledby="garancija-naslov">
        <h2 id="garancija-naslov" className="text-h2">
          Garancija i servis
        </h2>
        <OtkrijGrupu className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              ikona: BadgeCheck,
              naslov: 'Garancija',
              opis: '[POTVRDA_VLASNIKA: trajanje garancije po brendovima i klasama]',
            },
            {
              ikona: Wallet,
              naslov: 'Plaćanje',
              opis: '[POTVRDA_VLASNIKA: načini plaćanja — gotovina, kartice, rate]',
            },
            {
              ikona: FileText,
              naslov: 'Servis nakon kupovine',
              opis: 'Čišćenje, podešavanja i zamjena potrošnih dijelova u svim našim poslovnicama. Manje zahvate obavimo odmah, dok čekate.',
            },
          ].map((s) => (
            <OtkrijStavku key={s.naslov}>
              <div className="h-full rounded-[16px] border border-neutral-200 bg-white p-7 shadow-sm">
                <div className="grid size-14 place-items-center rounded-[12px] bg-brand-50">
                  <s.ikona className="size-7 text-brand-600" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="text-h3 mt-5">{s.naslov}</h3>
                <p className={`mt-2 ${s.opis.startsWith('[') ? 'font-medium text-warning-600' : 'text-neutral-600'}`}>
                  {s.opis}
                </p>
              </div>
            </OtkrijStavku>
          ))}
        </OtkrijGrupu>
      </section>

      <div className="rounded-[16px] bg-brand-50/60 p-8 text-center md:p-12">
        <h2 className="text-h2">Najtačniju cijenu saznajete za pola sata</h2>
        <p className="mx-auto mt-3 max-w-xl text-neutral-700">
          Dođite na besplatnu provjeru sluha — dobijate nalaz, preporuku i jasnu ponudu. Odluka je
          uvijek Vaša.
        </p>
        <DugmeLink href="/zakazivanje" velicina="veliko" className="mt-6">
          Zakažite besplatan termin
        </DugmeLink>
      </div>
    </div>
  )
}
