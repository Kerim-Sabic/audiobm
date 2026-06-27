/**
 * Seed: puni CMS stvarnim podacima — provjerene lokacije, katalog iz
 * products-manifest.json (sa slikama), usluge, česta pitanja, navigacija.
 * Pokretanje: pnpm seed   (idempotentno — postojeći zapisi se preskaču)
 */
import { getPayload } from 'payload'
import path from 'node:path'
import { readFileSync, existsSync } from 'node:fs'
import config from '../src/payload.config'
import {
  kategorijaProizvoda,
  nacinProdaje,
  pouzdanaCijena,
  tipAparata,
  type ManifestProduct,
} from '../src/lib/catalog'
import { dokument, paragraf, naslov, lista, tekst, izHtml } from '../src/lib/lexical'

const ROOT = path.resolve(process.cwd())

const payload = await getPayload({ config })
const log = (m: string) => payload.logger.info(`[seed] ${m}`)

// ————————————————— 1. Vlasnički korisnik —————————————————
const postojeciKorisnici = await payload.find({ collection: 'korisnici', limit: 1 })
if (postojeciKorisnici.totalDocs === 0) {
  // Kredencijali iz env (SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD) — bez stvarne lozinke u repou.
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@svijetsluha.com'
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

const POSLOVNICE: PoslovnicaSeed[] = [
  {
    naziv: 'Audio BM Sarajevo',
    slug: 'sarajevo',
    grad: 'Sarajevo',
    adresa: '[ADRESA_PLACEHOLDER]',
    geoSirina: 43.8563,
    geoDuzina: 18.4131,
    telefoni: [{ oznaka: 'Telefon', broj: '[TELEFON_PLACEHOLDER]' }],
    emaili: [],
    novaPoslovnica: true,
    redoslijed: 1,
    opis:
      'Naša najnovija poslovnica — od sada smo dostupni i u Sarajevu. Dobro došli na besplatnu provjeru sluha!',
  },
  {
    naziv: 'Audio BM Banja Luka',
    slug: 'banja-luka',
    grad: 'Banja Luka',
    adresa: 'Dr. Jovana Raškovića 7',
    geoSirina: 44.7722,
    geoDuzina: 17.191,
    telefoni: [{ oznaka: 'Telefon', broj: '051 218 781' }],
    emaili: [{ email: 'banjaluka@audiobm.ba' }],
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
    emaili: [{ email: 'gradiska@audiobm.ba' }],
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
    emaili: [{ email: 'bijeljina@audiobm.ba' }],
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
    emaili: [{ email: 'doboj@audiobm.ba' }],
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
    emaili: [{ email: 'brcko@audiobm.ba' }],
    redoslijed: 6,
    opis: 'Poslovnica u Brčkom — provjera sluha i kompletna ponuda slušnih aparata.',
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
}

const poslovniceIds: Record<string, number> = {}
for (const p of POSLOVNICE) {
  const postoji = await payload.find({
    collection: 'poslovnice',
    where: { slug: { equals: p.slug } },
    limit: 1,
    draft: false,
  })
  if (postoji.totalDocs > 0) {
    poslovniceIds[p.slug] = postoji.docs[0].id as number
    continue
  }
  const doc = await payload.create({
    collection: 'poslovnice',
    data: {
      ...p,
      aktivna: true,
      radnoVrijemePotvrdjeno: false, // staro „7–15h" je nepouzdano — [RADNO_VRIJEME_PLACEHOLDER]
      radnoVrijeme: [],
      googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `Audio BM ${p.adresa.startsWith('[') ? p.grad : p.adresa + ', ' + p.grad}`,
      )}`,
      seo: {
        naslov: `Audio BM ${p.grad} — slušni aparati i provjera sluha`,
        opis: `Audio BM poslovnica u ${LOKATIV[p.grad] ?? p.grad} — besplatna provjera sluha, slušni aparati, baterije i servis.`,
      },
      _status: 'published',
    },
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
              cijenaNapomena: `[CIJENA_PLACEHOLDER] Stara stranica navodi ${p.price} KM — vrijednost izgleda neispravno (vjerovatno ${(p.price! / 100).toFixed(2).replace('.', ',')} KM). Potrebna potvrda vlasnika.`,
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
        opis: 'Kvarove rješavamo u našem servisu. [POTVRDA_VLASNIKA: uslovi servisa i zamjenski aparat]',
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
  if (postoji.totalDocs > 0) continue
  await payload.create({
    collection: 'usluge',
    data: {
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
      _status: 'published',
    },
  })
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
      'Za besplatnu provjeru sluha kod nas uputnica nije potrebna — dovoljno je da dođete. Uputnica i medicinska dokumentacija trebaju tek ako kasnije želite ostvariti pravo na refundaciju kroz zdravstveno osiguranje. [POTVRDA_VLASNIKA]',
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
      'Cijena zavisi od tehnološkog nivoa i tipa aparata. Tačnu ponudu, prilagođenu Vašem sluhu i budžetu, dobijate na besplatnom savjetovanju. Okvirne raspone po klasama objavljujemo na stranici „Cijene i finansiranje". [CIJENA_PLACEHOLDER]',
  },
  {
    grupa: 'cijene-i-refundacija',
    pitanje: 'Da li zdravstveno osiguranje pokriva dio cijene?',
    odgovor:
      'U određenim slučajevima moguće je ostvariti pravo na refundaciju kroz fond zdravstvenog osiguranja. Postupak i iznosi se razlikuju — raspitajte se u našoj poslovnici, pomoći ćemo Vam oko dokumentacije. [POTVRDA_VLASNIKA]',
  },
  {
    grupa: 'cijene-i-refundacija',
    pitanje: 'Mogu li platiti na rate?',
    odgovor: '[POTVRDA_VLASNIKA: mogućnosti plaćanja na rate i uslovi]',
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
    odgovor: '[POTVRDA_VLASNIKA: trajanje garancije po brendovima i klasama aparata]',
  },
  {
    grupa: 'servis-i-garancija',
    pitanje: 'Gdje mogu servisirati aparat?',
    odgovor:
      'U bilo kojoj našoj poslovnici — Sarajevo, Banja Luka, Gradiška, Bijeljina, Doboj i Brčko. Manje zahvate (čišćenje, filteri, cjevčice) obavimo odmah dok čekate.',
  },
  {
    grupa: 'servis-i-garancija',
    pitanje: 'Šta dok je moj aparat na popravci?',
    odgovor: '[POTVRDA_VLASNIKA: da li se daje zamjenski aparat za vrijeme servisa]',
  },
  {
    grupa: 'servis-i-garancija',
    pitanje: 'Servisirate li aparate kupljene na drugom mjestu?',
    odgovor: '[POTVRDA_VLASNIKA: servis aparata kupljenih van Audio BM mreže]',
  },
]

const postojecaPitanja = await payload.find({ collection: 'cesta-pitanja', limit: 1 })
if (postojecaPitanja.totalDocs === 0) {
  for (const p of PITANJA) {
    await payload.create({
      collection: 'cesta-pitanja',
      data: { ...p, grupa: p.grupa as never, aktivno: true, naPocetnoj: p.naPocetnoj ?? false },
    })
  }
  log(`Česta pitanja: ${PITANJA.length}`)
} else {
  log('Česta pitanja već postoje — preskačem')
}

// ————————————————— 6. Objave (blog) —————————————————
const OBJAVE = [
  {
    naslov: 'Kako prepoznati prve znakove slabljenja sluha',
    slug: 'prvi-znakovi-slabljenja-sluha',
    kategorija: 'savjeti',
    izvod:
      'Slabljenje sluha dolazi postepeno, pa ga je lako previdjeti. Ovo su znakovi na koje treba obratiti pažnju — kod sebe i kod najbližih.',
    sadrzaj: dokument(
      paragraf(
        'Sluh najčešće ne oslabi preko noći. Promjene dolaze polako, mjesecima i godinama, pa ih osoba sama posljednja primijeti. Porodica obično primijeti prva.',
      ),
      naslov('Najčešći znakovi'),
      lista([
        [tekst('Televizor je sve glasniji', true), tekst(' — ukućani komentarišu da je preglasno.')],
        [tekst('Često pitate „molim?"', true), tekst(' — naročito kad govori više ljudi odjednom.')],
        [tekst('Teško pratite razgovor u kafani ili na slavlju', true), tekst(' — buka u pozadini „proguta" govor.')],
        [tekst('Zvona i ptice se više ne čuju', true), tekst(' — visoki tonovi nestaju prvi.')],
        [tekst('Telefonski razgovori postaju naporni', true), tekst(' — bez gledanja u sagovornika teže razumijete.')],
      ]),
      naslov('Šta učiniti?'),
      paragraf(
        'Najjednostavniji prvi korak je besplatna provjera sluha. Traje pola sata, potpuno je bezbolna i odmah znate na čemu ste. Ako je sluh uredan — mirni ste. Ako nije — što ranije reagujete, lakše se mozak navikne na pomoć.',
      ),
    ),
  },
  {
    naslov: 'Pet savjeta za duži vijek Vašeg slušnog aparata',
    slug: 'pet-savjeta-odrzavanje-slusnog-aparata',
    kategorija: 'savjeti',
    izvod:
      'Slušni aparat je mali, precizan uređaj koji radi po cijeli dan. Uz ovih pet navika služiće Vas godinama.',
    sadrzaj: dokument(
      lista([
        [tekst('1. Suho je zakon. ', true), tekst('Skinite aparat prije tuširanja i plivanja, a uveče ga ostavite na suhom mjestu — ne u kupatilu.')],
        [tekst('2. Čistite ga svaku večer. ', true), tekst('Mekom suhom krpicom obrišite cijeli aparat. Bez alkohola i vlažnih maramica.')],
        [tekst('3. Mijenjajte filtere. ', true), tekst('Filter štiti aparat od ušnog voska. Zamjena u našoj poslovnici traje par minuta.')],
        [tekst('4. Čuvajte ga od vrućine. ', true), tekst('Ne ostavljajte aparat na suncu, radijatoru ili u autu ljeti.')],
        [tekst('5. Dolazite na redovne kontrole. ', true), tekst('Dva puta godišnje provjerimo i fino podesimo aparat — besplatno.')],
      ]),
      paragraf('Imate pitanje o svom aparatu? Navratite u najbližu poslovnicu — rado ćemo pomoći.'),
    ),
  },
  {
    naslov: 'Audio BM stigao u Sarajevo — dobro došli!',
    slug: 'otvaranje-poslovnice-sarajevo',
    kategorija: 'sarajevo',
    izvod:
      'Nakon više od 30 godina rada, s ponosom otvaramo vrata naše prve poslovnice u Sarajevu. Zakažite besplatnu provjeru sluha već danas.',
    sadrzaj: dokument(
      paragraf(
        'S velikim zadovoljstvom obavještavamo da je Audio BM otvorio poslovnicu u Sarajevu — našu šestu u Bosni i Hercegovini.',
      ),
      paragraf('Adresa: ', tekst('[ADRESA_PLACEHOLDER]', true)),
      paragraf('Telefon: ', tekst('[TELEFON_PLACEHOLDER]', true)),
      paragraf('Radno vrijeme: ', tekst('[RADNO_VRIJEME_PLACEHOLDER]', true)),
      paragraf(
        'U novoj poslovnici Vas očekuje kompletna ponuda: besplatna provjera sluha, slušni aparati renomiranih brendova, baterije, pribor i servis.',
      ),
    ),
  },
] as const

for (const o of OBJAVE) {
  const postoji = await payload.find({
    collection: 'objave',
    where: { slug: { equals: o.slug } },
    limit: 1,
    draft: false,
  })
  if (postoji.totalDocs > 0) continue
  await payload.create({
    collection: 'objave',
    data: {
      naslov: o.naslov,
      slug: o.slug,
      kategorija: o.kategorija as never,
      izvod: o.izvod,
      sadrzaj: o.sadrzaj as never,
      datumObjave: new Date().toISOString(),
      seo: { naslov: o.naslov.slice(0, 60), opis: o.izvod.slice(0, 155) },
      _status: 'published',
    },
  })
  log(`Objava: ${o.naslov}`)
}

// ————————————————— 7. Recenzije (primjeri — NEODOBRENE dok ih vlasnik ne zamijeni stvarnim) —————————————————
const postojeceRecenzije = await payload.find({ collection: 'recenzije', limit: 1 })
if (postojeceRecenzije.totalDocs === 0) {
  await payload.create({
    collection: 'recenzije',
    data: {
      ime: '[RECENZIJA_PLACEHOLDER — unesite stvarno iskustvo korisnika]',
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
    emailGlavni: 'gradiska@audiobm.ba',
    seoNaslov: 'Audio BM — Slušni aparati i besplatna provjera sluha',
    seoOpis:
      'Više od 30 godina povjerenja. Besplatna provjera sluha u Sarajevu, Banjoj Luci, Gradišci, Bijeljini, Doboju i Brčkom.',
    emailZaUpite: 'svijetsluha@gmail.com',
  },
})

await payload.updateGlobal({
  slug: 'pocetna',
  data: {
    hero: {
      naslov: 'Besplatna provjera sluha — više od 30 godina povjerenja',
      podnaslov:
        'Stručni tim, vrhunski slušni aparati i strpljiv pristup — u šest gradova širom Bosne i Hercegovine.',
      ctaTekst: 'Zakažite besplatnu provjeru sluha',
    },
    sarajevoBaner: {
      aktivan: true,
      tekst: 'Otvorili smo poslovnicu u Sarajevu — [ADRESA_PLACEHOLDER]',
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
