# Schema Inventory — Svijet Sluha

Generated from crawl: 2026-06-27T16:46:18.887Z. JSON-LD parsed with zero crawl-level syntax errors.

| Schema type | URL count | Role | Source data / code | Example URLs | Verification requirements |
| --- | --- | --- | --- | --- | --- |
| Answer | 2 | Nested | FAQ/home visible FAQ blocks + src/lib/seo.ts | /, /cesta-pitanja | Keep matching visible page content and canonical entity model. |
| Article | 4 | Primary | src/app/(frontend)/savjeti/[slug]/page.tsx + Objave CMS | /savjeti/otvaranje-poslovnice-sarajevo, /savjeti/pet-savjeta-odrzavanje-slusnog-aparata, /savjeti/prvi-znakovi-slabljenja-sluha, /savjeti/tuzla1 | Needs factual review for health-adjacent content and placeholder cleanup. |
| BreadcrumbList | 97 | Primary | src/components/ui/Mrvice.tsx | /akcije, /cesta-pitanja, /cijene-i-finansiranje, /kontakt, /o-nama, /online-test-sluha, /politika-privatnosti, /poslovnice, /poslovnice/banja-luka, /poslovnice/bijeljina, /poslovn… | Keep matching visible page content and canonical entity model. |
| FAQPage | 2 | Primary | FAQ/home visible FAQ blocks + src/lib/seo.ts | /, /cesta-pitanja | FAQ schema must match visible questions/answers. |
| ListItem | 97 | Nested | src/components/ui/Mrvice.tsx | /akcije, /cesta-pitanja, /cijene-i-finansiranje, /kontakt, /o-nama, /online-test-sluha, /politika-privatnosti, /poslovnice, /poslovnice/banja-luka, /poslovnice/bijeljina, /poslovn… | Keep matching visible page content and canonical entity model. |
| LocalBusiness | 7 | Primary | src/app/(frontend)/poslovnice/[slug]/page.tsx + src/lib/seo.ts + Poslovnice CMS | /poslovnice/banja-luka, /poslovnice/bijeljina, /poslovnice/brcko, /poslovnice/doboj, /poslovnice/gradiska, /poslovnice/sarajevo, /poslovnice/tuzla | NAP, geo, phone, and hours must match visible branch page and Google profile; Sarajevo/Tuzla need confirmation. |
| MedicalClinic | 7 | Primary | src/app/(frontend)/poslovnice/[slug]/page.tsx + src/lib/seo.ts + Poslovnice CMS | /poslovnice/banja-luka, /poslovnice/bijeljina, /poslovnice/brcko, /poslovnice/doboj, /poslovnice/gradiska, /poslovnice/sarajevo, /poslovnice/tuzla | NAP, geo, phone, and hours must match visible branch page and Google profile; Sarajevo/Tuzla need confirmation. |
| Organization | 98 | Primary | src/app/(frontend)/layout.tsx + src/lib/seo.ts | /, /akcije, /cesta-pitanja, /cijene-i-finansiranje, /kontakt, /o-nama, /online-test-sluha, /politika-privatnosti, /poslovnice, /poslovnice/banja-luka, /poslovnice/bijeljina, /posl… | Keep matching visible page content and canonical entity model. |
| Product | 49 | Primary | Product/model templates + Proizvodi CMS | /proizvodi/accuscreen-oae-abr-skrining, /proizvodi/allegro-timpanometar, /proizvodi/antidekubit-dusek-bubble-2, /proizvodi/audiostar-pro-audiometar, /proizvodi/baha-6-max-procesor… | Product name/brand/description/image must match visible product content. |
| Question | 2 | Nested | FAQ/home visible FAQ blocks + src/lib/seo.ts | /, /cesta-pitanja | Keep matching visible page content and canonical entity model. |
| Service | 3 | Primary | src/app/(frontend)/usluge/[slug]/page.tsx + Usluge CMS | /usluge/kohlearni-implanti, /usluge/prilagodjavanje-i-servis, /usluge/provjera-sluha | Keep matching visible page content and canonical entity model. |
| WebSite | 98 | Primary | src/app/(frontend)/layout.tsx + src/lib/seo.ts | /, /akcije, /cesta-pitanja, /cijene-i-finansiranje, /kontakt, /o-nama, /online-test-sluha, /politika-privatnosti, /poslovnice, /poslovnice/banja-luka, /poslovnice/bijeljina, /posl… | Keep matching visible page content and canonical entity model. |

## Implementation Notes

- Organization and WebSite schema are sitewide and model Svijet Sluha as the web brand in cooperation with Audio BM.
- BreadcrumbList is generated on pages that render breadcrumbs.
- LocalBusiness/MedicalClinic is emitted only on branch pages and omits placeholder phone/address values through the stvarno() filter.
- Product schema is emitted for real product/model detail pages. Offer is conditional on price data.
- FAQPage is emitted only where visible FAQ content exists.
- Article schema is emitted for advice posts; health-adjacent content needs review before expansion.
- WebPage schema is not currently emitted. This is a low-risk future enhancement, but not required before fixing data consistency and sitemap/indexation issues.
