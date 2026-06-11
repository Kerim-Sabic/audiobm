'use client'

import Script from 'next/script'

/**
 * Nevidljivi Cloudflare Turnstile — učitava se samo kad je
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY podešen. [PLACEHOLDER: ključeve kreirati
 * na dash.cloudflare.com i upisati u .env]
 */
export function Turnstile() {
  const kljuc = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  if (!kljuc) return null
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      <div className="cf-turnstile" data-sitekey={kljuc} data-size="invisible" />
    </>
  )
}

/** Honeypot polje — ljudi ga ne vide, botovi ga popune. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Vaša web adresa (ne popunjavati)
        <input type="text" name="web_adresa" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  )
}
