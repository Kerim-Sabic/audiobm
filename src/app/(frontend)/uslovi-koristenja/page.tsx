import type { Metadata } from 'next'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'

export const metadata: Metadata = metaStranice({
  naslov: 'Uslovi korištenja',
  opis: 'Uslovi korištenja web stranice Audio BM.',
  putanja: '/uslovi-koristenja',
})

export default function UsloviKoristenja() {
  return (
    <div className="kontejner py-10 md:py-14">
      <Mrvice stavke={[{ naziv: 'Uslovi korištenja' }]} />
      <div className="prose-bm mx-auto mt-8 max-w-3xl text-neutral-800">
        <h1 className="text-h1 mb-2">Uslovi korištenja</h1>
        <p className="text-small text-warning-600">
          [LEGAL_REVIEW_PLACEHOLDER: nacrt — prije objave obavezno pregledati sa pravnikom]
        </p>

        <h2>Opšte odredbe</h2>
        <p>
          Korištenjem web stranice audiobm.ba prihvatate ove uslove. Stranicom upravlja Audio BM.
          [LEGAL_REVIEW_PLACEHOLDER: puni naziv pravnog lica, sjedište, matični/PDV broj]
        </p>

        <h2>Informativni karakter sadržaja</h2>
        <p>
          Sadržaj stranice je informativnog karaktera i ne zamjenjuje pregled kod ljekara niti
          stručno mišljenje. Za zdravstvene tegobe uvijek se obratite ljekaru.
        </p>

        <h2>Cijene i ponuda</h2>
        <p>
          Cijene navedene na stranici su informativne i podložne promjeni. Konačna ponuda formira
          se u poslovnici. Stranica ne omogućava online plaćanje — narudžbe se dogovaraju upitom
          ili telefonom.
        </p>

        <h2>Intelektualno vlasništvo</h2>
        <p>
          Logotip, tekstovi i fotografije na ovoj stranici vlasništvo su Audio BM-a ili partnera i
          ne smiju se koristiti bez dozvole.
        </p>

        <h2>Odgovornost</h2>
        <p>
          Trudimo se da svi podaci budu tačni i ažurni, ali ne odgovaramo za štetu nastalu
          korištenjem stranice ili privremenu nedostupnost stranice.
        </p>

        <p className="text-small text-neutral-500">Posljednja izmjena: jun 2026.</p>
      </div>
    </div>
  )
}
