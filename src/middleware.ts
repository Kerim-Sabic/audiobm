import { NextResponse } from 'next/server'

/**
 * Uklanja „X-Powered-By" zaglavlje sa javnih stranica (Next.js i Payload ga
 * dodaju) — ne odaje tehnologiju i prolazi SEO/sigurnosne provjere.
 * Payload rute (/api, /admin) i statika su isključene matcher-om.
 */
export function middleware() {
  const odgovor = NextResponse.next()
  odgovor.headers.delete('x-powered-by')
  return odgovor
}

export const config = {
  matcher: ['/((?!api|admin|_next/static|_next/image|favicon.ico|brand|media).*)'],
}
