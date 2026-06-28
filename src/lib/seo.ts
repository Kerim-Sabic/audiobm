import type { Metadata } from 'next'
import { stvarno, ocisti } from '@/lib/tekst'
import { BREND, nazivPoslovnice } from '@/lib/brend'

// SEO kanonski izvor: u PRODUKCIJI uvijek produkcijska domena (svijetsluha.com)
// — ne smije zavisiti od (pogrešno postavljene) NEXT_PUBLIC_SERVER_URL na buildu,
// inače canonical/OG/sitemap pokazuju na netlify.app i ruše SEO. U razvoju dopuštamo override.
export const OSNOVNI_URL =
  process.env.NODE_ENV === 'production'
    ? BREND.domena
    : process.env.NEXT_PUBLIC_SERVER_URL ?? BREND.domena

/** Naslov početne MORA sadržavati brend (za rangiranje na „Svijet Sluha"); ako je CMS
 *  vrijednost zastarjela (npr. „Audio BM"), koristi se ispravan brendirani naslov. */
export function brendNaslov(cmsNaslov?: string | null) {
  return cmsNaslov && cmsNaslov.includes(BREND.naziv)
    ? cmsNaslov
    : `${BREND.naziv} — slušni aparati i besplatna provjera sluha`
}

/** Meta opis početne: brendiran i dovoljne dužine (≈150–220), čak i ako je CMS zastario. */
export function brendOpis(cmsOpis?: string | null) {
  return cmsOpis && cmsOpis.includes(BREND.naziv) && cmsOpis.length >= 140
    ? cmsOpis
    : 'Svijet Sluha — besplatna provjera sluha i slušni aparati vodećih svjetskih brendova, uz više od 30 godina povjerenja i fizičke poslovnice širom Bosne i Hercegovine.'
}

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

export function metaOpisProizvoda(p: {
  naziv: string
  seo?: { opis?: string | null } | null
  kratkiOpis?: string | null
  fallback: string
}) {
  const seoOpis = stvarno(p.seo?.opis)
  const kratkiOpis = stvarno(p.kratkiOpis)
  const opis = seoOpis ?? kratkiOpis ?? p.fallback
  return opis.toLocaleLowerCase('bs-BA').includes(p.naziv.toLocaleLowerCase('bs-BA')) ? opis : `${p.naziv}: ${opis}`
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
export function organizacijaJsonLd({
  sameAs = [],
  ocjena,
}: { sameAs?: string[]; ocjena?: { broj: number; prosjek: number } } = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${OSNOVNI_URL}/#organizacija`,
    name: BREND.naziv,
    url: OSNOVNI_URL,
    logo: `${OSNOVNI_URL}/brand/logo.png`,
    description:
      'Slušni aparati, besplatne provjere sluha i audiološke usluge — u saradnji s Audio BM, audiološkom kućom s više od 30 godina iskustva u Bosni i Hercegovini.',
    brand: { '@type': 'Brand', name: BREND.naziv },
    // Sidri entitet u BiH — razlikuje „Svijet Sluha" (BiH) od srpskog „Svet Sluha".
    areaServed: { '@type': 'Country', name: 'Bosna i Hercegovina' },
    address: { '@type': 'PostalAddress', addressCountry: 'BA' },
    parentOrganization: {
      '@type': 'Organization',
      name: BREND.provajderLegalni,
      foundingDate: String(BREND.provajderOd),
    },
    ...(sameAs.length ? { sameAs } : {}),
    ...(ocjena && ocjena.broj > 0 ? { aggregateRating: agregatnaOcjena(ocjena) } : {}),
  }
}

/** AggregateRating čvor iz stvarnih odobrenih recenzija. */
function agregatnaOcjena(ocjena: { broj: number; prosjek: number }) {
  return {
    '@type': 'AggregateRating',
    ratingValue: ocjena.prosjek.toFixed(1),
    reviewCount: ocjena.broj,
    bestRating: 5,
    worstRating: 1,
  }
}

/** WebSite čvor — povezuje sajt s Organization entitetom (graf). */
export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${OSNOVNI_URL}/#sajt`,
    url: OSNOVNI_URL,
    name: BREND.naziv,
    inLanguage: 'bs-BA',
    publisher: { '@id': `${OSNOVNI_URL}/#organizacija` },
  }
}

/** Service JSON-LD za stranicu usluge. */
export function uslugaJsonLd(u: { naziv: string; slug: string; kratkiOpis: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${OSNOVNI_URL}/usluge/${u.slug}#usluga`,
    name: u.naziv,
    description: u.kratkiOpis,
    serviceType: u.naziv,
    url: `${OSNOVNI_URL}/usluge/${u.slug}`,
    provider: { '@type': 'Organization', '@id': `${OSNOVNI_URL}/#organizacija`, name: BREND.naziv },
    areaServed: { '@type': 'Country', name: 'Bosna i Hercegovina' },
  }
}

/** Product (+ Offer kad ima cijene) JSON-LD za proizvod/model aparata. */
export function proizvodJsonLd(p: {
  naziv: string
  slug: string
  kategorija: string
  brend?: string | null
  kratkiOpis?: string | null
  cijena?: number | null
  slika?: string
}) {
  const putanja = p.kategorija === 'slusni-aparati' ? `/slusni-aparati/modeli/${p.slug}` : `/proizvodi/${p.slug}`
  const url = `${OSNOVNI_URL}${putanja}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.naziv,
    url,
    ...(p.kratkiOpis ? { description: p.kratkiOpis } : {}),
    ...(p.brend ? { brand: { '@type': 'Brand', name: p.brend } } : {}),
    ...(p.slika ? { image: p.slika } : {}),
    ...(typeof p.cijena === 'number' && p.cijena > 0
      ? {
          offers: {
            '@type': 'Offer',
            url,
            price: p.cijena,
            priceCurrency: 'BAM',
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'Organization', '@id': `${OSNOVNI_URL}/#organizacija`, name: BREND.naziv },
          },
        }
      : {}),
  }
}

/** ItemList of Person — tim stručnjaka (E-E-A-T signal). */
export function timJsonLd(
  clanovi: { ime: string; titula?: string | null; biografija?: string | null; jezici?: { jezik: string }[] | null }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: clanovi.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Person',
        name: c.ime,
        ...(c.titula ? { jobTitle: c.titula } : {}),
        ...(c.biografija ? { description: c.biografija } : {}),
        worksFor: { '@type': 'Organization', '@id': `${OSNOVNI_URL}/#organizacija`, name: BREND.naziv },
        knowsAbout: ['audiologija', 'slušni aparati', 'provjera sluha'],
        ...(c.jezici?.length ? { knowsLanguage: c.jezici.map((j) => j.jezik) } : {}),
      },
    })),
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
export function poslovnicaJsonLd(p: PoslovnicaZaShemu, ocjena?: { broj: number; prosjek: number }) {
  const telefon = stvarno(p.telefoni?.[0]?.broj)
  const adresa = stvarno(p.adresa)
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'LocalBusiness'],
    '@id': `${OSNOVNI_URL}/poslovnice/${p.slug}#klinika`,
    description: `Audiološki centar ${nazivPoslovnice(p.grad)} — besplatna provjera sluha, slušni aparati, baterije i servis.`,
    name: nazivPoslovnice(p.grad),
    url: `${OSNOVNI_URL}/poslovnice/${p.slug}`,
    image: `${OSNOVNI_URL}/brand/og-podrazumijevana.png`,
    ...(telefon ? { telephone: telefon } : {}),
    email: BREND.emailAdresa,
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
    parentOrganization: { '@type': 'Organization', '@id': `${OSNOVNI_URL}/#organizacija`, name: BREND.provajderLegalni },
    ...(ocjena && ocjena.broj > 0 ? { aggregateRating: agregatnaOcjena(ocjena) } : {}),
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
