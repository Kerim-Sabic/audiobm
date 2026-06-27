# 09 Prioritized Roadmap

Method: Impact × Confidence ÷ Effort, grouped by tier.

| Tier | Issue | Evidence | Recommended action | Impact | Effort | Confidence | Owner dependency | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P0 | Sarajevo NAP missing | Placeholder source and omitted schema fields | Confirm/update CMS | Critical local trust | S | High | Yes | Open |
| P0 | Sitemap 404 and missing categories | Production crawl | Deploy sitemap fixes | Indexation | S | High | No | Implemented |
| P0 | Query-state duplicate indexing | Production crawl | Noindex filter/preselect URLs | Index quality | S | High | No | Implemented |
| P0 | Sarajevo article placeholders | Production crawl/manual evidence | Edit or unpublish CMS article | Trust | S | High | Yes | Open |
| P1 | Tuzla hours incomplete | Only partial hours verified | Confirm/update weekly hours | Local SEO | S | High | Yes | Open |
| P1 | Location data drift risk | Previous six/seven mismatch | Use `src/data/locations.ts` facade | Data quality | S | High | No | Implemented |
| P1 | Repeatable SEO validation | New mission requires validation system | Run `pnpm seo:validate` on local/preview builds | Regression control | S | High | No | Implemented |
| P1 | Core hearing-aid content depth | High-value query | Improve `/slusni-aparati` answer-first sections | Organic/AEO | M | High | Review | Planned |
| P1 | Price/refund guidance | High-intent query | Improve `/cijene-i-finansiranje` and supporting article | Conversion | M | Medium | Yes | Planned |
| P1 | Google Business Profiles | Manual local authority gap | Claim/optimize 7 real branches | Local pack | M | High | Yes | Manual |
| P2 | Reviewer model | Health-adjacent content | Add real author/reviewer fields after credentials | Trust | L | Medium | Yes | Planned |
| P2 | Product/category copy | Duplicate descriptions | Rewrite buyer summaries/meta | Long-tail SEO | L | Medium | Product facts | Planned |
| P2 | Branch photos/local FAQs | Competitor gap | Add real photos/FAQs per branch | Local conversion | M | Medium | Yes | Planned |
| P3 | WebPage/ImageObject schema | Nice-to-have | Add only where visible content supports it | Minor schema clarity | M | Medium | No | Future |
