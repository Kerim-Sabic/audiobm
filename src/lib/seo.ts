import type { Metadata } from 'next'

export const OSNOVNI_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://audiobm.ba'

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
    alternates: {
      canonical: url,
      languages: {
        'bs-BA': url,
        'sr-RS': 'https://audiobm.rs',
        'sl-SI': 'https://audiobm.si',
        'sr-ME': 'https://audiobm.me',
        'mk-MK': 'https://audiobm.mk',
      },
    },
    openGraph: {
      title: naslov,
      description: opis,
      url,
      siteName: 'Audio BM',
      locale: 'bs_BA',
      type: 'website',
      images: [{ url: slika, width: 1200, height: 630, alt: 'Audio BM — slušni aparati i provjera sluha' }],
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

/** Organization JSON-LD — na svim stranicama. */
export function organizacijaJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Audio BM',
    url: OSNOVNI_URL,
    logo: `${OSNOVNI_URL}/brand/logo.png`,
    description:
      'Slušni aparati, besplatne provjere sluha i audiološke usluge — više od 30 godina iskustva u Bosni i Hercegovini.',
    sameAs: ['https://audiobm.rs', 'https://audiobm.si', 'https://audiobm.me', 'https://audiobm.mk'],
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

/** MedicalBusiness/LocalBusiness JSON-LD po poslovnici, sa geo i radnim vremenom. */
export function poslovnicaJsonLd(p: PoslovnicaZaShemu) {
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalBusiness', 'LocalBusiness'],
    '@id': `${OSNOVNI_URL}/poslovnice/${p.slug}`,
    name: `Audio BM ${p.grad}`,
    url: `${OSNOVNI_URL}/poslovnice/${p.slug}`,
    image: `${OSNOVNI_URL}/brand/og-podrazumijevana.png`,
    telephone: p.telefoni?.[0]?.broj,
    email: p.emaili?.[0]?.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: p.adresa,
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
    parentOrganization: { '@type': 'Organization', name: 'Audio BM' },
  }
}

/** FAQPage JSON-LD. */
export function pitanjaJsonLd(stavke: { pitanje: string; odgovor: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: stavke.map((s) => ({
      '@type': 'Question',
      name: s.pitanje,
      acceptedAnswer: { '@type': 'Answer', text: s.odgovor },
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
      name: 'Audio BM',
      logo: { '@type': 'ImageObject', url: `${OSNOVNI_URL}/brand/logo.png` },
    },
  }
}
