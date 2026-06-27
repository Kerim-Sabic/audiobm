# 04 Schema Inventory

Production crawl parsed JSON-LD without syntax errors.

| Schema | Pages using it | Source data/code | Visible support | Status |
| --- | --- | --- | --- | --- |
| Organization | Sitewide | `layout.tsx`, `src/lib/seo.ts` | Brand, Audio BM relationship, social links when configured | Valid; legal wording needs owner confirmation |
| WebSite | Sitewide | `layout.tsx`, `src/lib/seo.ts` | Site name and canonical URL | Valid |
| BreadcrumbList/ListItem | Most inner pages | `src/components/ui/Mrvice.tsx` | Visible breadcrumbs | Valid |
| LocalBusiness/MedicalClinic | 7 branch pages | `poslovnice/[slug]`, `src/data/locations.ts`, Poslovnice CMS | Branch NAP and CTA | Valid syntax; Sarajevo NAP and Tuzla hours need confirmation |
| Service | 3 service pages | `usluge/[slug]`, Usluge CMS | Visible service content | Valid |
| Product | Product/model pages | Product templates, Proizvodi CMS | Product title/description/image | Valid; descriptions need content review |
| Offer | Conditional | `proizvodJsonLd` | Only when price exists | Keep conditional; no fake prices |
| FAQPage/Question/Answer | Home and FAQ | Visible FAQ blocks | Visible Q&A | Valid |
| Article | Advice posts | `savjeti/[slug]`, Objave CMS | Title, excerpt, body/date | Add reviewer only after credentials verified |
| Person/ItemList | Team page where available | Tim CMS | Visible team data | Do not expand medical credentials without proof |

Validation command added: `pnpm seo:validate`. It checks sitemap, robots, query noindex, representative JSON-LD and branch consistency on a running build.
