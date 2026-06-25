import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { inter } from '@/fonts'
import { MotionProvider } from '@/components/motion/MotionProvider'
import { Zaglavlje } from '@/components/layout/Zaglavlje'
import { Podnozje } from '@/components/layout/Podnozje'
import { LjepljivaTraka } from '@/components/layout/LjepljivaTraka'
import { AtribucijaZapis } from '@/components/ui/AtribucijaZapis'
import { dajPodesavanja, dajOcjenu } from '@/lib/podaci'
import { OSNOVNI_URL, organizacijaJsonLd, webSiteJsonLd } from '@/lib/seo'
import { BREND } from '@/lib/brend'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const podesavanja = await dajPodesavanja()
  return {
    metadataBase: new URL(OSNOVNI_URL),
    title: {
      default: podesavanja.seoNaslov ?? `${BREND.naziv} — slušni aparati i besplatna provjera sluha`,
      template: `%s — ${BREND.naziv}`,
    },
    description:
      podesavanja.seoOpis ??
      'Svijet Sluha — besplatna provjera sluha i slušni aparati vodećih svjetskih brendova, uz više od 30 godina povjerenja. Posjetite nas u Sarajevu, Banjoj Luci, Gradišci, Bijeljini, Doboju ili Brčkom.',
    icons: {
      icon: [
        { url: '/brand/favicon.svg', type: 'image/svg+xml' },
        { url: '/brand/icon-32.png', sizes: '32x32', type: 'image/png' },
        { url: '/brand/icon-16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: [{ url: '/brand/icon-180.png', sizes: '180x180' }],
    },
    manifest: '/manifest.webmanifest',
  }
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export default async function KorijenskiRaspored({ children }: { children: React.ReactNode }) {
  const [podesavanja, ocjena] = await Promise.all([dajPodesavanja(), dajOcjenu()])

  // Zvanični profili za Organization „sameAs" — pomaže Google/AI da poveže entitet.
  const sameAs = [podesavanja.facebook, podesavanja.instagram, podesavanja.youtube].filter(
    (v): v is string => typeof v === 'string' && v.length > 0,
  )

  // data-scroll-behavior: Next privremeno gasi CSS smooth-scroll pri promjeni
  // rute, pa nova stranica počinje od vrha bez „dovlačenja" preko cijele dužine
  return (
    <html lang="bs" className={inter.variable} data-scroll-behavior="smooth">
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizacijaJsonLd({ sameAs, ocjena })) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd()) }}
        />
        {podesavanja.plausibleDomena && (
          <Script
            defer
            data-domain={podesavanja.plausibleDomena}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
        {podesavanja.gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${podesavanja.gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${podesavanja.gaMeasurementId}')`}
            </Script>
          </>
        )}
        <AtribucijaZapis />
        <MotionProvider>
          <Zaglavlje />
          <main id="sadrzaj" className="flex-1">
            {children}
          </main>
          <Podnozje />
          <LjepljivaTraka telefon={podesavanja.telefonGlavni ?? undefined} />
        </MotionProvider>
      </body>
    </html>
  )
}
