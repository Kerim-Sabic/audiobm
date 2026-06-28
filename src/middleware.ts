import { NextResponse, type NextRequest } from 'next/server'
import { dajKategorijuObjave } from '@/lib/objave'

/**
 * Uklanja „X-Powered-By" zaglavlje sa javnih stranica (Next.js i Payload ga
 * dodaju) — ne odaje tehnologiju i prolazi SEO/sigurnosne provjere.
 * Payload rute (/api, /admin) i statika su isključene matcher-om.
 */
export function middleware(request: NextRequest) {
  const odgovor = NextResponse.next()
  odgovor.headers.delete('x-powered-by')

  const { pathname, searchParams } = request.nextUrl
  const jeFiltriranaSavjetiStranica =
    pathname === '/savjeti' && Boolean(dajKategorijuObjave(searchParams.get('kategorija')))
  const jeFiltriranoZakazivanje = pathname === '/zakazivanje' && searchParams.has('poslovnica')

  if (jeFiltriranaSavjetiStranica || jeFiltriranoZakazivanje) {
    odgovor.headers.set('X-Robots-Tag', 'noindex, follow')
  }

  return odgovor
}

export const config = {
  matcher: ['/((?!api|admin|_next/static|_next/image|favicon.ico|brand|media).*)'],
}
