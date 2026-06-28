import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  kategorijaProizvoda,
  putanjaProizvoda,
  type ManifestProduct,
} from './src/lib/catalog'

/** 301 preusmjeravanja sa starih Shopify adresa — nijedan stari link ne smije umrijeti. */
function legacyRedirects() {
  const staticne = [
    { source: '/pages/kontakt', destination: '/kontakt', permanent: true },
    { source: '/pages/rezervacije', destination: '/zakazivanje', permanent: true },
    { source: '/pages/sve-lokacije', destination: '/poslovnice', permanent: true },
    { source: '/pages/o-nama', destination: '/o-nama', permanent: true },
    { source: '/pages/kohlearni-implanti', destination: '/usluge/kohlearni-implanti', permanent: true },
    { source: '/pages/gradiska', destination: '/poslovnice/gradiska', permanent: true },
    { source: '/pages/doboj', destination: '/poslovnice/doboj', permanent: true },
    { source: '/pages/brcko', destination: '/poslovnice/brcko', permanent: true },
    { source: '/pages/bijeljina', destination: '/poslovnice/bijeljina', permanent: true },
    { source: '/pages/nevidljivi-slusni-aparati', destination: '/slusni-aparati/kanalni', permanent: true },
    { source: '/collections/slusni-aparati', destination: '/slusni-aparati', permanent: true },
    { source: '/collections/slusni-aparati-cijena', destination: '/cijene-i-finansiranje', permanent: true },
    { source: '/collections/slusni-aparati-nivo-1', destination: '/slusni-aparati', permanent: true },
    { source: '/collections/slusni-aparati-nivo-2', destination: '/slusni-aparati', permanent: true },
    { source: '/collections/slusni-aparati-nivo-3', destination: '/slusni-aparati', permanent: true },
    { source: '/collections/slusni-aparati-nivo-4', destination: '/slusni-aparati', permanent: true },
    { source: '/collections/cepovi-za-usi', destination: '/proizvodi/kategorija/cepovi-za-usi', permanent: true },
    { source: '/collections/baterije-za-slusne-aparate', destination: '/proizvodi/kategorija/baterije', permanent: true },
    { source: '/collections/pribor-za-slusne-aparate', destination: '/proizvodi/kategorija/pribor-i-odrzavanje', permanent: true },
    { source: '/collections/cepovi-pribor-baterije-budilnici', destination: '/proizvodi', permanent: true },
    { source: '/collections/kucni-medicinski-aparati', destination: '/proizvodi/kategorija/kucni-medicinski-aparati', permanent: true },
    { source: '/collections/antidekubit-duseci', destination: '/proizvodi/kategorija/kucni-medicinski-aparati', permanent: true },
    { source: '/collections/frontpage', destination: '/', permanent: true },
    { source: '/collections/fzo', destination: '/cijene-i-finansiranje', permanent: true },
    { source: '/collections/rfzo-odrasli', destination: '/cijene-i-finansiranje', permanent: true },
    // Cochlear / implanti kolekcije
    { source: '/collections/:path(baha-implanti|baha-procesor-zvuka|cochlear-baha-sistemi|cochlear-nucleus-sistemi|nucleus-implanti|nucleus-procesori-zvuka)', destination: '/usluge/kohlearni-implanti', permanent: true },
    // Profesionalna oprema — sve dijagnostičke kolekcije
    { source: '/collections/:path(audioloske-kabine|audiometri|dijagnosticka-oprema|dijagnosticke-vage|evocirani-potencijali|oae-abr-skrining|orl-radna-mesta|orl-stolice|timpanometri|endoskopski-sistemi|sterilizatori|sistem-za-vestibularni-aparat)', destination: '/proizvodi/kategorija/profesionalna-oprema', permanent: true },
    // Ostale naslijeđene kolekcije sa srpskog sajta
    { source: '/collections/:slug', destination: '/proizvodi', permanent: true },
    { source: '/blogs/:path*', destination: '/savjeti', permanent: true },
    { source: '/account', destination: '/', permanent: true },
    { source: '/cart', destination: '/proizvodi', permanent: true },
    {
      source: '/svijet-sluha-sarajevo-slusni-aparati-provjera-sluha',
      destination: '/savjeti/svijet-sluha-sarajevo-slusni-aparati-provjera-sluha',
      permanent: true,
    },
  ]

  let proizvodi: { source: string; destination: string; permanent: boolean }[] = []
  try {
    const manifest: ManifestProduct[] = JSON.parse(
      readFileSync(path.resolve(process.cwd(), 'products-manifest.json'), 'utf8'),
    )
    proizvodi = manifest.map((p) => ({
      source: `/products/${p.handle}`,
      destination: putanjaProizvoda(p),
      permanent: true,
    }))
    // provjera konzistentnosti mapiranja
    manifest.forEach((p) => void kategorijaProizvoda(p))
  } catch {
    console.warn('products-manifest.json nije pronađen — preusmjeravanja proizvoda preskočena')
  }

  return [...staticne, ...proizvodi]
}

const nextConfig: NextConfig = {
  // Ne odaje tehnologiju (uklanja „X-Powered-By: Next.js" zaglavlje).
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 768, 1080, 1440, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    qualities: [50, 60, 75, 85],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async redirects() {
    return legacyRedirects()
  },
}

export default withPayload(nextConfig)
