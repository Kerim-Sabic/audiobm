# Svijet Sluha — AEO / GEO / SEO Playbook (max)

> Kako od svijetsluha.com napraviti izvor koji **AI asistenti preporučuju** i koji je
> **#1 na Google pretrazi za sluh u BiH**. Konkretno, vezano za ovaj kod, s prioritetima.
>
> Dopuna strateškog dokumenta [STRATEGIJA-SVIJET-SLUHA.md](STRATEGIJA-SVIJET-SLUHA.md).
> Datum: 2026-06-25.

---

## 1. Realnost 2026 — zašto ovo radimo ovako

Pretraga se podijelila na tri kanala, svaki traži svoj pristup:

| Pojam | Šta je | Cilj |
|---|---|---|
| **SEO** | Klasična Google plava lista | Rangiranje stranica |
| **AEO** (Answer Engine Opt.) | Google AI Overviews, izdvojeni odgovori | Biti *odgovor*, ne link |
| **GEO** (Generative Engine Opt.) | ChatGPT, Perplexity, Gemini, Claude | Biti *citiran izvor* u sintetizovanom odgovoru |

**Ključni pomak:** cilj više nije „budi viši u lokalnom paketu", nego **„budi tačno i
potpuno dokumentovan entitet kojeg AI može preporučiti bez oklijevanja."**

**Tri brojke koje sve mijenjaju (SOCi 2026 Local Visibility Index):**
- Google lokalni 3-pack preporuči **35.9%** lokacija…
- …ali ChatGPT samo **1.2%**, Perplexity **7.4%**, Gemini **11%**.

→ Većina firmi je *nevidljiva* AI asistentima. Ko bude potpun i dosljedan — dominira.
To je naša prilika: konkurencija u BiH gotovo sigurno nije optimizovana za AEO/GEO.

---

## 2. Tri stuba (redoslijed = prioritet)

1. **Entitet i dosljednost** — AI mora *vjerovati* da zna ko ste. NAP identičan svuda.
2. **Struktura** — strukturirani podaci (schema) da mašina čita činjenice bez nagađanja.
3. **Suština** — sadržaj koji daje kratke, činjenične, citiranje-vrijedne odgovore.

Bez #1, #2 i #3 ne pomažu (AI gubi povjerenje kod nedosljednih podataka). Zato prvo NAP.

---

## 3. Stub 1 — Entitet & dosljednost (NAJVAŽNIJE za AI preporuke)

> Istraživanje: **tačnost podataka je #1 faktor** za AI preporuke; AI unakrsno provjerava
> Google Maps, Facebook, direktorije i sajt — i gubi povjerenje kod neslaganja.

**Zlatno pravilo:** Naziv-Adresa-Telefon (**NAP**) mora biti **znak-po-znak identičan** na:
- sajtu (✅ već: poslovnice = „Audio BM {grad}" u schemi, usklađeno s Google profilom)
- Google Business Profile (×8) · Facebook · Instagram · Apple Maps · Bing Places
- lokalnim direktorijima (bizbih, zlatne stranije i sl.)

**Akcije (uglavnom van koda — tvoji zadaci):**
- [ ] Google Business Profile za svih 8 poslovnica — *claim, ne duplicate* (vidi strategiju §8)
- [ ] Facebook + Instagram „About" sa identičnim NAP-om i linkom na svijetsluha.com
- [ ] Apple Business Connect + Bing Places (AI/Siri/Copilot izvori)
- [ ] Upis u relevantne BiH direktorije s istim NAP-om
- [ ] `sameAs` u Organization schemi → svi ti profili (✅ kod već povlači FB/IG/YT iz Podešavanja;
      dodati Google Business Profile URL kad postoji)

---

## 4. Stub 2 — Strukturirani podaci (mapirano na ovaj kod)

> Istraživanje: **74.2%** AI citata dolazi iz strukturiranog sadržaja; preporuka je
> **„triple JSON-LD stacking"** (Article + ItemList + FAQPage) na ključnim stranicama.
> Za zdravstvo: **MedicalClinic** (podtip MedicalBusiness+LocalBusiness) + **Service** +
> **FAQPage** + **Physician** (za tim, s kvalifikacijama), povezani stabilnim `@id`.

Trenutno stanje: ✅ Organization, ✅ LocalBusiness/MedicalBusiness po poslovnici,
✅ FAQPage, ✅ Article. **Plan dopune** (`src/lib/seo.ts` + odgovarajuće stranice):

| Stranica | Dodati schema | Napomena |
|---|---|---|
| Poslovnica `/poslovnice/[slug]` | Nadograditi na **`MedicalClinic`** + `aggregateRating` | Najjača lokalna stranica; dodati `@id` graf |
| Usluga `/usluge/[slug]` | **`Service`** (`provider`, `areaServed`, `serviceType`) | Po jedna po usluzi |
| Model aparata `/slusni-aparati/modeli/[slug]` | **`Product`** + **`Offer`** (`brand`, `priceCurrency`/`price` ili `priceSpecification`) | Bernafon/Unitron/Cochlear |
| Tim `/tim` (i profili) | **`Physician`**/`Person` (`medicalSpecialty`, `knowsAbout`, kvalifikacije) | E-E-A-T — pravi stručnjaci |
| Sve | **`BreadcrumbList`** | Mrvice već postoje vizuelno |
| Početna | **`WebSite`** + `SearchAction` | Sitelinks search box |
| Savjeti (članci) | **Article + ItemList + FAQPage** (triple-stack) na „Top N" tekstovima | Vidi §5 |
| Cijene `/cijene-i-finansiranje` | **FAQPage** + tabela | „Koliko košta…?" je čest AI upit |

**Entity @id graf:** dati stabilne `@id` (npr. `${URL}/#organizacija`, `…/poslovnice/sarajevo#klinika`,
`…/usluge/provjera-sluha#usluga`) i povezati ih (`provider`, `areaServed`, `parentOrganization`,
`makesOffer`) da AI vidi koherentnu sliku, a ne razbacane fragmente.

**AggregateRating:** samo iz **stvarnih** recenzija (kolekcija `Recenzije`) — u skladu s
Google pravilima (ne izmišljati). AI tretira ocjene kao signal povjerenja.

---

## 5. Stub 3 — Sadržaj koji se citira (GEO motor)

> Istraživanje (Princeton GEO studija + 2026 vodiči): AI sisteme s pretragom u realnom
> vremenu (Perplexity, AI Overviews) **prvih ~200 riječi** stranice najviše određuje.
> Pojačivači vidljivosti: **statistike +30%**, **citati stručnjaka +41%**, **inline izvori
> +30%**. **„Top N" liste = 74% citata.** Sadržaj **ulazi u AI bazu za 3–5 dana**, ali i
> **propada** bez osvježavanja.

**GEO formula za svaki članak/stranicu:**
1. **Odgovor odmah** — H2 = tačno pitanje korisnika; prve 2 rečenice = direktan, činjeničan
   odgovor (to AI „podiže"). Tek onda detalji.
2. **Strukturiraj** — liste, „Top 5…", koraci, tabele uporedbe.
3. **Dokaži** — bar jedna konkretna brojka/statistika, jedan citat stručnjaka (našeg
   akustičara, s imenom i titulom), i izvor gdje ima smisla.
4. **Osvježavaj** — datum „ažurirano", revizija svaka 3–6 mjeseci.
5. **Poveži** — interni linkovi (usluga ↔ aparat ↔ savjet ↔ zakazivanje) + jasan CTA.

**Tematski klasteri (visok namjera, BiH kontekst)** — `/savjeti`:
- „Znakovi gubitka sluha — 7 signala da je vrijeme za provjeru"
- „Koliko košta slušni aparat u BiH 2026 — vodič kroz cijene i finansiranje"
- „Slušni aparat iza uha vs. u uho — koji odabrati?" (uporedna tabela)
- „Kako se naviknuti na slušni aparat — prvih 30 dana"
- „Sluh kod djece — kada na pregled" / „Sluh kod starijih"
- „Tinitus (zujanje u ušima) — uzroci i šta pomaže"
- FAQ rudnik: pretvori svako pitanje osoblja kupaca u H2 + kratak odgovor.

**Ritam:** 2–4 kvalitetna, duboka teksta mjesečno > 50 tankih. Kvalitet i svježina pobjeđuju.

---

## 6. Recenzije & reputacija (AI signal povjerenja)

> Istraživanje: lokacije koje ChatGPT preporučuje imaju prosjek **≥4.3 zvjezdice**;
> bitan je i *obim* i *odgovaranje* na recenzije.

- [ ] Sistem za prikupljanje: nakon isporuke aparata, zamoli kupca za Google recenziju
      (QR kartica u poslovnici, SMS link, link u e-mailu).
- [ ] Odgovaraj na **sve** recenzije (i pozitivne i negativne) — signal aktivnosti.
- [ ] Prikaži stvarne recenzije na sajtu (✅ kolekcija `Recenzije`) + `AggregateRating` schema.
- Cilj: ≥4.5 prosjek, kontinuiran priliv, na Google i Facebooku.

---

## 7. llms.txt & dostupnost za AI crawlere

- [ ] `/public/llms.txt` — kratak, činjeničan sažetak za LLM-ove: ko ste (Svijet Sluha u
      saradnji s Audio BM, 30+ god.), 7 gradova s adresama/telefonima, usluge, brendovi,
      kako zakazati, link na ključne stranice. (Mogu generisati iz CMS podataka.)
- [ ] `robots.ts` — ne blokirati AI crawlere (GPTBot, PerplexityBot, ClaudeBot, Google-Extended)
      ako želimo da nas indeksiraju (trenutno blokira samo /admin i /api — ✅ ok).
- [ ] SSR sadržaj (✅ Next renderuje na serveru) — ništa ključno iza JS-a.
- [ ] Brzina (Core Web Vitals) — AI/Google preferiraju brze stranice; izmjeriti LCP/INP na mobilnom.

---

## 8. Mjerenje (KPI ere AI-a)

Ne mjeriti samo „poziciju". Pratiti:
- **AI citate/spominjanja** — ručno ili alatom (npr. periodično pitati ChatGPT/Perplexity
  „najbolji slušni aparati / provjera sluha u {grad}" i bilježiti da li smo spomenuti).
- **Referral promet s AI platformi** (Plausible: izvori chat.openai.com, perplexity.ai, gemini).
- **Google Search Console** — upiti, AI Overview pojavljivanja, klikovi.
- **Konverzije po izvoru** — povezano s atribucijom (Faza 2) → tvojih 5%.

---

## 9. Prioritetni plan 30 / 60 / 90 dana

**0–30 dana (temelj + brzi dobici)**
- [ ] Google Business Profile ×6 (claim, NAP, foto, kategorije) ⟵ najveći pojedinačni efekat
- [ ] Schema dopuna: MedicalClinic + Service + Product/Offer + BreadcrumbList + WebSite (kod)
- [ ] `llms.txt` + Search Console + Bing Webmaster + sitemap
- [ ] Sistem za Google recenzije (QR/SMS)

**30–60 dana (struktura + sadržaj)**
- [ ] Physician schema za tim + profili stručnjaka (E-E-A-T)
- [ ] AggregateRating iz stvarnih recenzija
- [ ] Prva 4 „Top N / answer-first" članka iz klastera (§5)
- [ ] Cijene stranica s FAQPage + tabelom

**60–90 dana (autoritet + iteracija)**
- [ ] Još 6–8 članaka; osvježiti najstarije
- [ ] Vanjski citati: direktoriji, lokalni mediji, partnerski linkovi
- [ ] Mjerenje AI citata; udvostručiti ono što donosi leadove

---

## Izvori (istraživanje 2026)

- [Jasper — GEO vs AEO vs SEO Guide 2026](https://www.jasper.ai/blog/geo-aeo)
- [GenOptima — GEO Best Practices 2026 Playbook](https://www.gen-optima.com/blog/generative-engine-optimization-best-practices-complete-2026-playbook/)
- [SOCi — How to Rank in ChatGPT, Perplexity, and Google AI Overview](https://www.soci.ai/blog/how-to-rank-in-chatgpt-perplexity-and-google-ai-overview/)
- [SOCi — AI for Local SEO (multi-location)](https://www.soci.ai/blog/ai-for-local-seo-how-agents-improve-rankings-for-multi-location-brands/)
- [Localo — AI Impact on Local SEO 2026](https://localo.com/blog/ai-impact-local-seo)
- [Schema.org — MedicalClinic](https://schema.org/MedicalClinic) · [Health & medical types](https://schema.org/docs/meddocs.html)
- [eSEOspace — Healthcare Schema Markup Guide](https://eseospace.com/blog/schema-markups-for-medical-and-healthcare-websites/)
- [schema.org issue #4566 — HearingAidStore (emerging type)](https://github.com/schemaorg/schemaorg/issues/4566)
