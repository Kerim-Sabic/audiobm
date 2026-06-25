import type { Metadata } from 'next'
import { stvarno, ocisti } from '@/lib/tekst'
import { BREND, nazivPoslovnice } from '@/lib/brend'

export const OSNOVNI_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? BREND.domena

/** Gradi Metadata za stranicu: jedinstven naslov ≤60, opis ≤155, OG/Twitter, canonical, hreflang. */
export function metaStranice({
  naslov,
  opis,
  putanja,
  ogSlika,
  bezIndeksa = false,
}: {
  naslov: string
  opis: string
  putanja: string
  ogSlika?: string
  bezIndeksa?: boolean
}): Metadata {
  const url = `${OSNOVNI_URL}${putanja}`
  const slika = ogSlika ?? `${OSNOVNI_URL}/brand/og-podrazumijevana.png`
  return {
    title: naslov,
    description: opis,
    // Jedna domena, jedan jezik (bs-BA) — bez cross-domain hreflang-a.
    alternates: { canonical: url },
    openGraph: {
      title: naslov,
      description: opis,
      url,
      siteName: BREND.naziv,
      locale: 'bs_BA',
      type: 'website',
      images: [
        { url: slika, width: 1200, height: 630, alt: `${BREND.naziv} — slušni aparati i provjera sluha` },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: naslov,
      description: opis,
      images: [slika],
    },
    ...(bezIndeksa ? { robots: { index: false, follow: false } } : {}),
  }
}

/**
 * Organization JSON-LD — na svim stranicama.
 *
 * Modelira odnos: „Svijet Sluha" (web brend) ↔ „Audio BM" (audiološka kuća,
 * provajder s 30+ god. iskustva). Tako Google i AI asistenti razumiju ko stoji
 * iza sajta i nasljeđuju Audio BM autoritet.
 *
 * `sameAs` — proslijediti zvanične profile (Facebook, Instagram, YouTube,
 * Google Business Profile) iz Podešavanja kad budu uneseni.
 */
export function organizacijaJsonLd(sameAs: string[] = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BREND.naziv,
    url: OSNOVNI_URL,
    logo: `${OSNOVNI_URL}/brand/logo.png`,
    description:
      'Slušni aparati, besplatne provjere sluha i audiološke usluge — u saradnji s Audio BM, audiološkom kućom s više od 30 godina iskustva u Bosni i Hercegovini.',
    brand: { '@type': 'Brand', name: BREND.naziv },
    parentOrganization: {
      '@type': 'Organization',
      name: BREND.provajderLegalni,
      foundingDate: String(BREND.provajderOd),
    },
    ...(sameAs.length ? { sameAs } : {}),
  }
}

type PoslovnicaZaShemu = {
  naziv: string
  slug: string
  grad: string
  adresa: string
  geoSirina?: number | null
  geoDuzina?: number | null
  telefoni?: { broj: string }[] | null
  emaili?: { email: string }[] | null
  radnoVrijeme?: { dan: string; od?: string | null; do?: string | null; zatvoreno?: boolean | null }[] | null
  radnoVrijemePotvrdjeno?: boolean | null
}

const DAN_SHEMA: Record<string, string> = {
  ponedjeljak: 'Monday',
  utorak: 'Tuesday',
  srijeda: 'Wednesday',
  cetvrtak: 'Thursday',
  petak: 'Friday',
  subota: 'Saturday',
  nedjelja: 'Sunday',
}

/** MedicalBusiness/LocalBusiness JSON-LD po poslovnici, sa geo i radnim vremenom.
 *  Placeholder podaci (adresa/telefon koji još nisu uneseni) se izostavljaju. */
export function poslovnicaJsonLd(p: PoslovnicaZaShemu) {
  const telefon = stvarno(p.telefoni?.[0]?.broj)
  const email = stvarno(p.emaili?.[0]?.email)
  const adresa = stvarno(p.adresa)
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalBusiness', 'LocalBusiness'],
    '@id': `${OSNOVNI_URL}/poslovnice/${p.slug}`,
    name: nazivPoslovnice(p.grad),
    url: `${OSNOVNI_URL}/poslovnice/${p.slug}`,
    image: `${OSNOVNI_URL}/brand/og-podrazumijevana.png`,
    ...(telefon ? { telephone: telefon } : {}),
    ...(email ? { email } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(adresa ? { streetAddress: adresa } : {}),
      addressLocality: p.grad,
      addressCountry: 'BA',
    },
    ...(p.geoSirina && p.geoDuzina
      ? { geo: { '@type': 'GeoCoordinates', latitude: p.geoSirina, longitude: p.geoDuzina } }
      : {}),
    ...(p.radnoVrijemePotvrdjeno && p.radnoVrijeme?.length
      ? {
          openingHoursSpecification: p.radnoVrijeme
            .filter((rv) => !rv.zatvoreno && rv.od && rv.do)
            .map((rv) => ({
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: DAN_SHEMA[rv.dan],
              opens: rv.od,
              closes: rv.do,
            })),
        }
      : {}),
    parentOrganization: { '@type': 'Organization', name: BREND.provajderLegalni },
  }
}

/** FAQPage JSON-LD — uredničke oznake se uklanjaju iz teksta. */
export function pitanjaJsonLd(stavke: { pitanje: string; odgovor: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: stavke.map((s) => ({
      '@type': 'Question',
      name: ocisti(s.pitanje) ?? s.pitanje,
      acceptedAnswer: { '@type': 'Answer', text: ocisti(s.odgovor) ?? '' },
    })),
  }
}

/** Article JSON-LD za objave bloga. */
export function clanakJsonLd(o: {
  naslov: string
  slug: string
  izvod: string
  datumObjave?: string | null
  slika?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: o.naslov,
    description: o.izvod,
    url: `${OSNOVNI_URL}/savjeti/${o.slug}`,
    ...(o.datumObjave ? { datePublished: o.datumObjave } : {}),
    ...(o.slika ? { image: o.slika } : {}),
    publisher: {
      '@type': 'Organization',
      name: BREND.naziv,
      logo: { '@type': 'ImageObject', url: `${OSNOVNI_URL}/brand/logo.png` },
    },
  }
}
