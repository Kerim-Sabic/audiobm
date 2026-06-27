# SEO / AEO / GEO changelog

Validation date: 2026-06-27

## Changed Files

| File | What changed | Why | Expected SEO/AEO/local/UX effect | Risk | Owner confirmation |
| --- | --- | --- | --- | --- | --- |
| README.md | Updated remaining-hours placeholder wording from six branches to all active branches. | Avoid stale branch-count instructions. | Cleaner owner handoff and fewer future data mismatches. | Low | Yes, actual hours still needed. |
| docs/AEO-GEO-SEO-PLAYBOOK.md | Updated Google Business Profile and llms.txt count guidance from 6 to 7. | Production has seven live branch pages. | Keeps strategy docs consistent with current local footprint. | Low | No for count; NAP still yes. |
| docs/GOOGLE-BUSINESS-PROFILI.md | Updated title to 7 branches and added Tuzla GBP section with verified address/phone. | Tuzla is live and should be claimed/optimized. | Better local SEO operations and fewer GBP setup mistakes. | Low | Tuzla full hours; Sarajevo NAP. |
| docs/KALENDAR-SADRZAJA-30-DANA.md | Updated social/content references from 6 to 7 cities and added Tuzla. | Prevents publishing stale location claims. | More accurate local messaging. | Low | No for count. |
| docs/OGLASI-META-I-GOOGLE.md | Updated ad copy, targeting, city list, and callouts from 6 to 7 cities. | Paid campaigns should match real coverage. | Higher ad trust and fewer location omissions. | Low | No for count. |
| docs/STRATEGIJA-SVIJET-SLUHA.md | Updated llms.txt and GBP task counts from 6 to 7. | Aligns strategy with verified production footprint. | Consistent entity signals across docs. | Low | No for count. |
| docs/audit-data/production-crawl.json | Added production crawl evidence for 99 discovered URLs. | Source data for audit tables and findings. | Reproducible baseline for future comparisons. | Low | No. |
| docs/seo-aeo-geo-audit.md | Added full audit with every discovered URL, status, indexability, canonical, schema, intent, links, notes, and priority. | Required audit artifact and implementation basis. | Clear technical/local/content baseline. | Low | Some listed data issues need owner input. |
| docs/keyword-intent-map.md | Added canonical keyword-to-URL intent map. | Avoid duplicate doorway pages and focus content work. | Better content architecture for SEO/AEO/GEO. | Low | Professional review for health-adjacent topics. |
| docs/local-seo-operations-checklist.md | Added off-site local SEO task checklist. | GBP/Bing/citations/reviews require manual business action. | Stronger local authority signals. | Low | Yes, for NAP/photos/hours/listing ownership. |
| docs/schema-inventory.md | Added schema inventory from crawl and code sources. | Document structured-data coverage and verification needs. | Safer schema expansion and fewer unsupported claims. | Low | Yes for branch NAP/hours and expert credentials. |
| docs/content-priority-plan.md | Added 12 prioritized content briefs. | Capture high-value content gaps without publishing unreviewed medical content. | More useful answer-first content pipeline. | Low | Professional/owner review before publishing. |
| docs/owner-confirmations-needed.md | Added confirmation list for Sarajevo NAP, Tuzla hours, maps, legal facts, reviews, photos, and products. | Separate uncertain facts from safe code changes. | Prevents fake or unsupported local/medical claims. | Low | Yes. |
| docs/seo-aeo-geo-changelog.md | Added this implementation changelog. | Required delivery artifact. | Easier review and deployment decision-making. | Low | No. |
| scripts/seed.ts | Added Tuzla seed branch, Tuzla locative form, refreshed seeded homepage/global location wording. | Keep local build/CMS seed aligned with production footprint. | Correct sitemap/static generation and fewer stale defaults. | Medium | Sarajevo placeholders remain intentional. |
| src/lib/lokacije.ts | Added reusable helpers for branch count, city count, city descriptions, dynamic location-title text, and old-count normalization. | Centralize location wording instead of hard-coded six/seven strings. | Prevents future count drift across metadata/copy/llms. | Low | No. |
| src/lib/seo.ts | Removed hard-coded homepage fallback city list from brand description. | Avoid stale city omissions when branches change. | More durable default metadata. | Low | No. |
| src/app/sitemap.ts | Filtered actions to active date range and added product category pages. | Remove 404 action from sitemap and include indexable category URLs. | Better crawl budget and indexation quality. | Low | No. |
| src/app/(frontend)/savjeti/page.tsx | Added dynamic metadata and noindex for recognized category filter URLs. | Query-state pages duplicated the content hub. | Prevents duplicate metadata/indexation. | Low | No. |
| src/app/(frontend)/zakazivanje/page.tsx | Added dynamic metadata and noindex for branch preselect query URLs. | Booking query URLs are UI state, not standalone landing pages. | Prevents duplicate appointment pages in index. | Low | No. |
| src/app/(frontend)/page.tsx | Normalized CMS hero location count and made intro branch count data-driven. | Production homepage had mixed six/seven wording. | More accurate homepage entity/local signals. | Low | No. |
| src/app/(frontend)/poslovnice/page.tsx | Made metadata/title/intro derive from actual branch data. | Branch list page should reflect current cities automatically. | Stronger local SEO and future-proof copy. | Low | No. |
| src/app/(frontend)/kontakt/page.tsx | Made metadata dynamic and branch-count based. | Contact meta still referenced six branches. | More accurate SERP/contact snippet. | Low | No. |
| src/app/(frontend)/proizvodi/page.tsx | Made metadata dynamic and branch-count based. | Product meta still referenced six branches. | More accurate commercial snippet. | Low | No. |
| src/app/(frontend)/slusni-aparati/page.tsx | Made metadata use actual city description. | Avoid hard-coded city counts. | More durable hearing-aid page metadata. | Low | No. |
| src/app/(frontend)/usluge/page.tsx | Made metadata use actual city description. | Avoid hard-coded city counts. | More durable service page metadata. | Low | No. |
| src/app/(frontend)/o-nama/page.tsx | Made stats/meta/copy data-driven for branch and city counts. | About page had hard-coded six-branch claims. | Stronger trust/entity accuracy. | Low | No. |
| src/app/llms.txt/route.ts | Made llms summary and branch section use actual city data. | AI-readable summary must not drift from CMS. | More reliable AEO/GEO facts for crawlers. | Low | No. |
| src/components/layout/Podnozje.tsx | Footer city wording now derives from live branch data. | Footer propagated stale count text across every page. | Fixes sitewide local consistency. | Low | No. |
| src/globals/Pocetna.ts | Removed hard-coded six-city default hero subtitle. | New CMS installs should not start stale. | Safer future content defaults. | Low | No. |

## Validation

| Command / check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passed; dependencies installed from existing lockfile. |
| `pnpm typecheck` | Passed. |
| `pnpm build:local` | Passed; seeded SQLite DB, generated 93 static pages. |
| Local server | Running at `http://localhost:3000` against `audiobm-build.db`. |
| Playwright smoke check | Passed on desktop and mobile for home, Tuzla branch, service, category, article, booking, and online test pages. |
| JSON-LD parse check | Passed on representative pages; no schema parse errors. |
| Filter noindex check | Passed for `/savjeti?kategorija=savjeti` and `/zakazivanje?poslovnica=tuzla`. |
| Sitemap check | Passed; excludes `/akcije/blackfriday`, includes `/proizvodi/kategorija/baterije`, includes `/poslovnice/tuzla`. |
| Robots check | Passed; sitemap present, `/admin` disallowed. |

## Known Remaining Work

- Confirm Sarajevo address and phone before publishing or promoting Sarajevo local content.
- Confirm full Tuzla weekly opening hours before updating GBP and schema hours.
- Clean production CMS article `/savjeti/otvaranje-poslovnice-sarajevo` if it still contains address/phone placeholders.
- Run real Lighthouse/PageSpeed checks after deployment because the production CDN, CMS data, images, and analytics scripts can differ from the local build.
