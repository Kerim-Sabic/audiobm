import type { Metadata } from 'next'
import { metaStranice } from '@/lib/seo'
import { Mrvice } from '@/components/ui/Mrvice'

export const metadata: Metadata = metaStranice({
  naslov: 'Politika privatnosti',
  opis: 'Kako Audio BM prikuplja, koristi i štiti Vaše lične podatke.',
  putanja: '/politika-privatnosti',
})

export default function PolitikaPrivatnosti() {
  return (
    <div className="kontejner py-10 md:py-14">
      <Mrvice stavke={[{ naziv: 'Politika privatnosti' }]} />
      <div className="prose-bm mx-auto mt-8 max-w-3xl text-neutral-800">
        <h1 className="text-h1 mb-2">Politika privatnosti</h1>
        <p className="text-small text-warning-600">
          [LEGAL_REVIEW_PLACEHOLDER: nacrt — prije objave obavezno pregledati sa pravnikom]
        </p>
        <p className="mt-6">
          Audio BM (u daljem tekstu: „mi") poštuje Vašu privatnost i obrađuje lične podatke u skladu
          sa propisima o zaštiti ličnih podataka koji se primjenjuju u Bosni i Hercegovini.
        </p>

        <h2>Koje podatke prikupljamo</h2>
        <ul>
          <li>
            <strong>Podaci iz obrazaca:</strong> ime i prezime, broj telefona, e-mail adresa (ako je
            navedete) i sadržaj Vaše poruke — kada zakazujete termin ili nam šaljete upit.
          </li>
          <li>
            <strong>Tehnički podaci:</strong> osnovna, anonimizovana statistika posjeta stranici
            (bez kolačića za praćenje pojedinaca).
          </li>
        </ul>

        <h2>Zašto ih prikupljamo</h2>
        <p>
          Podatke koristimo isključivo da Vas kontaktiramo povodom Vašeg upita ili termina, te da
          unaprijedimo našu uslugu. Podatke ne prodajemo niti dijelimo trećim stranama u marketinške
          svrhe.
        </p>

        <h2>Koliko dugo čuvamo podatke</h2>
        <p>
          Upite čuvamo onoliko dugo koliko je potrebno za obradu Vašeg zahtjeva i ispunjenje
          zakonskih obaveza, nakon čega se brišu. [LEGAL_REVIEW_PLACEHOLDER: tačni rokovi čuvanja]
        </p>

        <h2>Vaša prava</h2>
        <p>
          Imate pravo zatražiti uvid u svoje podatke, njihovu ispravku ili brisanje. Dovoljno je da
          nas kontaktirate telefonom ili e-mailom na adresu navedenu na stranici „Kontakt".
        </p>

        <h2>Gdje se podaci čuvaju</h2>
        <p>
          Podaci se čuvaju na serverima unutar Evropske unije, uz odgovarajuće tehničke mjere
          zaštite (šifrovana veza, ograničen pristup).
        </p>

        <h2>Kontakt</h2>
        <p>
          Za sva pitanja o zaštiti podataka obratite nam se putem stranice{' '}
          <a href="/kontakt">Kontakt</a>.
        </p>
        <p className="text-small text-neutral-500">Posljednja izmjena: jun 2026.</p>
      </div>
    </div>
  )
}
