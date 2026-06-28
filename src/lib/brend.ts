/**
 * Jedan izvor istine za brend.
 *
 * Stranica nastupa kao „Svijet Sluha" — brend koji vodi web i društvene mreže —
 * u saradnji s „Audio BM", audiološkom kućom s 30+ godina iskustva i fizičkim
 * poslovnicama širom Bosne i Hercegovine.
 *
 * PRAVILO (važno za SEO i AEO):
 *  • web / brend / naslovi / logo / copyright            → „Svijet Sluha"
 *  • fizički biznis / poslovnice / NAP / Google profil   → „Audio BM {grad}"
 *    Naziv-adresa-telefon (NAP) mora biti identičan na sajtu, Google profilu,
 *    Facebooku i Instagramu — zato imena poslovnica ostaju „Audio BM".
 */
export const GLAVNI_EMAIL = 'svijetsluha@gmail.com'

export const BREND = {
  /** Marketinški/web brend — naslovi, logo, copyright, OG siteName. */
  naziv: 'Svijet Sluha',
  /** Deskriptivni slogan iz logotipa. */
  tagline: 'Centar za zdravlje sluha',
  /** Endorsement potpis (linija povjerenja u tekstu i schemi). */
  potpis: 'u saradnji s Audio BM',
  /** Audiološka kuća / fizički provajder iza brenda. */
  provajder: 'Audio BM',
  /** Legalni naziv provajdera — za schema/impresum. POTVRDITI tačan BiH entitet. */
  provajderLegalni: 'Audio BM d.o.o.',
  /** Godina osnivanja (Audio BM, 1992 — izvor: audiobm.rs/o-nama). POTVRDITI. */
  provajderOd: 1992,
  /** Produkcijska domena (bez završne kose crte). */
  domena: 'https://svijetsluha.com',
  /** Ime + adresa za „from" polje e-mail obavještenja. */
  emailNaziv: 'Svijet Sluha',
  emailAdresa: GLAVNI_EMAIL,
  /** Zvanični društveni profili — za Organization „sameAs" (povezuje entitet za Google/AI). */
  drustvene: {
    facebook: 'https://www.facebook.com/svijetsluha',
    instagram: 'https://www.instagram.com/svijetsluha',
  },
} as const

/** „Svijet Sluha — u saradnji s Audio BM" — pun naziv s kontekstom. */
export const BREND_PUNI = `${BREND.naziv} — ${BREND.potpis}`

/**
 * Naziv fizičke poslovnice (NAP dosljednost s Google profilom): „Audio BM {grad}".
 * Koristiti u LocalBusiness/MedicalBusiness schemi i svuda gdje se imenuje lokacija.
 */
export const nazivPoslovnice = (grad: string) => `${BREND.provajder} ${grad}`
