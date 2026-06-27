# 00 Executive Baseline

Production crawl: `2026-06-27T16:46:18.887Z`
Production site: `https://svijetsluha.com`

## Stack Summary

- Next.js `16.2.9`, App Router, React `19.2.7`, Payload CMS `3.85.1`.
- Hybrid rendering: static public pages, generated dynamic pages, dynamic admin/API/form routes.
- CMS source: Payload collections/globals; public branch access is now routed through `src/data/locations.ts`.
- Metadata and canonical helpers live in `src/lib/seo.ts`; sitemap and robots use App Router metadata routes.
- JSON-LD helpers cover Organization, WebSite, BreadcrumbList, LocalBusiness/MedicalClinic, Service, Product, FAQPage and Article.
- Forms/conversions: appointment, contact, online hearing test, phone links and product enquiries.
- Analytics readiness exists through CMS-configured Plausible/GA4, but event tracking needs implementation.

## Major Risks

- Critical: Sarajevo branch is live but exact address and phone are not verified in source/CMS.
- High: Tuzla is live with address/phone, but full weekly hours are not verified.
- High: production baseline had mixed six/seven location wording.
- High: production sitemap included `/akcije/blackfriday` as a 404 and missed product category URLs.
- Medium: product metadata/copy has duplicated catalog-style descriptions.
- Medium: health-adjacent content lacks verified author/reviewer structure.
- Medium: conversion analytics events are planned but not wired.

## Findings

- Crawl discovered 99 public/internal URLs: 98 returned 200 and 1 returned 404.
- Robots allowed public crawling and disallowed `/admin` and `/api`.
- Redirects were healthy for HTTP to HTTPS, www to apex, and trailing slash normalization.
- JSON-LD parsed without syntax errors in the production crawl.
- Query-state URLs for `/savjeti` and `/zakazivanje` were indexable duplicates in production baseline.
- Product category URLs were useful and indexable, but absent from production sitemap.

## Highest-Impact Opportunities

1. Confirm Sarajevo NAP and Tuzla full hours.
2. Deploy sitemap and query noindex fixes.
3. Keep branch/city counts driven by `src/data/locations.ts`.
4. Add analytics events for booking, calls, directions, forms and online test completion.
5. Improve answer-first content for hearing-aid choice, price factors, first visit and service.
6. Optimize Google Business Profiles for all real branches.
7. Add professional reviewer data only after credentials are verified.

Known unknowns are tracked in `03-owner-confirmations-needed.md`.
