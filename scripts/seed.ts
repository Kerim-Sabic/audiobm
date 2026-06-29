/**
 * Seed: puni CMS stvarnim podacima — provjerene lokacije, katalog iz
 * products-manifest.json (sa slikama), usluge, česta pitanja, navigacija.
 * Pokretanje: pnpm seed   (idempotentno — postojeći zapisi se preskaču)
 */
import { getPayload } from 'payload'
import path from 'node:path'
import { readFileSync, existsSync, statSync } from 'node:fs'
import sharp from 'sharp'
import config from '../src/payload.config'
import {
  kategorijaProizvoda,
  nacinProdaje,
  pouzdanaCijena,
  tipAparata,
  type ManifestProduct,
} from '../src/lib/catalog'
import { dokument, paragraf, naslov, lista, tekst, link, slika, izHtml } from '../src/lib/lexical'
import { UKLONJENI_SLUGOVI_OBJAVA } from '../src/lib/objave'
import { GLAVNI_EMAIL } from '../src/lib/brend'

const ROOT = path.resolve(process.cwd())

const payload = await getPayload({ config })
const log = (m: string) => payload.logger.info(`[seed] ${m}`)

// ————————————————— 1. Vlasnički korisnik —————————————————
const postojeciKorisnici = await payload.find({ collection: 'korisnici', limit: 1 })
if (postojeciKorisnici.totalDocs === 0) {
  // Kredencijali iz env (SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD) — bez stvarne lozinke u repou.
  const adminEmail = GLAVNI_EMAIL
  const adminLozinka = process.env.SEED_ADMIN_PASSWORD ?? 'PromijeniOdmah-2026!'
  await payload.create({
    collection: 'korisnici',
    data: {
      email: adminEmail,
      password: adminLozinka,
      ime: 'Vlasnik Svijet Sluha',
      uloga: 'vlasnik',
    },
  })
  log(`Korisnik ${adminEmail} kreiran — lozinku promijeniti odmah nakon prve prijave!`)
} else {
  log('Korisnici već postoje — preskačem')
}

// ————————————————— 2. Poslovnice (provjereni podaci sa stare stranice) —————————————————
type PoslovnicaSeed = {
  naziv: string
  slug: string
  grad: string
  adresa: string
  geoSirina: number
  geoDuzina: number
  telefoni: { oznaka: string; broj: string }[]
  emaili: { email: string }[]
  novaPoslovnica?: boolean
  redoslijed: number
  opis: string
}

type RadnoVrijemeSeed = {
  dan: 'ponedjeljak' | 'utorak' | 'srijeda' | 'cetvrtak' | 'petak' | 'subota' | 'nedjelja'
  od?: string
  do?: string
  zatvoreno?: boolean
}

const POSLOVNICE: PoslovnicaSeed[] = [
  {
    naziv: 'Audio BM Sarajevo',
    slug: 'sarajevo',
    grad: 'Sarajevo',
    adresa: 'Fra Anđela Zvizdovića 1, UNITIC neboderi',
    geoSirina: 43.8558,
    geoDuzina: 18.4085,
    telefoni: [{ oznaka: 'Telefon', broj: '033 977 966' }],
    emaili: [{ email: GLAVNI_EMAIL }],
    novaPoslovnica: true,
    redoslijed: 1,
    opis:
      'Svijet Sluha u Sarajevu — centar za slušnu akustiku, Experience Room, savjetovanje i besplatna provjera sluha u UNITIC-u.',
  },
  {
    naziv: 'Audio BM Banja Luka',
    slug: 'banja-luka',
    grad: 'Banja Luka',
    adresa: 'Dr. Jovana Raškovića 7',
    geoSirina: 44.7722,
    geoDuzina: 17.191,
    telefoni: [{ oznaka: 'Telefon', broj: '051 218 781' }],
    emaili: [{ email: GLAVNI_EMAIL }],
    redoslijed: 2,
    opis: 'Centralna poslovnica u Banjoj Luci — kompletna audiološka dijagnostika i servis.',
  },
  {
    naziv: 'Audio BM Gradiška',
    slug: 'gradiska',
    grad: 'Gradiška',
    adresa: 'Mitropolita Georgija Nikolajevića 20',
    geoSirina: 45.1447,
    geoDuzina: 17.2521,
    telefoni: [{ oznaka: 'Telefon', broj: '051 816 908' }],
    emaili: [{ email: GLAVNI_EMAIL }],
    redoslijed: 3,
    opis: 'Poslovnica u centru Gradiške — provjera sluha, slušni aparati i pribor.',
  },
  {
    naziv: 'Audio BM Bijeljina',
    slug: 'bijeljina',
    grad: 'Bijeljina',
    adresa: 'Srpske vojske 38A',
    geoSirina: 44.7587,
    geoDuzina: 19.2164,
    telefoni: [{ oznaka: 'Telefon', broj: '055 410 010' }],
    emaili: [{ email: GLAVNI_EMAIL }],
    redoslijed: 4,
    opis: 'Poslovnica u Bijeljini — besplatna provjera sluha i stručno savjetovanje.',
  },
  {
    naziv: 'Audio BM Doboj',
    slug: 'doboj',
    grad: 'Doboj',
    adresa: 'Solunskih dobrovoljaca 4',
    geoSirina: 44.7318,
    geoDuzina: 18.0856,
    telefoni: [{ oznaka: 'Telefon', broj: '053 242 498' }],
    emaili: [{ email: GLAVNI_EMAIL }],
    redoslijed: 5,
    opis: 'Poslovnica u Doboju — slušni aparati, baterije i servis.',
  },
  {
    naziv: 'Audio BM Brčko',
    slug: 'brcko',
    grad: 'Brčko',
    adresa: 'Ljudevita Gaja 2',
    geoSirina: 44.8694,
    geoDuzina: 18.8081,
    telefoni: [{ oznaka: 'Telefon', broj: '049 206 212' }],
    emaili: [{ email: GLAVNI_EMAIL }],
    redoslijed: 6,
    opis: 'Poslovnica u Brčkom — provjera sluha i kompletna ponuda slušnih aparata.',
  },
  {
    naziv: 'Audio BM Tuzla',
    slug: 'tuzla',
    grad: 'Tuzla',
    adresa: 'Soline 10',
    geoSirina: 44.5594495,
    geoDuzina: 18.6952466,
    telefoni: [{ oznaka: 'Telefon', broj: '063132400' }],
    emaili: [{ email: GLAVNI_EMAIL }],
    redoslijed: 7,
    opis: 'Poslovnica u Tuzli — besplatna provjera sluha, slušni aparati i servis.',
  },
]

// lokativ gradova za prirodne SEO rečenice
const LOKATIV: Record<string, string> = {
  Sarajevo: 'Sarajevu',
  'Banja Luka': 'Banjoj Luci',
  Gradiška: 'Gradišci',
  Bijeljina: 'Bijeljini',
  Doboj: 'Doboju',
  Brčko: 'Brčkom',
  Tuzla: 'Tuzli',
}

const poslovniceIds: Record<string, number> = {}
for (const p of POSLOVNICE) {
  const radnoVrijeme: RadnoVrijemeSeed[] =
    p.slug === 'sarajevo'
      ? [
          { dan: 'ponedjeljak', od: '08:00', do: '16:00', zatvoreno: false },
          { dan: 'utorak', od: '08:00', do: '16:00', zatvoreno: false },
          { dan: 'srijeda', od: '08:00', do: '18:00', zatvoreno: false },
          { dan: 'cetvrtak', od: '08:00', do: '16:00', zatvoreno: false },
          { dan: 'petak', od: '08:00', do: '16:00', zatvoreno: false },
        ]
      : []
  const poslovnicaData = {
    ...p,
    aktivna: true,
    radnoVrijemePotvrdjeno: p.slug === 'sarajevo',
    radnoVrijeme,
    googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `Audio BM ${p.adresa}, ${p.grad}`,
    )}`,
    seo: {
      naslov: `Audio BM ${p.grad} — slušni aparati i provjera sluha`,
      opis: `Audio BM poslovnica u ${LOKATIV[p.grad] ?? p.grad} — besplatna provjera sluha, slušni aparati, baterije i servis.`,
    },
    _status: 'published' as const,
  }
  const postoji = await payload.find({
    collection: 'poslovnice',
    where: { slug: { equals: p.slug } },
    limit: 1,
    draft: false,
  })
  if (postoji.totalDocs > 0) {
    const id = postoji.docs[0].id as number
    poslovniceIds[p.slug] = id
    await payload.update({
      collection: 'poslovnice',
      id,
      data: p.slug === 'sarajevo' ? poslovnicaData : { emaili: p.emaili },
    })
    continue
  }
  const doc = await payload.create({
    collection: 'poslovnice',
    data: poslovnicaData,
  })
  poslovniceIds[p.slug] = doc.id as number
  log(`Poslovnica: ${p.naziv}`)
}

// ————————————————— 3. Proizvodi iz manifesta —————————————————
const manifestPutanja = path.join(ROOT, 'products-manifest.json')
if (existsSync(manifestPutanja)) {
  const manifest: ManifestProduct[] = JSON.parse(readFileSync(manifestPutanja, 'utf8'))
  let novih = 0
  for (const p of manifest) {
    const postoji = await payload.find({
      collection: 'proizvodi',
      where: { slug: { equals: p.handle } },
      limit: 1,
      draft: false,
    })
    if (postoji.totalDocs > 0) continue

    // otpremi slike (original → Payload pravi WebP verzije + LQIP)
    const slikeIds: number[] = []
    for (const img of p.images) {
      if (!img.local || img.local === '[MISSING_ASSET]') continue
      const filePath = path.join(ROOT, img.local)
      if (!existsSync(filePath)) continue
      try {
        const medij = await payload.create({
          collection: 'mediji',
          data: { alt: img.alt || p.title },
          filePath,
        })
        slikeIds.push(medij.id as number)
      } catch (e) {
        log(`! Slika nije otpremljena (${p.handle}): ${(e as Error).message}`)
      }
    }
    if (slikeIds.length === 0) {
      log(`! [MISSING_ASSET] Proizvod ${p.handle} nema nijednu sliku — preskačem`)
      continue
    }

    const kategorija = kategorijaProizvoda(p)
    const nacin = nacinProdaje(p)
    const cijena = pouzdanaCijena(p)
    const sumnjivaCijena = nacin === 'maloprodaja' && p.price != null && p.price >= 1000

    const kratkiOpisIzvor = p.bodyHtml.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

    await payload.create({
      collection: 'proizvodi',
      data: {
        naziv: p.title,
        slug: p.handle,
        nacin,
        kategorija,
        brend: normalizujBrend(p.vendor),
        ...(tipAparata(p) ? { tipAparata: tipAparata(p)! } : {}),
        ...(cijena != null ? { cijena } : {}),
        ...(sumnjivaCijena
          ? {
              cijenaNapomena: `Cijenu za ovaj proizvod potvrđujemo na upit jer je stari katalog imao neusklađen unos.`,
            }
          : nacin === 'konsultacija'
            ? { cijenaNapomena: 'Cijena zavisi od modela i stepena oštećenja sluha — saznajte na besplatnom savjetovanju.' }
            : {}),
        kratkiOpis: kratkiOpisIzvor.slice(0, 200) || p.title,
        opis: izHtml(p.bodyHtml) as never,
        slike: slikeIds,
        istaknut: false,
        aktivan: true,
        legacyHandle: p.handle,
        seo: {
          naslov: p.title.slice(0, 60),
          opis: (kratkiOpisIzvor || p.title).slice(0, 155),
        },
        _status: 'published',
      },
    })
    novih++
  }
  log(`Proizvodi: ${novih} novih iz manifesta`)
} else {
  log('! products-manifest.json ne postoji — pokrenite prvo: pnpm crawl')
}

function normalizujBrend(vendor: string) {
  const mapa: Record<string, string> = {
    gsi: 'GSI',
    Bernafon: 'Bernafon',
    Unitron: 'Unitron',
    Varta: 'Varta',
    Cochlear: 'Cochlear',
    Otometrics: 'Otometrics',
    'Dynamic ear company': 'Dynamic Ear Company',
    Dreve: 'Dreve',
    Alerta: 'Alerta',
  }
  return (mapa[vendor] ?? 'Ostalo') as never
}

// ————————————————— 4. Usluge —————————————————
const USLUGE = [
  {
    naziv: 'Besplatna provjera sluha',
    slug: 'provjera-sluha',
    ikona: 'ear',
    kratkiOpis:
      'Kompletna provjera sluha bez naknade i bez obaveze — saznajte stanje svog sluha za pola sata.',
    trajanje: '30–45 minuta',
    zaKoga:
      'Za svakoga ko primjećuje da slabije čuje, pojačava televizor, teže prati razgovor u društvu — i za sve koji jednostavno žele provjeriti sluh. Posebno preporučujemo osobama starijim od 50 godina.',
    koraci: [
      {
        naslov: 'Razgovor o Vašem sluhu',
        opis: 'Naš stručnjak Vas pita o situacijama u kojima teže čujete — bez žurbe i bez stručnih izraza.',
      },
      {
        naslov: 'Pregled uha',
        opis: 'Bezbolan pregled ušnog kanala otoskopom — traje par minuta i odmah otkriva npr. ušni vosak.',
      },
      {
        naslov: 'Mjerenje sluha (audiometrija)',
        opis: 'U tihoj prostoriji slušate tonove kroz slušalice i pritisnete dugme kad čujete zvuk. Jednostavno i potpuno bezbolno.',
      },
      {
        naslov: 'Rezultati i savjet — odmah',
        opis: 'Audiogram Vam objasnimo razumljivim jezikom. Ako je sluh uredan — odlično! Ako nije, predložimo šta dalje, bez ikakve obaveze kupovine.',
      },
    ],
    sadrzaj: dokument(
      paragraf(
        'Provjera sluha u Audio BM poslovnicama je potpuno besplatna i ne obavezuje Vas ni na šta. ',
        tekst('Dovoljno je da zakažete termin i dođete — sve ostalo prepustite nama.', true),
      ),
      paragraf(
        'Slobodno povedite člana porodice. Četiri uha čuju bolje od dva, a i lakše je zajedno donijeti odluku.',
      ),
    ),
  },
  {
    naziv: 'Prilagođavanje i servis slušnih aparata',
    slug: 'prilagodjavanje-i-servis',
    ikona: 'settings',
    kratkiOpis:
      'Fino podešavanje aparata prema Vašem sluhu, redovne kontrole, čišćenje i popravke — da aparat uvijek radi kako treba.',
    trajanje: '15–30 minuta po posjeti',
    zaKoga:
      'Za sve korisnike slušnih aparata — i one koji su aparat kupili kod nas i one kojima treba pomoć sa postojećim aparatom.',
    koraci: [
      {
        naslov: 'Prvo prilagođavanje',
        opis: 'Aparat podešavamo tačno prema Vašem audiogramu i navikama slušanja.',
      },
      {
        naslov: 'Probni period i kontrole',
        opis: 'U prvim sedmicama korištenja dolazite na kontrole da aparat doteramo do savršenstva.',
      },
      {
        naslov: 'Redovno održavanje',
        opis: 'Čišćenje, zamjena filtera i cjevčica, provjera rada — produžava vijek trajanja aparata.',
      },
      {
        naslov: 'Popravke',
        opis: 'Kvarove, čišćenje i provjeru rada rješavamo u našem servisu. Za složenije popravke odmah dobijate jasan rok i cijenu prije nastavka rada.',
      },
    ],
    sadrzaj: dokument(
      paragraf(
        'Slušni aparat je precizan medicinski uređaj — redovnim održavanjem služi godinama. Dođite u bilo koju našu poslovnicu.',
      ),
    ),
  },
  {
    naziv: 'Kohlearni implanti',
    slug: 'kohlearni-implanti',
    ikona: 'stethoscope',
    kratkiOpis:
      'Informacije i podrška za Cochlear™ sisteme — za osobe kojima slušni aparati više nisu dovoljni.',
    trajanje: 'Savjetovanje: oko 45 minuta',
    zaKoga:
      'Za osobe sa teškim i ekstremno teškim oštećenjem sluha kod kojih slušni aparati ne daju dovoljno razumijevanja govora, uključujući i djecu.',
    koraci: [
      {
        naslov: 'Informativni razgovor',
        opis: 'Objasnimo Vam kako kohlearni implant radi i da li je opcija za Vas ili Vaše dijete.',
      },
      {
        naslov: 'Upućivanje na obradu',
        opis: 'Kandidaturu za implantaciju utvrđuje medicinski tim u bolnici — pomažemo Vam kroz cijeli postupak.',
      },
      {
        naslov: 'Podrška nakon implantacije',
        opis: 'Servis procesora zvuka, rezervni dijelovi i podešavanja — tu smo dugoročno.',
      },
    ],
    sadrzaj: dokument(
      paragraf(
        'Audio BM sarađuje sa kompanijom ',
        tekst('Cochlear', true),
        ', svjetskim liderom u slušnim implantima. Za detalje o postupku i pravima iz zdravstvenog osiguranja kontaktirajte nas — svaki slučaj je drugačiji.',
      ),
    ),
  },
] as const

for (const [i, u] of USLUGE.entries()) {
  const postoji = await payload.find({
    collection: 'usluge',
    where: { slug: { equals: u.slug } },
    limit: 1,
    draft: false,
  })
  const data = {
    naziv: u.naziv,
    slug: u.slug,
    ikona: u.ikona as never,
    kratkiOpis: u.kratkiOpis,
    trajanje: u.trajanje,
    zaKoga: u.zaKoga,
    koraci: [...u.koraci],
    sadrzaj: u.sadrzaj as never,
    redoslijed: i + 1,
    aktivna: true,
    seo: { naslov: u.naziv.slice(0, 60), opis: u.kratkiOpis.slice(0, 155) },
    _status: 'published' as const,
  }

  if (postoji.totalDocs > 0) {
    await payload.update({ collection: 'usluge', id: postoji.docs[0].id, data })
    log(`Usluga ažurirana: ${u.naziv}`)
    continue
  }

  await payload.create({ collection: 'usluge', data })
  log(`Usluga: ${u.naziv}`)
}

// ————————————————— 5. Česta pitanja (19 stvarnih) —————————————————
const PITANJA: { grupa: string; pitanje: string; odgovor: string; naPocetnoj?: boolean }[] = [
  {
    grupa: 'prva-posjeta',
    naPocetnoj: true,
    pitanje: 'Da li je provjera sluha zaista besplatna?',
    odgovor:
      'Da. Provjera sluha i savjetovanje u svim našim poslovnicama su potpuno besplatni i ne obavezuju Vas na kupovinu. Dolazak je najlakše zakazati telefonom ili putem obrasca na ovoj stranici.',
  },
  {
    grupa: 'prva-posjeta',
    naPocetnoj: true,
    pitanje: 'Koliko traje prva posjeta?',
    odgovor:
      'Računajte na 30 do 45 minuta. Toliko nam treba za razgovor, pregled uha, mjerenje sluha i objašnjenje rezultata — bez žurbe.',
  },
  {
    grupa: 'prva-posjeta',
    pitanje: 'Treba li mi uputnica ljekara?',
    odgovor:
      'Za besplatnu provjeru sluha kod nas uputnica nije potrebna — dovoljno je da zakažete termin i dođete. Uputnica i medicinska dokumentacija trebaju tek ako kasnije želite ostvariti pravo na refundaciju kroz zdravstveno osiguranje.',
  },
  {
    grupa: 'prva-posjeta',
    pitanje: 'Mogu li povesti nekoga sa sobom?',
    odgovor:
      'Naravno — i preporučujemo. Član porodice pomaže da zajedno zapamtite sve informacije, a poznat glas je koristan i pri testiranju razumijevanja govora.',
  },
  {
    grupa: 'prva-posjeta',
    pitanje: 'Šta ako rezultati pokažu da mi sluh slabi?',
    odgovor:
      'Naš stručnjak će Vam mirno i razumljivo objasniti šta rezultati znače i koje mogućnosti postoje. Odluku donosite Vi — bez pritiska i bez obaveze.',
  },
  {
    grupa: 'cijene-i-refundacija',
    naPocetnoj: true,
    pitanje: 'Koliko košta slušni aparat?',
    odgovor:
      'Cijena zavisi od tehnološkog nivoa, tipa aparata i Vašeg nalaza. Okvirno, klase slušnih aparata počinju od 650 KM, 1.450 KM, 2.450 KM i 3.950 KM. Tačnu ponudu dobijate na besplatnom savjetovanju.',
  },
  {
    grupa: 'cijene-i-refundacija',
    pitanje: 'Da li zdravstveno osiguranje pokriva dio cijene?',
    odgovor:
      'U određenim slučajevima moguće je ostvariti pravo na refundaciju kroz fond zdravstvenog osiguranja. Postupak i iznosi se razlikuju po entitetu i kategoriji osiguranika — u poslovnici ćemo Vam objasniti potrebnu dokumentaciju.',
  },
  {
    grupa: 'cijene-i-refundacija',
    pitanje: 'Mogu li platiti na rate?',
    odgovor:
      'Mogućnosti plaćanja zavise od odabranog modela i poslovnice. Na besplatnom savjetovanju dobijate pisanu ponudu i jasno objašnjenje dostupnih opcija plaćanja prije bilo kakve odluke.',
  },
  {
    grupa: 'cijene-i-refundacija',
    pitanje: 'Koliko koštaju baterije za slušni aparat?',
    odgovor:
      'Pakovanje od 6 Varta power one baterija košta 9 KM, u svim veličinama (10, 13, 312 i 675). Dostupne su u svim našim poslovnicama.',
  },
  {
    grupa: 'aparati-i-odrzavanje',
    naPocetnoj: true,
    pitanje: 'Koje vrste slušnih aparata postoje?',
    odgovor:
      'Tri osnovne: kanalni (gotovo nevidljivi, nose se u uhu), zaušni (tanki, iza uha) i zaušni za teža oštećenja sluha (snažniji zvuk). Koji je pravi za Vas zavisi od nalaza i Vaših navika — to utvrdimo zajedno na savjetovanju.',
  },
  {
    grupa: 'aparati-i-odrzavanje',
    pitanje: 'Postoje li punjivi aparati, bez zamjene baterija?',
    odgovor:
      'Da. Punjivi aparati se preko noći pune na malom punjaču — ujutro su spremni za cijeli dan. Posebno su praktični za osobe kojima je zamjena sitnih baterija naporna.',
  },
  {
    grupa: 'aparati-i-odrzavanje',
    pitanje: 'Mogu li aparat povezati sa mobitelom i televizorom?',
    odgovor:
      'Savremeni aparati imaju Bluetooth — telefonske razgovore i muziku čujete direktno u aparatima. Uz TV adapter zvuk televizora ide pravo u Vaše aparate, dok ukućani gledaju na normalnoj glasnoći.',
  },
  {
    grupa: 'aparati-i-odrzavanje',
    pitanje: 'Koliko traje navikavanje na slušni aparat?',
    odgovor:
      'Obično dvije do četiri sedmice. Mozak se postepeno ponovo navikava na zvukove koje dugo nije čuo. Zato prve sedmice nosite aparat svaki dan i dolazite na kontrole — fino ga podešavamo prema Vašem iskustvu.',
  },
  {
    grupa: 'aparati-i-odrzavanje',
    pitanje: 'Kako da održavam slušni aparat?',
    odgovor:
      'Svaku večer aparat obrišite suhom mekom krpicom i ostavite ga da „prenoći" otvoren (kod aparata na baterije — sa otvorenim ležištem baterije). Izbjegavajte vodu, lak za kosu i velike vrućine. Filtere i cjevčice mijenjamo u poslovnici za par minuta.',
  },
  {
    grupa: 'aparati-i-odrzavanje',
    pitanje: 'Zašto aparat ponekad zviždi?',
    odgovor:
      'Zviždanje (mikrofonija) najčešće znači da umetak ne prianja dobro ili da se nakupio ušni vosak. Oboje se brzo rješava — navratite u poslovnicu da provjerimo.',
  },
  {
    grupa: 'servis-i-garancija',
    pitanje: 'Koliko traje garancija na slušne aparate?',
    odgovor:
      'Garancija zavisi od proizvođača i modela aparata. Tačan rok garancije i uslovi servisa navedeni su u ponudi i dokumentaciji koju dobijate uz aparat.',
  },
  {
    grupa: 'servis-i-garancija',
    pitanje: 'Gdje mogu servisirati aparat?',
    odgovor:
      'U bilo kojoj našoj poslovnici — Sarajevo, Banja Luka, Gradiška, Bijeljina, Doboj, Brčko i Tuzla. Manje zahvate (čišćenje, filteri, cjevčice) obavimo odmah dok čekate.',
  },
  {
    grupa: 'servis-i-garancija',
    pitanje: 'Šta dok je moj aparat na popravci?',
    odgovor:
      'Ako popravka ne može biti završena odmah, osoblje će Vam objasniti očekivani rok i dostupne privremene opcije prema vrsti aparata i raspoloživosti u poslovnici.',
  },
  {
    grupa: 'servis-i-garancija',
    pitanje: 'Servisirate li aparate kupljene na drugom mjestu?',
    odgovor:
      'Možemo pregledati i aparate kupljene na drugom mjestu. Mogućnost servisa zavisi od proizvođača, modela, dostupnosti dijelova i stanja uređaja, a procjenu dobijate prije naplate.',
  },
]

let pitanjaAzurirano = 0
for (const p of PITANJA) {
  const data = { ...p, grupa: p.grupa as never, aktivno: true, naPocetnoj: p.naPocetnoj ?? false }
  const postoji = await payload.find({
    collection: 'cesta-pitanja',
    where: { pitanje: { equals: p.pitanje } },
    limit: 1,
  })

  if (postoji.totalDocs > 0) {
    await payload.update({ collection: 'cesta-pitanja', id: postoji.docs[0].id, data })
  } else {
    await payload.create({ collection: 'cesta-pitanja', data })
  }
  pitanjaAzurirano++
}
log(`Česta pitanja ažurirana: ${pitanjaAzurirano}`)

// ————————————————— 6. Objave (blog) —————————————————
const SARAJEVO_CLANAK_SLUG = 'svijet-sluha-sarajevo-slusni-aparati-provjera-sluha'
const URL_ZAKAZIVANJE_SARAJEVO = 'https://svijetsluha.com/zakazivanje?poslovnica=sarajevo'
const URL_ZAKAZIVANJE = 'https://svijetsluha.com/zakazivanje'
const URL_ONLINE_TEST = 'https://svijetsluha.com/online-test-sluha'
const URL_POSLOVNICE = 'https://svijetsluha.com/poslovnice'
const URL_SLUSNI_APARATI = 'https://svijetsluha.com/slusni-aparati'
const URL_POSLOVNICA_SARAJEVO = 'https://svijetsluha.com/poslovnice/sarajevo'
const URL_SERVIS = 'https://svijetsluha.com/servis-i-podrska'

const SARAJEVO_MEDIJI = [
  {
    kljuc: 'otvaranje',
    file: 'otvaranje-svijet-sluha-sarajevo-vrpca.webp',
    alt: 'Svečano otvaranje centra Svijet Sluha u Sarajevu',
  },
  {
    kljuc: 'partneri',
    file: 'audio-bm-svijet-sluha-partneri.webp',
    alt: 'Predstavnici Audio BM ispred zida brendova Bernafon, Unitron i Cochlear',
  },
  {
    kljuc: 'savjetovanje',
    file: 'savjetovanje-u-svijetu-sluha-sarajevo.webp',
    alt: 'Savjetovanje o slušnim aparatima u centru Svijet Sluha Sarajevo',
  },
  {
    kljuc: 'interijer',
    file: 'interijer-centra-svijet-sluha-sarajevo.webp',
    alt: 'Interijer centra Svijet Sluha Sarajevo sa izložbenim zonama Bernafon i Unitron',
  },
  {
    kljuc: 'liftLearn',
    file: 'lift-and-learn-slusni-aparati-sarajevo.webp',
    alt: 'Lift and Learn prezentacija slušnih aparata u centru Svijet Sluha Sarajevo',
  },
  {
    kljuc: 'experienceDemo',
    file: 'experience-room-demonstracija-sarajevo.webp',
    alt: 'Demonstracija slušanja u Experience Room prostoru Svijet Sluha Sarajevo',
  },
  {
    kljuc: 'experienceRoom',
    file: 'experience-room-svijet-sluha-sarajevo.webp',
    alt: 'Experience Room za isprobavanje slušnih aparata u realnim zvučnim situacijama',
  },
  {
    kljuc: 'ulaz',
    file: 'ulaz-svijet-sluha-sarajevo-unitic.webp',
    alt: 'Ulaz u Svijet Sluha Sarajevo u UNITIC neboderima',
  },
  {
    kljuc: 'izlozba',
    file: 'slusni-aparati-izlozba-sarajevo.webp',
    alt: 'Izloženi slušni aparati u centru Svijet Sluha Sarajevo',
  },
] as const

async function kreirajJavniWebpMedij(file: string, alt: string) {
  const filePath = path.join(ROOT, 'public', 'media', file)
  if (!existsSync(filePath)) return null

  const meta = await sharp(filePath).metadata()
  const lqip = await sharp(filePath).resize(24).blur(1.5).webp({ quality: 30 }).toBuffer()
  const filesize = statSync(filePath).size

  return payload.create({
    collection: 'mediji',
    data: {
      alt,
      lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
      url: `/media/${file}`,
      thumbnailURL: `/media/${file}`,
      filename: file,
      mimeType: 'image/webp',
      filesize,
      width: meta.width,
      height: meta.height,
    },
  })
}

const sarajevoMediji: Record<(typeof SARAJEVO_MEDIJI)[number]['kljuc'], number> = {} as never
for (const m of SARAJEVO_MEDIJI) {
  const postoji = await payload.find({
    collection: 'mediji',
    where: { alt: { equals: m.alt } },
    limit: 1,
    depth: 0,
  })
  if (postoji.totalDocs > 0) {
    sarajevoMediji[m.kljuc] = postoji.docs[0].id as number
    continue
  }

  const medij = await kreirajJavniWebpMedij(m.file, m.alt)
  if (!medij) {
    log(`! [MISSING_ASSET] Sarajevo članak nema sliku: ${m.file}`)
    continue
  }

  sarajevoMediji[m.kljuc] = medij.id as number
}

const SAVJETI_MEDIJI = [
  {
    kljuc: 'prviZnakovi',
    file: 'prvi-znakovi-slabljenja-sluha-tv-razgovor.webp',
    alt: 'Stariji muškarac pojačava televizor dok razgovara sa članom porodice',
  },
  {
    kljuc: 'odrzavanjeAparata',
    file: 'odrzavanje-slusnog-aparata-savjeti.webp',
    alt: 'Slušni aparat, krpica za čišćenje, četkica, baterije i kutija za odlaganje',
  },
] as const

const savjetiMediji: Partial<Record<(typeof SAVJETI_MEDIJI)[number]['kljuc'], number>> = {}
for (const m of SAVJETI_MEDIJI) {
  const postoji = await payload.find({
    collection: 'mediji',
    where: { alt: { equals: m.alt } },
    limit: 1,
    depth: 0,
  })
  if (postoji.totalDocs > 0) {
    savjetiMediji[m.kljuc] = postoji.docs[0].id as number
    continue
  }

  const medij = await kreirajJavniWebpMedij(m.file, m.alt)
  if (!medij) {
    log(`! [MISSING_ASSET] Savjeti članak nema sliku: ${m.file}`)
    continue
  }

  savjetiMediji[m.kljuc] = medij.id as number
}

for (const slug of UKLONJENI_SLUGOVI_OBJAVA) {
  const postojece = await payload.find({
    collection: 'objave',
    where: { slug: { equals: slug } },
    limit: 50,
    depth: 0,
  })

  for (const objava of postojece.docs) {
    await payload.delete({ collection: 'objave', id: objava.id })
    log(`Objava uklonjena: ${slug}`)
  }
}

type ObjavaSeed = {
  naslov: string
  slug: string
  stariSlug?: string
  kategorija: 'savjeti' | 'novosti' | 'sarajevo'
  izvod: string
  naslovnaSlika?: number
  seoNaslov?: string
  seoOpis?: string
  azurirajUvijek?: boolean
  sadrzaj: ReturnType<typeof dokument>
}

const OBJAVE: ObjavaSeed[] = [
  {
    naslov: 'Kako prepoznati prve znakove slabljenja sluha',
    slug: 'prvi-znakovi-slabljenja-sluha',
    kategorija: 'savjeti',
    azurirajUvijek: true,
    izvod:
      'Pojačavate TV, često tražite da se ponovi ili teško pratite razgovor u buci? Ovo su prvi znakovi slabljenja sluha i kada zakazati provjeru.',
    seoNaslov: 'Prvi znakovi slabljenja sluha: kada provjeriti sluh',
    seoOpis:
      'Pojačavate TV, često tražite ponavljanje ili teško pratite razgovor u buci? Saznajte prve znakove slabljenja sluha i kada zakazati provjeru.',
    naslovnaSlika: savjetiMediji.prviZnakovi,
    sadrzaj: dokument(
      paragraf(
        tekst('Kratak odgovor: ', true),
        'prvi znakovi slabljenja sluha najčešće su pojačavanje televizora, često traženje da se ponovi, teže razumijevanje govora u buci, naporni telefonski razgovori i osjećaj da drugi govore tiho ili nerazgovijetno.',
      ),
      paragraf(
        'Sluh obično ne oslabi preko noći. Promjene često dolaze postepeno, pa ih porodica, kolege ili prijatelji primijete prije osobe kojoj sluh slabi. Zato je važno obratiti pažnju na svakodnevne situacije, a ne samo na to da li nešto „čujete".',
      ),
      naslov('7 ranih znakova slabljenja sluha'),
      lista([
        [tekst('TV, radio ili telefon su sve glasniji. ', true), tekst('Ukućani komentarišu da je zvuk preglasan, dok Vama djeluje normalno.')],
        [tekst('Često pitate „molim?" ili „šta?". ', true), tekst('Posebno kada sagovornik govori tiše, brže ili iz druge prostorije.')],
        [tekst('Razgovor u buci postaje naporan. ', true), tekst('Restoran, kafić, porodično slavlje ili sastanak traže više koncentracije nego ranije.')],
        [tekst('Lakše čujete glas nego riječi. ', true), tekst('Čujete da neko govori, ali ne razumijete jasno svaku riječ.')],
        [tekst('Telefonski razgovori su teži. ', true), tekst('Bez gledanja u lice sagovornika teže pratite šta je rečeno.')],
        [tekst('Visoki zvukovi nestaju prvi. ', true), tekst('Zvono na vratima, cvrkut ptica, dječiji glasovi ili pojedini suglasnici mogu postati manje jasni.')],
        [tekst('Umor nakon razgovora je veći. ', true), tekst('Mozak ulaže više napora da popuni ono što uho ne prenese jasno.')],
      ]),
      naslov('Brzi samopregled: kada vrijedi provjeriti sluh'),
      paragraf('Ako se prepoznajete u dvije ili više stavki, provjera sluha je razuman sljedeći korak:'),
      lista([
        ['pojačavate televizor više nego ranije'],
        ['izbjegavate bučna mjesta jer razgovor postaje težak'],
        ['porodica Vam češće govori da ne čujete dobro'],
        ['razgovori preko telefona traže mnogo koncentracije'],
        ['imate osjećaj da ljudi mumlaju ili govore nerazgovijetno'],
      ]),
      paragraf(
        'Možete početi i od ',
        link('online testa sluha', URL_ONLINE_TEST, 'prvi-znakovi-online-test'),
        ', ali online test je samo orijentacija. Za jasniju sliku potreban je razgovor sa stručnim osobljem i provjera sluha u kontrolisanim uslovima.',
      ),
      naslov('Zašto je rana provjera važna'),
      paragraf(
        'Kada se sluh slabije koristi, razgovori mogu postati zamorni, a osoba se nesvjesno povlači iz društvenih situacija. Ranija provjera pomaže da se na vrijeme razumije šta se dešava i da se, ako je potrebno, lakše planira sljedeći korak.',
      ),
      paragraf(
        'U poslovnicama Svijet Sluha možete zakazati besplatnu provjeru sluha u Sarajevu, Banjoj Luci, Gradišci, Bijeljini, Doboju, Brčkom i Tuzli, prema dostupnim terminima.',
      ),
      paragraf(link('Pronađite najbližu poslovnicu', URL_POSLOVNICE, 'prvi-znakovi-poslovnice')),
      paragraf(link('Zakažite besplatnu provjeru sluha', URL_ZAKAZIVANJE, 'prvi-znakovi-zakazivanje')),
      naslov('Kada se obratiti ljekaru ili ORL specijalisti'),
      paragraf(
        'Besplatna provjera sluha je korisna za postepene promjene, ali nije zamjena za medicinski pregled. Ako je sluh naglo oslabio, posebno na jednom uhu, ili imate bol, iscjedak iz uha, vrtoglavicu, nagli šum ili osjećaj pritiska, obratite se ljekaru ili ORL specijalisti.',
      ),
      naslov('Najčešća pitanja'),
      naslov('Da li slabljenje sluha uvijek znači da trebam slušni aparat?', 'h3'),
      paragraf(
        'Ne uvijek. Prvo je potrebno provjeriti sluh i razgovarati o svakodnevnim poteškoćama. Tek nakon toga se može govoriti o tome da li je potreban slušni aparat, praćenje, dodatna obrada ili savjet ljekara.',
      ),
      naslov('Da li online test može zamijeniti provjeru sluha?', 'h3'),
      paragraf(
        'Online test može pomoći da odlučite da li vrijedi doći na provjeru, ali ne zamjenjuje stručnu procjenu, audiometrijsko testiranje niti medicinski pregled kada postoje simptomi koji zahtijevaju ljekara.',
      ),
      naslov('Koliko traje provjera sluha?', 'h3'),
      paragraf(
        'Uobičajena provjera sluha i razgovor o rezultatima planiraju se tako da osoba dobije jasno objašnjenje, bez žurbe. Tačan tok zavisi od poslovnice i potreba korisnika.',
      ),
    ),
  },
  {
    naslov: 'Pet savjeta za duži vijek Vašeg slušnog aparata',
    slug: 'pet-savjeta-odrzavanje-slusnog-aparata',
    kategorija: 'savjeti',
    azurirajUvijek: true,
    izvod:
      'Pravilno održavanje slušnog aparata smanjuje kvarove, čuva jačinu zvuka i produžava vijek uređaja. Ovo je rutina koju vrijedi usvojiti.',
    seoNaslov: 'Održavanje slušnog aparata: 5 savjeta za duži vijek',
    seoOpis:
      'Kako čistiti i čuvati slušni aparat? Pet praktičnih savjeta za zaštitu od vlage, voska, vrućine i kvarova, uz servisnu podršku u BiH.',
    naslovnaSlika: savjetiMediji.odrzavanjeAparata,
    sadrzaj: dokument(
      paragraf(
        tekst('Kratak odgovor: ', true),
        'slušni aparat najduže traje kada ga držite suhim, čistite svaku večer, redovno mijenjate filtere i nastavke, čuvate ga od toplote i dolazite na servisne kontrole prije nego mali problem postane kvar.',
      ),
      paragraf(
        'Slušni aparat je mali elektronski uređaj koji radi satima svaki dan, često u kontaktu sa vlagom, prašinom, znojem i ušnim voskom. Dobra rutina održavanja čuva stabilan zvuk i smanjuje rizik od nepotrebnih popravki.',
      ),
      naslov('1. Čuvajte aparat od vlage'),
      paragraf(
        'Skinite aparat prije tuširanja, kupanja, plivanja, saune i nanošenja laka za kosu. Navečer ga ostavite na suhom i sigurnom mjestu, dalje od kupatila i direktne vlage.',
      ),
      paragraf(
        'Ako koristite aparat na baterije, otvorite ležište baterije preko noći. Ako koristite punjivi aparat, punite ga prema uputstvu koje ste dobili uz uređaj.',
      ),
      naslov('2. Očistite ga svaku večer'),
      paragraf(
        'Mekom suhom krpicom obrišite kućište aparata. Ako imate četkicu ili alat za čišćenje, nježno uklonite vidljivu nečistoću oko otvora mikrofona, nastavka ili zvučnika.',
      ),
      paragraf(
        'Ne koristite alkohol, vodu, sapun, vlažne maramice ili agresivna sredstva. Vlaga i hemikalije mogu oštetiti elektroniku, mikrofone i zaštitne filtere.',
      ),
      naslov('3. Mijenjajte filtere, kapice i cjevčice na vrijeme'),
      paragraf(
        'Ušni vosak je jedan od najčešćih razloga za slabiji zvuk, prekidanje ili zviždanje aparata. Filteri i nastavci služe da zaštite osjetljive dijelove uređaja, ali se vremenom zapune.',
      ),
      paragraf('Vrijeme je za provjeru filtera ili nastavka ako:'),
      lista([
        ['zvuk je tiši nego inače'],
        ['aparat povremeno prekida'],
        ['čuje se zviždanje koje ranije nije bilo prisutno'],
        ['vidi se nakupljen vosak ili nečistoća'],
        ['nastavak ne stoji udobno kao ranije'],
      ]),
      naslov('4. Ne ostavljajte aparat na vrućini'),
      paragraf(
        'Ne ostavljajte slušni aparat na suncu, radijatoru, prozorskoj dasci ili u automobilu tokom ljeta. Visoka temperatura može oštetiti bateriju, plastiku, zvučnik i elektroniku.',
      ),
      paragraf(
        'Kada aparat ne nosite, držite ga u kutiji ili punjaču, na sigurnom mjestu i van domašaja male djece.',
      ),
      naslov('5. Dođite na kontrolu prije kvara'),
      paragraf(
        'Ako aparat slabije radi, zviždi, ne puni se uredno ili više ne čujete jasno kao ranije, nemojte čekati da potpuno prestane raditi. U poslovnici se mogu provjeriti filteri, nastavci, cjevčice, punjenje i osnovno podešavanje.',
      ),
      paragraf(
        'Servisnu podršku i savjet možete dobiti u poslovnicama Svijet Sluha širom Bosne i Hercegovine, uključujući Sarajevo, Banju Luku, Gradišku, Bijeljinu, Doboj, Brčko i Tuzlu.',
      ),
      paragraf(link('Pogledajte servis i podršku', URL_SERVIS, 'odrzavanje-servis')),
      paragraf(link('Pronađite najbližu poslovnicu', URL_POSLOVNICE, 'odrzavanje-poslovnice')),
      naslov('Šta ponijeti na kontrolu aparata'),
      lista([
        ['slušni aparat ili oba aparata ako ih nosite u paru'],
        ['punjač ili baterije koje trenutno koristite'],
        ['nastavke, kutiju i dodatnu opremu koju ste dobili uz aparat'],
        ['kratak opis problema: kada se javlja, da li je stalno ili povremeno, i u kojim situacijama smeta'],
      ]),
      naslov('Najčešća pitanja'),
      naslov('Koliko često čistiti slušni aparat?', 'h3'),
      paragraf(
        'Najbolje je obrisati aparat svaku večer. Detaljnije čišćenje, zamjena filtera i provjera nastavaka zavise od modela aparata i količine ušnog voska.',
      ),
      naslov('Šta ako se aparat smoči?', 'h3'),
      paragraf(
        'Isključite ga, izvadite bateriju ako je model na baterije i ostavite ga da se osuši. Ne koristite fen, radijator ili direktnu vrućinu. Ako nakon toga ne radi normalno, donesite ga na provjeru.',
      ),
      naslov('Zašto aparat zviždi?', 'h3'),
      paragraf(
        'Zviždanje može nastati zbog nakupljenog ušnog voska, zapušenog filtera, lošeg položaja nastavka ili promjene u pristajanju aparata. Najsigurnije je provjeriti aparat i uho u poslovnici ili kod stručne osobe.',
      ),
    ),
  },
  {
    naslov: 'Svijet Sluha u Sarajevu: slušni aparati, Experience Room i besplatna provjera sluha',
    slug: SARAJEVO_CLANAK_SLUG,
    stariSlug: 'otvaranje-poslovnice-sarajevo',
    kategorija: 'sarajevo',
    izvod:
      'Posjetite Svijet Sluha u Sarajevu, Fra Anđela Zvizdovića 1 u UNITIC-u. Istražite slušne aparate, Experience Room i zakažite besplatnu provjeru sluha.',
    naslovnaSlika: sarajevoMediji.ulaz,
    seoNaslov: 'Svijet Sluha Sarajevo: slušni aparati i provjera sluha',
    seoOpis:
      'Posjetite Svijet Sluha u Sarajevu, Fra Anđela Zvizdovića 1 u UNITIC-u. Istražite slušne aparate, Experience Room i zakažite besplatnu provjeru sluha.',
    sadrzaj: dokument(
      paragraf(
        tekst('Svijet Sluha', true),
        ' otvoren je u Sarajevu kao specijalizovani centar za slušnu akustiku, provjeru sluha, savjetovanje i odabir slušnih aparata. Centar se nalazi na adresi ',
        tekst('Fra Anđela Zvizdovića 1, UNITIC neboderi', true),
        ', gdje građani Sarajeva mogu dobiti stručne informacije, isprobati odabrane modele slušnih aparata i obaviti besplatnu provjeru sluha.',
      ),
      paragraf(
        'Iza centra stoji kompanija ',
        tekst('Audio BM', true),
        ', regionalno prepoznata u oblasti slušne akustike sa više od tri decenije iskustva.',
      ),
      paragraf(link('Zakažite besplatnu provjeru sluha', URL_ZAKAZIVANJE_SARAJEVO, 'sarajevo-link-zakazivanje-uvod')),
      slika(sarajevoMediji.interijer, 'sarajevo-upload-interijer'),
      paragraf(
        'Interijer centra je uređen tako da posjetioci mogu mirno razgovarati, pregledati modele i razumjeti kako različita rješenja odgovaraju njihovim svakodnevnim potrebama.',
      ),
      naslov('Šta možete očekivati u Svijetu Sluha u Sarajevu?'),
      paragraf(
        'Svijet Sluha osmišljen je kao mjesto gdje osoba ne dobija samo tehničke informacije o slušnim aparatima, nego i priliku da bolje razumije vlastite potrebe i situacije u kojima joj je sluh najvažniji.',
      ),
      lista([
        ['besplatna provjera sluha'],
        ['savjetovanje o izboru slušnog aparata'],
        ['demonstracija i isprobavanje odabranih uređaja'],
        ['podrška pri prilagođavanju slušnog aparata'],
        ['informacije o održavanju, podešavanju i korištenju uređaja'],
        ['modeli slušnih aparata brendova Bernafon i Unitron, prema dostupnosti'],
      ]),
      paragraf(
        'Za osobe koje primjećuju da teže prate razgovor, pojačavaju televizor, imaju poteškoće u bučnim prostorima ili često traže od drugih da ponove rečeno, provjera sluha može biti koristan prvi korak.',
      ),
      slika(sarajevoMediji.savjetovanje, 'sarajevo-upload-savjetovanje'),
      naslov('Experience Room: kako slušni aparat može zvučati u stvarnom životu'),
      paragraf(
        'Jedna od posebnosti centra je ',
        tekst('Experience Room', true),
        ' — iskustvena soba u kojoj se može doživjeti kako različite svakodnevne situacije utiču na slušanje i komunikaciju.',
      ),
      paragraf('Za razliku od standardne procjene sluha, Experience Room stavlja fokus na realne životne scenarije, kao što su:'),
      lista([
        ['razgovor u dnevnoj sobi'],
        ['komunikacija na poslu'],
        ['kupovina u prodavnici'],
        ['razgovor u restoranu ili kafiću'],
        ['buka javnog prijevoza'],
        ['razgovor sa porodicom u prostoru gdje govori više osoba'],
      ]),
      slika(sarajevoMediji.experienceRoom, 'sarajevo-upload-experience-room'),
      paragraf(
        'U kontrolisanim akustičnim uslovima korisnik može bolje razumjeti kako određeni slušni aparat funkcioniše u konkretnim situacijama koje su mu važne.',
      ),
      paragraf(
        'Ovaj pristup može olakšati izbor uređaja jer ne živimo svi u istom zvučnom okruženju. Nekome je prioritet razgovor s porodicom, nekome sastanci na poslu, a nekome sigurnije praćenje zvukova u gradu ili javnom prijevozu.',
      ),
      slika(sarajevoMediji.experienceDemo, 'sarajevo-upload-experience-demo'),
      naslov('Isprobavanje slušnih aparata prije odluke'),
      paragraf(
        'Odabir slušnog aparata nije samo pitanje glasnoće. Važni su svakodnevne navike, okruženje, način komunikacije, udobnost, diskretnost, rukovanje uređajem i funkcije koje korisniku zaista trebaju.',
      ),
      paragraf(
        'U Svijetu Sluha korisnici mogu dobiti savjetovanje i upoznati se s opcijama koje odgovaraju njihovim potrebama. Cilj je da se odabir slušnog aparata zasniva na praktičnom iskustvu i stručnoj procjeni, a ne samo na tehničkim specifikacijama.',
      ),
      paragraf(link('Pregledajte slušne aparate', URL_SLUSNI_APARATI, 'sarajevo-link-slusni-aparati')),
      naslov('Lift & Learn: informacije o slušnim aparatima na jednostavan način'),
      paragraf(
        'U centru je dostupna i ',
        tekst('Lift & Learn', true),
        ' prezentacija slušnih aparata. Dovoljno je uzeti određeni model u ruku kako bi se na ekranu prikazale osnovne informacije o uređaju.',
      ),
      paragraf(
        'Ovaj način prezentacije može pomoći posjetiocima da jednostavnije uporede modele i funkcije. Naravno, stručno osoblje ostaje dostupno za dodatna pitanja, objašnjenja i demonstracije.',
      ),
      slika(sarajevoMediji.liftLearn, 'sarajevo-upload-lift-learn'),
      naslov('Slušni aparati u Sarajevu: Bernafon i Unitron'),
      paragraf(
        'U ponudi Svijeta Sluha dostupni su modeli slušnih aparata proizvođača ',
        tekst('Bernafon', true),
        ' i ',
        tekst('Unitron', true),
        '. Prilikom savjetovanja važno je uzeti u obzir individualne potrebe osobe, rezultate provjere sluha, svakodnevno okruženje i praktične zahtjeve korisnika.',
      ),
      paragraf(
        'Neki korisnici traže diskretan uređaj, drugi punjivu opciju, lakše upravljanje, bolju komunikaciju u bučnim prostorijama ili povezivost s telefonom. Pravi izbor zavisi od osobe i njenog načina života.',
      ),
      slika(sarajevoMediji.izlozba, 'sarajevo-upload-izlozba'),
      naslov('Besplatna provjera sluha u Sarajevu'),
      paragraf('Građani Sarajeva koji primjećuju promjene u kvalitetu sluha mogu posjetiti Svijet Sluha i obaviti besplatnu provjeru sluha.'),
      paragraf('Provjera sluha može biti posebno korisna ako:'),
      lista([
        ['često tražite od drugih da ponove rečeno'],
        ['razgovori u buci postaju naporni'],
        ['imate osjećaj da drugi govore tiho ili nerazgovijetno'],
        ['pojačavate televizor više nego ranije'],
        ['teže pratite razgovor u društvu'],
        ['članovi porodice primjećuju promjene u vašem sluhu'],
      ]),
      paragraf(
        'Provjera sluha je informativan korak. Za medicinsku dijagnozu, nagle promjene sluha, bol, iscjedak iz uha, vrtoglavicu ili druge izražene simptome, potrebno je obratiti se ljekaru ili ORL specijalisti.',
      ),
      paragraf(link('Zakažite provjeru sluha u Sarajevu', URL_ZAKAZIVANJE_SARAJEVO, 'sarajevo-link-zakazivanje-sredina')),
      naslov('Gdje se nalazi Svijet Sluha u Sarajevu?'),
      paragraf(tekst('Svijet Sluha Sarajevo', true)),
      paragraf('Fra Anđela Zvizdovića 1, UNITIC neboderi, Sarajevo, Bosna i Hercegovina'),
      paragraf(tekst('Radno vrijeme:', true)),
      lista([
        ['ponedjeljak: 08:00-16:00'],
        ['utorak: 08:00-16:00'],
        ['srijeda: 08:00-18:00'],
        ['četvrtak: 08:00-16:00'],
        ['petak: 08:00-16:00'],
      ]),
      paragraf(link('Pronađite Svijet Sluha u Sarajevu', URL_POSLOVNICA_SARAJEVO, 'sarajevo-link-poslovnica')),
      slika(sarajevoMediji.otvaranje, 'sarajevo-upload-otvaranje'),
      slika(sarajevoMediji.partneri, 'sarajevo-upload-partneri'),
      naslov('Najčešća pitanja'),
      naslov('Gdje mogu uraditi provjeru sluha u Sarajevu?', 'h3'),
      paragraf('Besplatnu provjeru sluha možete obaviti u centru Svijet Sluha na adresi Fra Anđela Zvizdovića 1, u UNITIC neboderima u Sarajevu.'),
      naslov('Šta je Experience Room?', 'h3'),
      paragraf(
        'Experience Room je prostor u kojem se simuliraju svakodnevne zvučne situacije, poput razgovora kod kuće, na poslu, u prodavnici ili u javnom prijevozu. Cilj je da korisnik bolje razumije kako određeni slušni aparat može funkcionisati u realnim okolnostima.',
      ),
      naslov('Mogu li isprobati slušni aparat prije konačne odluke?', 'h3'),
      paragraf(
        'U Svijetu Sluha možete dobiti savjetovanje i upoznati se s odabranim opcijama slušnih aparata. Dostupnost demonstracije i pojedinih modela treba potvrditi direktno sa poslovnicom.',
      ),
      naslov('Da li je provjera sluha besplatna?', 'h3'),
      paragraf('Prema trenutnoj ponudi centra, besplatna provjera sluha dostupna je građanima Sarajeva. Preporučuje se prethodno zakazivanje termina.'),
      naslov('Koje je radno vrijeme Svijeta Sluha u Sarajevu?', 'h3'),
      paragraf('Centar radi ponedjeljkom, utorkom, četvrtkom i petkom od 08:00 do 16:00, a srijedom od 08:00 do 18:00.'),
      naslov('Koje brendove slušnih aparata mogu pronaći u Svijetu Sluha?', 'h3'),
      paragraf('U ponudi su modeli slušnih aparata proizvođača Bernafon i Unitron, prema dostupnosti i individualnim potrebama korisnika.'),
      naslov('Zakažite termin u Svijetu Sluha'),
      paragraf(
        'Ako primjećujete promjene sluha ili želite saznati koje opcije slušnih aparata mogu odgovarati vašim potrebama, posjetite Svijet Sluha u Sarajevu.',
      ),
      paragraf(link('Zakažite besplatnu provjeru sluha', URL_ZAKAZIVANJE_SARAJEVO, 'sarajevo-link-zakazivanje-kraj')),
      paragraf(link('Kontaktirajte poslovnicu Sarajevo', URL_POSLOVNICA_SARAJEVO, 'sarajevo-link-kontakt-kraj')),
    ),
  },
]

for (const o of OBJAVE) {
  const postoji = await payload.find({
    collection: 'objave',
    where: { slug: { equals: o.slug } },
    limit: 1,
    draft: false,
  })

  const stariSlug = 'stariSlug' in o ? o.stariSlug : null
  const staraObjava = stariSlug
    ? await payload.find({
        collection: 'objave',
        where: { slug: { equals: stariSlug } },
        limit: 1,
        draft: false,
      })
    : null

  const data = {
    naslov: o.naslov,
    slug: o.slug,
    kategorija: o.kategorija as never,
    izvod: o.izvod,
    ...('naslovnaSlika' in o && o.naslovnaSlika ? { naslovnaSlika: o.naslovnaSlika } : {}),
    sadrzaj: o.sadrzaj as never,
    datumObjave: '2026-06-28T00:00:00.000Z',
    seo: {
      naslov: (o.seoNaslov ?? o.naslov).slice(0, 60),
      opis: (o.seoOpis ?? o.izvod).slice(0, 155),
      ...('naslovnaSlika' in o && o.naslovnaSlika ? { slika: o.naslovnaSlika } : {}),
    },
    _status: 'published' as const,
  }

  if (postoji.totalDocs > 0) {
    if ('azurirajUvijek' in o && o.azurirajUvijek) {
      await payload.update({
        collection: 'objave',
        id: postoji.docs[0].id,
        data,
      })
      log(`Objava ažurirana: ${o.naslov}`)
    }
    continue
  }

  if (staraObjava && staraObjava.totalDocs > 0) {
    await payload.update({
      collection: 'objave',
      id: staraObjava.docs[0].id,
      data,
    })
    log(`Objava ažurirana: ${o.naslov}`)
    continue
  }

  await payload.create({
    collection: 'objave',
    data,
  })
  log(`Objava: ${o.naslov}`)
}

// ————————————————— 7. Recenzije (primjeri — NEODOBRENE dok ih vlasnik ne zamijeni stvarnim) —————————————————
const postojeceRecenzije = await payload.find({ collection: 'recenzije', limit: 1 })
if (postojeceRecenzije.totalDocs === 0) {
  await payload.create({
    collection: 'recenzije',
    data: {
      ime: 'Interna test recenzija',
      tekst:
        'Primjer recenzije. Zamijenite stvarnim iskustvom Vašeg korisnika (uz njegovu saglasnost) i označite „Odobreno za prikaz". Neodobrene recenzije se ne prikazuju na stranici.',
      ocjena: 5,
      odobreno: false,
      istaknuta: false,
    },
  })
  log('Recenzija-primjer kreirana (neodobrena)')
}

// ————————————————— 8. Globali —————————————————
await payload.updateGlobal({
  slug: 'navigacija',
  data: {
    glavniMeni: [
      { oznaka: 'Slušni aparati', putanja: '/slusni-aparati' },
      { oznaka: 'Usluge', putanja: '/usluge' },
      { oznaka: 'Proizvodi', putanja: '/proizvodi' },
      { oznaka: 'Poslovnice', putanja: '/poslovnice' },
      { oznaka: 'Cijene', putanja: '/cijene-i-finansiranje' },
      { oznaka: 'Savjeti', putanja: '/savjeti' },
      { oznaka: 'Kontakt', putanja: '/kontakt' },
    ],
    podnozje: [
      {
        naslov: 'Audio BM',
        linkovi: [
          { oznaka: 'O nama', putanja: '/o-nama' },
          { oznaka: 'Naš tim', putanja: '/tim' },
          { oznaka: 'Akcije', putanja: '/akcije' },
          { oznaka: 'Česta pitanja', putanja: '/cesta-pitanja' },
          { oznaka: 'Zakažite termin', putanja: '/zakazivanje' },
        ],
      },
    ],
  },
})

await payload.updateGlobal({
  slug: 'podesavanja',
  data: {
    nazivSajta: 'Audio BM',
    telefonGlavni: '051 218 781',
    emailGlavni: GLAVNI_EMAIL,
    seoNaslov: 'Audio BM — Slušni aparati i besplatna provjera sluha',
    seoOpis:
      'Više od 30 godina povjerenja. Besplatna provjera sluha u Sarajevu, Banjoj Luci, Gradišci, Bijeljini, Doboju, Brčkom i Tuzli.',
    emailZaUpite: GLAVNI_EMAIL,
  },
})

await payload.updateGlobal({
  slug: 'pocetna',
  data: {
    hero: {
      naslov: 'Besplatna provjera sluha — više od 30 godina povjerenja',
      podnaslov:
        'Stručni tim, vrhunski slušni aparati i strpljiv pristup — u poslovnicama širom Bosne i Hercegovine.',
      ctaTekst: 'Zakažite besplatnu provjeru sluha',
    },
    sarajevoBaner: {
      aktivan: true,
      tekst: 'Otvorili smo poslovnicu u Sarajevu — UNITIC, Fra Anđela Zvizdovića 1',
      link: '/poslovnice/sarajevo',
    },
    povjerenje: {
      godineRada: 32,
      statistike: [],
    },
  },
})
log('Globali postavljeni')

log('Seed završen ✔')
process.exit(0)
