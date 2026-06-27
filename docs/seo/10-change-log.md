# 10 Change Log

| File changed | What changed | Why | Category | Risk | Owner confirmation | Rollback notes |
| --- | --- | --- | --- | --- | --- | --- |
| `package.json` | Added `seo:validate` script | Repeatable SEO checks | SEO/maintainability | Low | No | Remove script |
| `scripts/seo-validate.mjs` | Added sitemap, robots, noindex, JSON-LD and branch consistency validator | Required validation system | SEO/local/schema | Low | No | Remove file/script |
| `src/data/locations.ts` | Added public location facade | Centralize branch access without duplicating facts | Local SEO/data quality | Low | No | Revert imports |
| `src/app/sitemap.ts` | Uses facade, filters active actions, includes categories | Fix sitemap quality | Technical SEO | Low | No | Revert mapping |
| `src/app/(frontend)/savjeti/page.tsx` | Noindex recognized filters | Avoid duplicate query pages | Technical SEO | Low | No | Remove noindex |
| `src/app/(frontend)/zakazivanje/page.tsx` | Noindex branch preselect URLs and uses facade | Preserve UX without index bloat | SEO/conversion | Low | No | Revert metadata/facade |
| `src/app/(frontend)/page.tsx` | Dynamic count normalization and city count | Fix location inconsistency | Local SEO/data quality | Low | No | Revert helper use |
| `src/app/(frontend)/poslovnice/page.tsx` | Dynamic title/intro via facade | Keep local page current | Local SEO | Low | No | Revert static copy |
| `src/app/(frontend)/poslovnice/[slug]/page.tsx` | Uses facade for list/single lookup | Centralize branch route data | Local SEO/schema | Low | No | Revert imports |
| `src/app/(frontend)/kontakt/page.tsx` | Dynamic branch-count metadata and facade | Fix stale snippet | Local SEO/conversion | Low | No | Revert static metadata |
| `src/app/(frontend)/o-nama/page.tsx` | Dynamic branch stats | Fix stale trust copy | Data quality | Low | No | Revert static counts |
| `src/app/(frontend)/proizvodi/page.tsx` | Dynamic branch-count metadata | Fix stale product snippet | SEO/local | Low | No | Revert static metadata |
| `src/app/(frontend)/proizvodi/[slug]/page.tsx` | Product metadata uses shared product-description helper | Avoid duplicate product meta descriptions | SEO | Low | No | Revert helper call |
| `src/app/(frontend)/slusni-aparati/page.tsx` | Dynamic city metadata | Fix stale guide snippet | SEO/local | Low | No | Revert static metadata |
| `src/app/(frontend)/slusni-aparati/modeli/[slug]/page.tsx` | Hearing-aid model metadata uses shared product-description helper | Avoid duplicate product meta descriptions | SEO | Low | No | Revert helper call |
| `src/app/(frontend)/usluge/page.tsx` | Dynamic city metadata | Fix stale service snippet | SEO/local | Low | No | Revert static metadata |
| `src/app/(frontend)/online-test-sluha/page.tsx` | Uses facade for branch choices | Centralize branch choices | Conversion/data quality | Low | No | Revert import |
| `src/app/llms.txt/route.ts` | Uses facade/dynamic city summary | Keep AI-readable facts aligned | AEO/GEO | Low | No | Revert import |
| `src/components/layout/Zaglavlje.tsx` | Uses facade | Centralize sitewide count | Local SEO | Low | No | Revert import |
| `src/components/layout/Podnozje.tsx` | Uses facade and dynamic city wording | Fix sitewide footer drift | Local SEO | Low | No | Revert import |
| `src/lib/lokacije.ts` | Added count/wording helpers | Avoid hard-coded count drift | Maintainability | Low | No | Remove helper |
| `src/lib/seo.ts` | Removed hard-coded city list fallback and added product meta-description helper | Avoid stale metadata and duplicate product snippets | SEO/data quality | Low | No | Restore old fallback/helper logic |
| `src/globals/Pocetna.ts` | Replaced hard-coded six-city homepage default copy | Avoid stale seeded homepage text | Data quality | Low | No | Restore old default |
| `scripts/seed.ts` | Added Tuzla and refreshed defaults | Align local seed with production footprint | Local SEO/data quality | Medium | Sarajevo/Tuzla facts | Remove if branch inactive |
| `src/payload-types.ts` | Refreshed generated field description for inquiry recipient email | Keep generated types aligned with collection config | Maintainability | Low | No | Regenerate types |
| `README.md` | Updated placeholder wording from six branches to active branches | Avoid stale owner instructions | Documentation/data quality | Low | No | Revert wording |
| `docs/AEO-GEO-SEO-PLAYBOOK.md` | Updated branch-count references | Avoid stale local SEO operations text | Documentation/local SEO | Low | No | Revert wording |
| `docs/GOOGLE-BUSINESS-PROFILI.md` | Added Tuzla profile draft and owner warnings | Support manual local SEO setup | Documentation/local SEO | Low | Yes | Remove Tuzla section if inactive |
| `docs/KALENDAR-SADRZAJA-30-DANA.md` | Updated campaign copy from six to seven cities | Avoid stale social/article prompts | Documentation/content | Low | Yes | Revert wording |
| `docs/OGLASI-META-I-GOOGLE.md` | Updated ad targeting/copy from six to seven cities | Avoid stale campaign setup | Documentation/conversion | Low | Yes | Revert wording |
| `docs/STRATEGIJA-SVIJET-SLUHA.md` | Updated local strategy branch-count references | Keep strategy aligned with production footprint | Documentation/local SEO | Low | Yes | Revert wording |
| `docs/seo/*` | Added required audit deliverables | Document baseline, roadmap and operations | Documentation | Low | Some items | Supersede docs |
