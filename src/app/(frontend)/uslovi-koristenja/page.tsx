import type { Metadata } from 'next'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'

export const metadata: Metadata = metaStranice({
  naslov: 'Uslovi korištenja',
  opis: 'Uslovi korištenja web stranice Svijet Sluha.',
  putanja: '/uslovi-koristenja',
})

export default function UsloviKoristenja() {
  return (
    <div className="kontejner py-10 md:py-14">
      <Mrvice stavke={[{ naziv: 'Uslovi korištenja' }]} />
      <div className="prose-bm mx-auto mt-8 max-w-3xl text-neutral-800">
        {/* NAPOMENA ZA UREDNIKA: nacrt — prije objave obavezno pregledati sa pravnikom
            (dopuniti puni naziv pravnog lica, sjedište, matični/PDV broj) */}
        <h1 className="text-h1 mb-2">Uslovi korištenja</h1>

        <h2>Opšte odredbe</h2>
        <p>
          Korištenjem web stranice svijetsluha.com prihvatate ove uslove. Web stranicu Svijet Sluha
          vodimo u saradnji s Audio BM-om.
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
          Logotip, tekstovi i fotografije na ovoj stranici vlasništvo su Svijet Sluha i Audio BM-a ili partnera i
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
