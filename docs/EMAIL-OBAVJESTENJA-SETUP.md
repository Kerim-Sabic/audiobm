# E-mail obavještenja o zakazivanjima — postavljanje

> Cilj: **svaki put kad neko zakaže termin / pošalje upit na sajtu → odmah dobiješ e-mail
> na svijetsluha@gmail.com.**
>
> Kod je već spreman (svaka prijava okida e-mail). Treba još samo **povezati slanje (SMTP)**
> i **potvrditi primaoca**. ~10 minuta.

---

## Korak 1 — App Password za Gmail (da sajt može slati preko tvog Gmaila)

1. Otvori **myaccount.google.com → Security (Sigurnost)**.
2. Uključi **2-Step Verification** (ako već nije) — obavezno za App Password.
3. Idi na **App passwords** (App lozinke):
   `myaccount.google.com/apppasswords`
4. Naziv aplikacije: upiši **„Svijet Sluha"** → **Create**.
5. Google ti da **16-cifrenu lozinku** (npr. `abcd efgh ijkl mnop`).
   **Kopiraj je BEZ razmaka** → `abcdefghijklmnop`.

---

## Korak 2 — Netlify Environment variables

Netlify → tvoj sajt → **Site configuration → Environment variables → Add** (dodaj ovih 6):

| Key | Value |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `svijetsluha@gmail.com` |
| `SMTP_PASS` | *(16-cifrena App lozinka, BEZ razmaka)* |
| `EMAIL_FROM` | `Svijet Sluha <svijetsluha@gmail.com>` |
| `EMAIL_TO` | `svijetsluha@gmail.com` |

> ⚠️ `EMAIL_FROM` mora koristiti **isti Gmail** (`svijetsluha@gmail.com`) — Gmail ne dozvoljava
> slanje s tuđe adrese.
> `EMAIL_TO` je primalac obavještenja o novom terminu/upitu.

Zatim **Deploys → Trigger deploy → Deploy site** (da funkcije pokupe nove varijable).

---

## Korak 3 — Potvrdi primaoca u administraciji

Admin (`svijetsluha.com/admin`) → **Podešavanja → Obavještenja o upitima** →
**„Glavni e-mail za sve upite"** = `svijetsluha@gmail.com` → **Save**.
(Sada je već unaprijed popunjeno.)

> Možeš dodati i **posebne primaoce po vrsti** (npr. „Zakazivanje" → drugi e-mail) u istoj
> sekciji — ali za početak je dovoljan glavni e-mail.

---

## Korak 4 — Test

1. Otvori `svijetsluha.com/zakazivanje` i pošalji **probni termin** (svoje ime/telefon).
2. Provjeri **svijetsluha@gmail.com** — stiže e-mail „Novi upit: Zakazivanje…".
3. **Prvi put pogledaj i Spam/Promotions** — ako je tamo, klikni **„Nije spam"** (da ubuduće
   ide u Inbox).

✅ Gotovo — od sada svaki termin/upit = instant e-mail.

---

## Rješavanje problema
- **Ne stiže ništa:** provjeri da je App lozinka unesena **bez razmaka**, da je `SMTP_USER`
  tačan Gmail, i da si uradio **redeploy** nakon dodavanja varijabli.
- **Ide u Spam:** označi „Nije spam" jednom; razmisli o domenskom e-mailu kasnije.
- **Gmail limit:** ~500 mailova/dan (više nego dovoljno). Za veći obim ili bolju
  isporučivost koristi servis (npr. **Brevo** — besplatno 300/dan):
  `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=587`, `SMTP_USER`=Brevo login,
  `SMTP_PASS`=Brevo SMTP ključ, `EMAIL_FROM=Svijet Sluha <svijetsluha@gmail.com>`.

---

## Šta već radi (bez tvoje akcije)
- Svaka prijava s obrazaca (**zakazivanje, povratni poziv, kontakt, upit za proizvod, online
  test**) sprema se u Admin → **Upiti** i okida e-mail (hook kolekcije `Upiti`).
- E-mail sadrži vrstu, ime, telefon, poslovnicu, poruku + link na upit u administraciji.
- Svaki lead se i dalje vidi u **„Upiti po kanalu"** (atribucija za 5%).
