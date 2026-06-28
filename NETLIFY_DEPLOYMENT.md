# Audio BM BiH — Deployment na Netlify

## Preduslov: Podesavanje baze podataka

**SQLite NEĆE raditi na Netlifyu.** Netlify nema perzistentnog file sistema — baza će biti izbrisana pri svakom deployu.

### Opcija 1: **Neon** (preporučeno za EU)

1. Kreirajte nalog na https://console.neon.tech
2. Napravite novi project (region: **EU – Frankfurt**)
3. Kopirajte connection string: `postgresql://user:password@...`
4. Na Netlifyu postavite environment varijablu `DATABASE_URL` na tu vrijednost

### Opcija 2: **Supabase** (alternativa, EU)

1. Kreirajte nalog na https://supabase.com
2. Novi project (region: **EU – Frankfurt**)
3. Settings → Database → Connection string (PostgreSQL format)
4. Postavite `DATABASE_URL` na Netlifyu

## Podesavanje Netlify Okruženja

### 1. Povežite GitHub repozitorij

```bash
cd audiobm
git add .
git commit -m "Add Netlify configuration"
git push origin main
```

Na Netlifyu:
1. Kliknite **Add new site** → **Import an existing project**
2. Povežite GitHub (授权)
3. Odaberite `audiobm` repozitorij

### 2. Postavite Environment Varijable

Na Netlifyu idite: **Site Settings** → **Environment Variables**

| Varijabla | Vrijednost | Primjer |
|---|---|---|
| `PAYLOAD_SECRET` | Dug nasumičan niz (minimum 32 znaka) | `$(openssl rand -base64 32)` |
| `DATABASE_URL` | Neon/Supabase PostgreSQL connection | `postgresql://user:pass@...` |
| `NEXT_PUBLIC_SERVER_URL` | Vaša Netlify domena ili custom domena | `https://audiobm.ba` |
| `SMTP_HOST` | SMTP server | npr. `smtp.resend.com` |
| `SMTP_PORT` | Port (obično 587) | `587` |
| `SMTP_USER` | E-mail korisnik | `svijetsluha@gmail.com` |
| `SMTP_PASS` | SMTP lozinka | `re_xxxxx` |
| `EMAIL_FROM` | Noreply e-mail | `"Svijet Sluha <svijetsluha@gmail.com>"` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile ključ | Kreirajte na dash.cloudflare.com |
| `TURNSTILE_SECRET_KEY` | Tajni Turnstile ključ | — |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Domena za analitiku | `audiobm.ba` |

### 3. Konfigurirajte Custom Domenu

Na Netlifyu:
1. **Domain Settings** → **Add domain**
2. Povežite `audiobm.ba`
3. Postavite DNS zapise prema upuci Netlify-a

## Build & Deploy

Netlify će automatski:
1. Preuzeti kod sa `main` grane
2. Pokrenuti `pnpm install`, zatim build komandu iz `netlify.toml`: `pnpm seed && pnpm build`
3. Objaviti `.next` folder

`pnpm seed` je idempotentan: na svježoj bazi kreira početni sadržaj, a na postojećoj preskače već unesene zapise.

## Redirekcije Starih Linkova

Sve redirekcije iz `next.config.ts` će automatski raditi preko Next.js (`_redirects` se generiše tokom build-a).

## Monitoring

- **Logovi**: Netlify → **Functions** → **Logs**
- **Greške**: Netlify → **Deploys** → kliknite deploy → vidi output
- **Analitika**: Plausible na https://plausible.io/audiobm.ba

## Troubleshooting

### Build se ne završava
- Provjerite `package.json` → `engines.node` verziju (trebava >= 20.9.0)
- Provjerite `DATABASE_URL` je postavljena

### Admin panel se ne učitava
- Provjerite `PAYLOAD_SECRET` je postavljena
- Provjerite baza je dostupna (`DATABASE_URL` je ispravna)

### Slike se ne prikazuju
- Next.js `<Image>` komponenta trebava `unoptimized: true` ako koristiš Netlify (već je uključeno u config ako je potrebno)

### E-mail ne radi
- Provjerite `SMTP_*` varijable su ispravne
- Testirati sa `curl -X POST http://localhost:3000/api/kontakt -d {...}`

## Automatski Deploji

Svaka push na `main` će automatski triggerati novi deploy:
1. Netlify izvlači kod
2. Pokrenuta je `pnpm seed && pnpm build`
3. `.next` folder je objavljen
4. Stari preview okruženja se čiste

## Rezervne Kopije

Neon i Supabase imaju built-in:
- **Point-in-time recovery** (PITR) — vratite bazu do bilo kojeg vremena
- **Automated backups** — dnevne, nedeljne, mesečne
- **WAL archiving** — kompletna istorija transakcija

Za medije (`/media`):
- Koristite Netlify Blob ili S3 za redundanciju
- Ili jednostavno čuvajte lokalno, git će pratiti (ako su mali)

## Kontakt sa Netlify Supportom

- Kontakt: Netlify support centar
- Slack: #netlify-support (ako ste u njihovoj zajednici)
