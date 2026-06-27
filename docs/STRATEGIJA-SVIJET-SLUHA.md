# Svijet Sluha — Strategija i plan implementacije

> Cilj: pretvoriti postojeću Audio BM web stranicu u **svijetsluha.com** — brend koji je
> #1 na Google pretrazi za sluh u BiH, koji **AI asistenti (ChatGPT, Claude, Gemini,
> Perplexity, Google AI Overviews) preporučuju**, koji **pretvara posjetioce u kupce**, i
> koji **dokazivo prati svaki lead** tako da je tvojih 5% provizije neoboriv.

**Status:** nacrt za odobrenje · **Datum:** 2026-06-25

---

## 0. Odluke koje su potvrđene

| Pitanje | Odluka | Posljedica za rad |
|---|---|---|
| Odnos brendova | **Svijet Sluha** glavni brend, *„u saradnji s Audio BM"* potpis | Nasljeđujemo 30+ god. povjerenja, gradimo novo ime |
| Domena | **Novi start na svijetsluha.com** | Nema 301 migracije; ranking gradimo od nule → sadržaj i AEO su presudni |
| Praćenje provizije | **Da — gradimo ga** | UTM + „kako ste čuli za nas" + dashboard po izvoru |
| Prvi korak | **Ova strategija**, pa kod uz odobrenje | — |

---

## 1. Strateški uvid (zašto ovaj plan, a ne „samo SEO")

Stranica je **već tehnički jako dobra**: Next.js 16 SSR, JSON-LD (Organization,
LocalBusiness/MedicalBusiness po poslovnici, FAQ, Article), sitemap, robots, canonical,
OG/Twitter, PWA, Plausible. To je bolje od 90% konkurencije u regiji.

Zato poluga **nije** „izgraditi iznova". Poluga je četiri stvari, ovim redom važnosti:

1. **Zaštititi tvojih 5%** — bez dokaza o izvoru leada, provizija je na riječ. Ovo
   gradimo prvo jer je to tvoj novac.
2. **AEO/GEO** — pošto krećemo na novoj domeni bez ranking historije, *najbrži* put do
   prometa je da te AI asistenti i Google AI Overviews citiraju kao izvor. To se postiže
   strukturom podataka + jasnim, činjeničnim sadržajem, ne reklamom.
3. **Hook & konverzija** — sluh nije „uređaj", nego *ponovo čuti unuka*. Emotivni hook +
   uklanjanje trenja do zakazivanja.
4. **Rebrand** — čisto, centralizirano, da Google i AI razumiju „Svijet Sluha = brend,
   Audio BM = provajder s 30 god. iskustva".

---

## 2. FAZA 1 — Rebrand u „Svijet Sluha by Audio BM"

**Problem danas:** „Audio BM" je hardkodiran **~281 put u 62 fajla**. Mijenjati ručno =
greške i nekonzistentnost. Rješenje: **jedan izvor istine**.

### 2.1 Centralizacija brenda  `[M]`
Novi fajl `src/lib/brend.ts`:
```ts
export const BREND = {
  naziv: 'Svijet Sluha',
  potpis: 'u saradnji s Audio BM',
  provajder: 'Audio BM',
  provajderOd: 1992,            // POTVRDITI tačnu godinu osnivanja
  legalniNaziv: 'Audio BM d.o.o.', // POTVRDITI
  domena: 'https://svijetsluha.com',
}
```
- Zamijeniti hardkodirane stringove referencama na `BREND.*` u: `src/lib/seo.ts`,
  `src/app/(frontend)/layout.tsx`, `manifest.ts`, `Zaglavlje.tsx`, `Podnozje.tsx`,
  `MobilniMeni.tsx`, `src/email/obavijesti.ts`, `src/lib/okruzenje.ts` (email „from"),
  `KontrolnaTabla.tsx`, `Grafika.tsx`.
- CMS: `Podesavanja.nazivSajta` default → `Svijet Sluha`; `seoNaslov`/`seoOpis` osvježiti.
- Tekst u sadržajnim stranicama (o-nama, poslovnice, uslovi) prepraviti na
  „Svijet Sluha … u saradnji s Audio BM" — gdje god se brend spominje korisniku.

### 2.2 Vizuelni identitet  `[M–L]`
- **Logo/wordmark „Svijet Sluha"** + mali potpis „by Audio BM". Trenutni asseti su u
  `/public/brand/` (favicon, ikone, og slika) + `src/components/admin/Grafika.tsx`.
  → Potreban novi logo (vidi *Tvoji zadaci* §8).
- **Brend boja:** trenutno `#ED1C24` (Audio BM crvena, u `globals.css` kao `--brand-*`).
  Odluka: zadržati crvenu (kontinuitet) ili evoluirati u npr. topliju crveno-narandžastu.
  Preporuka: **zadržati crvenu** prvih 6 mj. radi kontinuiteta, evoluirati kasnije.
- OG slika za dijeljenje (`/brand/og-podrazumijevana.png`) → novi „Svijet Sluha" vizual.

### 2.3 Entitet za Google i AI (kritično za AEO)  `[M]`
U `src/lib/seo.ts` `organizacijaJsonLd()` modelirati ispravan odnos:
```jsonc
{
  "@type": "Organization",
  "name": "Svijet Sluha",
  "url": "https://svijetsluha.com",
  "brand": { "@type": "Brand", "name": "Svijet Sluha" },
  "parentOrganization": { "@type": "Organization", "name": "Audio BM d.o.o.",
    "foundingDate": "1992" },
  "sameAs": [ /* Facebook, Instagram, Google Business Profile, YouTube */ ]
}
```
- **Ukloniti pogrešne hreflang-ove.** `seo.ts` trenutno mapira `sr-RS→audiobm.rs`,
  `sl-SI→audiobm.si` itd. Na jednodomenskom startu to zbunjuje Google → ostaviti samo
  `bs-BA` (i eventualno `hr`/`sr` varijante *iste* domene ako ikad zatrebaju).

### 2.4 Domena i okruženje  `[S]`
- `NEXT_PUBLIC_SERVER_URL=https://svijetsluha.com`; `OSNOVNI_URL` fallback u `seo.ts`.
- `EMAIL_FROM`, `dajCsrfUrl`, Plausible domena (`Podesavanja.plausibleDomena`) → nova domena.
- DNS, SSL, deploy (Netlify/Vercel) na novu domenu (vidi *Tvoji zadaci*).

**Rezultat Faze 1:** posjetilac, Google i AI vide dosljedan brend „Svijet Sluha"
s vidljivim autoritetom Audio BM-a iza sebe.

---

## 3. FAZA 2 — Praćenje provizije (zaštita tvojih 5%)  ⭐ NAJVAŽNIJE ZA TEBE

**Princip:** svaki lead mora nositi *odakle je došao*, i to mora biti vidljivo i izvozivo,
da možeš mjesečno uskladiti s Audio BM-om i naplatiti proviziju bez spora.

Dobra vijest: forme već spremaju `izvorStranica`, a dashboard već grupira leadove po
poslovnici i ima placeholder za analitiku. Nadograđujemo, ne gradimo iznova.

### 3.1 Hvatanje izvora (UTM + referrer)  `[M]`
- Klijentska skripta/cookie (first-party, npr. `ss_attr`) na **prvi dolazak** sprema:
  `utm_source, utm_medium, utm_campaign, utm_content`, `referrer`, `landing`, `prviDolazak`.
  Traje kroz sesiju → i ako korisnik luta po sajtu prije forme, izvor ostaje.
- Linkove iz Instagrama/Facebooka uvijek označavaš UTM-om
  (`?utm_source=instagram&utm_medium=bio` itd.) — dajem ti gotov set linkova.

### 3.2 Polja na formama i u CMS-u  `[M]`
Proširiti kolekciju `Upiti` (`src/collections/Upiti.ts`) i akciju `posaljiUpit`:
- **Vidljivo polje:** „Kako ste čuli za nas?" (select: Instagram / Facebook / Google /
  preporuka / bilbord / ranije kupac / ostalo). Ljudski signal uz tehnički.
- **Skrivena polja (readOnly u adminu):** `utmIzvor, utmMedij, utmKampanja, referrer,
  landingStranica`.
- Sve to ide i u **CSV izvoz** (`Upiti` već ima `/api/upiti/izvoz`) — dodati kolone.

### 3.3 Praćenje telefonskih poziva  `[S–M]`  ⚠️ odluka
Najveći dio leadova za sluh dolazi **telefonom**, a poziv je teško pripisati.
- *Minimum (besplatno):* `TelefonLink` već ima `lokacija` prop → slati Plausible event
  „Poziv" s izvorom; korisnik na sajtu = pripisivo tebi.
- *Ozbiljno (preporuka):* **zaseban broj telefona za web** (call-tracking broj koji se
  prosljeđuje u poslovnicu). Tada je *svaki* poziv na taj broj dokazivo s weba. Trošak:
  ~mali mjesečni. Ovo je najjači dokaz za proviziju. → tvoja odluka (vidi §8).

### 3.4 Dashboard provizije  `[M]`
Proširiti `KontrolnaTabla.tsx` (zamijeniti placeholder „Posjećenost"):
- Leadovi **po izvoru** (Instagram/FB/Google/web/preporuka) — sedmica/mjesec.
- „Web/IG/FB pripisivi leadovi" kao zasebna brojka = osnova za tvojih 5%.
- CSV po mjesecu za usaglašavanje s Audio BM.

**Rezultat Faze 2:** na kraju mjeseca otvoriš dashboard/CSV i tačno vidiš:
*X leadova s tvojih kanala → Y zakazanih → Z prodaja → tvojih 5%.*

---

## 4. FAZA 3 — AEO/GEO: da te AI preporučuje  ⭐ KLJUČNO za rast bez ranking historije

AI asistenti citiraju izvore koji su (a) **mašinski razumljivi**, (b) daju **kratke,
činjenične odgovore**, (c) **potvrđeni izvana**. Konkretno:

### 4.1 Proširiti strukturirane podatke (Schema.org)  `[M]`
Već postoji Organization/LocalBusiness/FAQ/Article. Dodati:
- **`Service`** za svaku uslugu (`/usluge/[slug]`) — naziv, opis, ponuđač.
- **`Product` + `Offer`** za slušne aparate (`/slusni-aparati/modeli/[slug]`) — brend
  (Bernafon, Unitron, Cochlear), kategorija, raspon cijene/„kontakt za cijenu".
- **`BreadcrumbList`** na svim dubljim stranicama.
- **`WebSite` + `SearchAction`** (sitelinks search box).
- **`AggregateRating`** iz stvarnih recenzija (`Recenzije` kolekcija) na Organization —
  *samo stvarne ocjene*, u skladu s Google pravilima.
- **`HowTo`** za „kako izgleda provjera sluha" (već postoje koraci na početnoj).

### 4.2 `llms.txt` + činjenični sažetak  `[S]`
- Dodati `/public/llms.txt` (novi standard koji AI alati čitaju): ko ste, gdje ste
  (7 gradova + adrese + telefoni), šta nudite, brendovi, kako zakazati. Kratko, činjenično.
- Osigurati da je **NAP (Naziv-Adresa-Telefon) identičan** svuda: sajt, Google profil,
  Facebook, Instagram. Nedosljedan NAP ruši i lokalni SEO i povjerenje AI-a.

### 4.3 Sadržaj koji AI voli citirati  `[L, kontinuirano]`
Blog `/savjeti` već postoji. Plan sadržaja oko **pitanja koja ljudi stvarno pišu**:
- „Znakovi gubitka sluha", „Koliko košta slušni aparat u BiH", „Slušni aparat iza vs.
  u uho", „Kako se navići na slušni aparat", „Sluh kod djece — kada na pregled".
- Format: jasno pitanje kao H2, kratak činjeničan odgovor u prve 2 rečenice (to AI lifta),
  pa detalji. Svaki članak → `Article` + interni linkovi + jedna jasna CTA.
- Ovo je dugoročni motor: 2–4 kvalitetna teksta mjesečno > 50 tankih.

### 4.4 Vanjska potvrda  `[non-code, kritično]`
AI vaga citate izvan tvog sajta. Vidi *Tvoji zadaci* §8: Google Business Profile (×6),
lokalni direktoriji, recenzije na Google/Facebook, eventualno lokalni mediji.

---

## 5. FAZA 4 — SEO temelji za novu domenu  `[M]`

- **Google Search Console + Bing Webmaster:** verifikovati domenu, poslati sitemap
  (`/sitemap.xml` već generisan), pratiti indeksiranje.
- **Sitemap proširiti** kako sadržaj raste (već pokriva proizvode/usluge/objave/akcije).
- **Interno povezivanje:** svaka usluga ↔ relevantni aparati ↔ relevantni savjeti ↔ CTA
  zakazivanje. Silo struktura: `sluh → tip aparata → model → zakazivanje`.
- **Core Web Vitals:** hero slika je `priority` (dobro); 3D zvučni talasi (three.js) su
  teški — provjeriti da su lazy + samo desktop (jesu). Izmjeriti LCP/INP na mobilnom.
- **Lokalni SEO:** stranice poslovnica (`/poslovnice/[slug]`) su zlato — svaka treba
  jedinstven tekst, mapu, radno vrijeme, telefon, „besplatna provjera u {grad}".

---

## 6. FAZA 5 — Hook & konverzija  `[M–L]`

- **Hero poruka:** od „Besplatna provjera sluha" → emotivni hook + dokaz.
  Npr. *„Ponovo čujte ono što volite — besplatna provjera sluha, 30+ godina povjerenja."*
  (A/B testirati; CMS već drži hero tekst u `Pocetna` globalu.)
- **E-E-A-T / povjerenje:** imena i kvalifikacije audiologa (`Tim` kolekcija), stvarne
  fotografije, godine, brendovi, recenzije s ocjenama — sve to i ljudima i AI-u.
- **Trenje do zakazivanja:** forma + povratni poziv već postoje; dodati most
  „online test → ostavi broj za rezultat" (online test već postoji).
- **Društveni dokaz:** uvući Instagram/Facebook objave/recenzije.
- **Sticky CTA** (`LjepljivaTraka`) i ponude (`Akcije`) već postoje — iskoristiti za
  sezonske akcije i hitnost.

---

## 7. FAZA 6 — Mjerenje i iteracija  `[S, kontinuirano]`

- **Plausible ciljevi:** slanje forme zakazivanja, povratni poziv, završen online test,
  klik na telefon — **segmentirano po izvoru** (povezuje se s Fazom 2).
- **Mjesečni ritam:** dashboard → leadovi po izvoru → uskladi s Audio BM → naplata 5%.
- Iteriraj sadržaj prema tome šta donosi leadove (ne prema osjećaju).

---

## 8. Tvoji zadaci (van koda — bez ovoga ništa ne leti)

| # | Zadatak | Zašto | Hitnost |
|---|---|---|---|
| 1 | Registruj/uperi **svijetsluha.com** (DNS) | Bez domene nema deploya | Sad |
| 2 | **Google Business Profile** za svih 7 poslovnica (claim/verify) | #1 poluga za „blizu mene" i AI lokalne preporuke | Sad |
| 3 | Logo „Svijet Sluha" (+ „by Audio BM" potpis) | Vizuelni rebrand | Prije Faze 1 vizuala |
| 4 | Potvrdi: tačna **godina osnivanja** i **legalni naziv** Audio BM | Tačan schema/„30+ god." | Brzo |
| 5 | Odluka: **zaseban call-tracking broj** za web? (da/ne + budžet) | Najjači dokaz za proviziju na pozive | Faza 2 |
| 6 | Instagram/Facebook handle-ovi + dozvola za UTM linkove | Atribucija s društvenih mreža | Faza 2 |
| 7 | Pisani **dogovor o 5%** s Audio BM (šta se broji kao tvoj lead, kako se mjeri) | Da dashboard mjeri *pravu* stvar | Sad |
| 8 | Stvarne recenzije (Google/Facebook) — zamoli zadovoljne kupce | AggregateRating + AEO potvrda | Kontinuirano |

---

## 9. Otvorena pitanja prije koda

1. **Legalni naziv + godina osnivanja** Audio BM (za schema i „X godina")?
2. **Brend boja:** zadržati `#ED1C24` ili evoluirati? (preporuka: zadržati zasad)
3. **Call-tracking broj:** gradimo li atribuciju poziva ozbiljno ili zasad samo web-eventi?
4. **Domena live:** je li svijetsluha.com već registrovana i gdje deployamo?

---

## 10. Preporučeni redoslijed izvođenja

```
1. Faza 1 (rebrand + centralizacija + entitet)        ← temelj, sve ostalo zavisi
2. Faza 2 (atribucija / tvojih 5%)                     ← tvoj novac, čim brend stoji
3. Faza 3 (AEO: schema + llms.txt + NAP)               ← brzi tehnički dobici
4. Faza 5 (SEO setup: Search Console, sitemap, interno povezivanje)
5. Faza 4 hook & Faza 6 mjerenje                        ← polirati konverziju
6. Faza 3 sadržaj                                        ← dugoročni motor, kontinuirano
```

**Procjena veličine:** `[S]=sati, [M]=dan, [L]=više dana/kontinuirano`.
Faze 1–3 (temelj + novac + AEO tehnika) su realno nekoliko dana fokusiranog rada;
sadržaj i vanjska potvrda su trajni proces.

---

*Sljedeći korak: odobri ovaj plan (ili reci šta da promijenim), pa krećem s Fazom 1.*
