import type { MetadataRoute } from 'next'
import { BREND } from '@/lib/brend'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BREND.naziv} — slušni aparati i provjera sluha`,
    short_name: BREND.naziv,
    description:
      'Besplatna provjera sluha i slušni aparati — u saradnji s Audio BM, više od 30 godina povjerenja u Bosni i Hercegovini.',
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    lang: 'bs',
    icons: [
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/brand/icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
