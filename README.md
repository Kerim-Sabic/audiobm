# Audio BM — web stranica i CMS

Nova web stranica Audio BM BiH (audiobm.ba): Next.js 16 + Payload CMS 3 u jednom
projektu, potpuno na bosanskom jeziku (ijekavica). Zamjenjuje staru Shopify stranicu —
svi stari linkovi se automatski preusmjeravaju na nove adrese.

## Brzi start (razvoj)

```bash
pnpm install
cp .env.example .env        # popunite vrijednosti
pnpm crawl                  # 1) preuzima resurse sa stare stranice (već urađeno)
pnpm brand                  # 2) logo, boje, favicon set (već urađeno)
pnpm seed                   # 3) puni CMS podacima (idempotentno)
pnpm dev                    # http://localhost:3000  (admin: /admin)
```

**Prva prijava u administraciju:** `svijetsluha@gmail.com` / `AudioBM-promijenite-me-2026!`
→ **lozinku odmah promijenite** (Administracija → Korisnici).

## Šta gdje stoji

| Putanja | Sadržaj |
|---|---|
| `src/collections/` | CMS kolekcije (Poslovnice, Upiti, Proizvodi, Usluge, Akcije, Objave, Česta pitanja, Tim, Recenzije) |
| `src/globals/` | Početna stranica, Navigacija, Podešavanja |
| `src/app/(frontend)/` | Sve javne stranice |
| `src/app/(payload)/` | Administracija (/admin) |
| `src/components/` | Dizajn-sistem (dugmad, kartice, harmonika, mapa, animacije…) |
| `scripts/` | crawl (preuzimanje sa stare stranice), brand (boje/favicon), seed |
| `assets-src/` | Sirovi preuzeti materijali (originali — ne brisati) |
| `products-manifest.json` | Katalog sa stare stranice — izvor za seed |
| `assets-report.md` | Izvještaj o preuzimanju resursa |

## Upute za vlasnika (svaki zadatak < 2 minute)

1. **Promjena telefona poslovnice:** Admin → Sadržaj → Poslovnice → odaberite
   poslovnicu → Telefoni → izmijenite → „Sačuvaj". Stranica se sama osvježi.
2. **Unos radnog vremena:** Poslovnice → Radno vrijeme → dodajte dane i vremena
   (ČČ:MM) → označite **„Radno vrijeme je potvrđeno i tačno"** → Sačuvaj.
   Dok kvačica nije označena, stranica prikazuje napomenu da se vrijeme provjeri telefonom.
3. **Objava akcije:** Sadržaj → Akcije → „Kreiraj novi" → naslov, kratki opis,
   datumi od/do → po želji „Istaknuta na početnoj" → Objavi.
   Akcija sama nestaje sa stranice nakon isteka.
4. **Odgovor na upit:** Upiti i termini → Upiti → otvorite upit → pozovite
   korisnika → promijenite Status u „Riješeno". Novi upiti stižu i na e-mail.
5. **CSV izvoz upita:** dok ste prijavljeni otvorite `/api/upiti/izvoz`.

## Produkcija (preporučeno: Vercel + EU Postgres)

1. Napravite bazu na **Neon** ili **Supabase** (region EU — Frankfurt).
2. Na **Vercelu** povežite GitHub repozitorij; svaka grana dobija preview okruženje.
3. Postavite varijable okruženja (Settings → Environment Variables):

| Varijabla | Vrijednost |
|---|---|
| `PAYLOAD_SECRET` | dug nasumičan niz (obavezno novi za produkciju) |
| `DATABASE_URL` | `postgres://…` (EU baza) |
| `NEXT_PUBLIC_SERVER_URL` | `https://audiobm.ba` |
| `SMTP_HOST/PORT/USER/PASS` | SMTP nalog (npr. Resend) — **[DNS_PLACEHOLDER: podesiti SPF/DKIM]** |
| `EMAIL_FROM` | `"Svijet Sluha <svijetsluha@gmail.com>"` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile (zaštita formi) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `audiobm.ba` (ili upišite domenu u Admin → Podešavanja) |

4. Nakon prvog deploya pokrenite seed na produkcijskoj bazi:
   `DATABASE_URL=… pnpm seed`
5. **Rezervne kopije:** Neon/Supabase imaju automatski point-in-time recovery;
   za medije koristite Vercel Blob ili S3 + dnevni snapshot (`media/` folder).

Alternativa: jedan EU VPS (Docker: app + Postgres + Caddy) — `pnpm build && pnpm start`
iza Caddy reverse-proxyja sa automatskim HTTPS-om.

## Produkcija na Netlifyju

Projekat je spreman za Netlify (`netlify.toml` je u repozitoriju; rutiranjem,
osvježavanjem i direktnim linkovima upravlja zvanični `@netlify/plugin-nextjs`).

1. **Baza:** kreirajte Postgres na Neonu (EU) — SQLite na Netlifyju ne radi
   (datoteke se ne čuvaju između poziva funkcija).
2. **Slike:** kreirajte S3/Cloudflare R2 bucket — lokalni `media/` folder se na
   serverless platformi ne čuva. Adapter se uključuje sam kad postavite `S3_BUCKET`.
3. Na Netlifyju: **Add new site → Import from Git** → varijable okruženja:
   `PAYLOAD_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_SERVER_URL`,
   `S3_BUCKET`/`S3_REGION`/`S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY`
   (+ `S3_ENDPOINT` za R2), `SMTP_*`, `EMAIL_FROM`.
4. Deploy (build: `pnpm build`; radi i `npm install && npm run build`).
5. Jednom napunite produkcijsku bazu sa svog računara:
   `DATABASE_URL=postgres://… S3_BUCKET=… pnpm seed`

## Analitika

Plausible (EU, bez kolačića). Aktivira se unosom domene u Admin → Podešavanja →
Društvene mreže i analitika. Praćeni događaji: `lead_submit`, `call_click`,
`whatsapp_click`, `viber_click`, `booking_start`, `booking_complete`, `promo_click`.

## ⚠️ Preostali placeholderi — popuniti prije lansiranja

Vidljivo označeni na stranici i u administraciji; svaki nestaje unosom stvarnog podatka:

| Oznaka | Šta treba | Gdje se unosi |
|---|---|---|
| `[ADRESA_PLACEHOLDER]` | Adresa poslovnice **Sarajevo** | Admin → Poslovnice → Sarajevo (+ Početna → Sarajevo baner; + objava na blogu) |
| `[TELEFON_PLACEHOLDER]` | Telefon poslovnice Sarajevo | Admin → Poslovnice → Sarajevo |
| `[RADNO_VRIJEME_PLACEHOLDER]` | Radno vrijeme **svih aktivnih poslovnica** (staro „7–15h" je nepouzdano) | Admin → Poslovnice → svaka poslovnica + kvačica „potvrđeno" |
| `[CIJENA_PLACEHOLDER]` | Cijene čepova za uši (stara stranica ima neispravne, npr. „3600 KM" umjesto 36 KM) i rasponi cijena aparata po klasama | Admin → Proizvodi; stranica „Cijene i finansiranje" |
| `[POTVRDA_VLASNIKA]` | FAQ odgovori: garancija, plaćanje na rate, zamjenski aparat, servis tuđih aparata, uputnica/refundacija | Admin → Česta pitanja |
| `[OWNER_INPUT_PLACEHOLDER]` | Postupak refundacije po entitetima; historijat firme (godine, prekretnice) | `cijene-i-finansiranje` i `o-nama` stranice |
| `[ALL_STAFF_DATA_PLACEHOLDER]` | Tim: imena, titule, fotografije, poslovnice, jezici | Admin → Tim |
| `[OWNER_PHOTOSHOOT_PLACEHOLDER]` | Fotografije poslovnica (interijeri, tim) | Admin → Poslovnice → Fotografije |
| `[CONFIRM_PARTNERSHIP_PLACEHOLDER]` | Potvrda partnerstava za prikaz logotipa brendova (Bernafon, Unitron, Cochlear, Varta) | Početna stranica — blok povjerenja |
| `[REAL_NUMBERS_PLACEHOLDER]` | Stvarna statistika (npr. broj korisnika) | Admin → Početna → Blok povjerenja |
| `[RECENZIJA_PLACEHOLDER]` | Stvarna iskustva korisnika (uz saglasnost) | Admin → Recenzije → unijeti + „Odobreno" |
| `[BROJEVI_PLACEHOLDER]` | Viber/WhatsApp brojevi po poslovnici | Admin → Poslovnice |
| `[LEGAL_REVIEW_PLACEHOLDER]` | Pravnička revizija politike privatnosti i uslova korištenja | `politika-privatnosti`, `uslovi-koristenja` |
| `[DNS_PLACEHOLDER]` | SPF/DKIM zapisi za slanje e-pošte | DNS domene |
| `[PLACEHOLDER]` Turnstile | Cloudflare Turnstile ključevi | `.env` |
| `[OWNER_CHOICE]` | Analitika: Plausible (preporuka, EU) ili GA4 | Admin → Podešavanja |
| `[PROVJERITI]` geo | Tačne koordinate poslovnica (sada centar grada — pinovi na mapi) | Admin → Poslovnice → Geo |
| 2FA za admin | Dvofaktorska prijava (preporuka: dodati `payload-totp` plugin ili SSO pri produkcijskom deploymentu) | — |

## Tehničke napomene

- **Baza:** lokalno SQLite (`audiobm.db`); produkcija Postgres — bira se automatski
  prema `DATABASE_URL`.
- **Slike:** original se čuva, Payload pravi WebP verzije (480–1920px) + LQIP
  mutnu sličicu pri svakom otpremanju; `next/image` servira AVIF/WebP.
- **Animacije:** `motion` (LazyMotion — mali bundle); uz `prefers-reduced-motion`
  sve se svodi na trenutne promjene prozirnosti. Hero animacija ide jednom po sesiji.
- **Otkrivanje pri skrolanju:** CSS + IntersectionObserver sa sigurnosnom mrežom —
  sadržaj se bezuslovno prikazuje nakon 2 s, pa nijedna sekcija nikad ne ostaje prazna.
- **3D hero (zvučni talasi):** three.js scena se učitava lijeno, samo na desktopu i
  samo bez `prefers-reduced-motion` — ne ulazi u početni JS niti utiče na LCP.
- **Dizajnerska revizija:** `node scripts/screenshot.mjs` snima sve ključne stranice
  (desktop + mobilno) u `screenshots/`; `node scripts/shot-viewport.mjs <putanja> <ime> <skrol>`
  snima jedan ekran.
- **301 preusmjeravanja** sa starih Shopify adresa: `next.config.ts` (generišu se
  iz `products-manifest.json`).
- **Stari sajt — greške koje su ispravljene:** prazan `<title>`; mrtvi CTA linkovi;
  eksterni Zoho obrazac; aparati „KM 0" sa korpom; miješanje ekavice/engleskog;
  pogrešan footer (gradiški telefon uz banjalučku adresu); Varta baterije u
  kolekciji slušnih aparata; neispravne cijene čepova (bez decimalnog zareza).
