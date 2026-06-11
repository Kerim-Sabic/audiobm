import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { inter } from '@/fonts'
import { MotionProvider } from '@/components/motion/MotionProvider'
import { Zaglavlje } from '@/components/layout/Zaglavlje'
import { Podnozje } from '@/components/layout/Podnozje'
import { LjepljivaTraka } from '@/components/layout/LjepljivaTraka'
import { dajPodesavanja } from '@/lib/podaci'
import { OSNOVNI_URL, organizacijaJsonLd } from '@/lib/seo'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const podesavanja = await dajPodesavanja()
  return {
    metadataBase: new URL(OSNOVNI_URL),
    title: {
      default: podesavanja.seoNaslov ?? 'Audio BM — Slušni aparati i besplatna provjera sluha',
      template: '%s — Audio BM',
    },
    description:
      podesavanja.seoOpis ??
      'Više od 30 godina povjerenja. Besplatna provjera sluha u Sarajevu, Banjoj Luci, Gradišci, Bijeljini, Doboju i Brčkom.',
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
  const podesavanja = await dajPodesavanja()

  // data-scroll-behavior: Next privremeno gasi CSS smooth-scroll pri promjeni
  // rute, pa nova stranica počinje od vrha bez „dovlačenja" preko cijele dužine
  return (
    <html lang="bs" className={inter.variable} data-scroll-behavior="smooth">
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizacijaJsonLd()) }}
        />
        {podesavanja.plausibleDomena && (
          <Script
            defer
            data-domain={podesavanja.plausibleDomena}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
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
