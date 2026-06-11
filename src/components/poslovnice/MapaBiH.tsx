'use client'

import { m } from 'motion/react'
import Link from 'next/link'
import { useState } from 'react'

export type PinLokacija = {
  slug: string
  grad: string
  geoSirina?: number | null
  geoDuzina?: number | null
  novaPoslovnica?: boolean | null
}

// granice projekcije (BiH): lat 42.5–45.4, lng 15.6–19.7
const LAT = [42.5, 45.4]
const LNG = [15.6, 19.7]
const W = 640
const H = 560

const x = (lng: number) => ((lng - LNG[0]) / (LNG[1] - LNG[0])) * W
const y = (lat: number) => H - ((lat - LAT[0]) / (LAT[1] - LAT[0])) * H

// pojednostavljena kontura Bosne i Hercegovine (šematski prikaz)
const KONTURA: [number, number][] = [
  [45.06, 15.76], [45.18, 16.05], [45.21, 16.35], [45.1, 16.78], [45.16, 17.0],
  [45.13, 17.25], [45.16, 17.49], [45.08, 17.81], [45.1, 18.2], [44.93, 18.55],
  [44.86, 18.78], [44.91, 19.02], [44.86, 19.35], [44.55, 19.18], [44.35, 19.6],
  [44.05, 19.55], [43.95, 19.25], [43.57, 19.24], [43.32, 19.06], [43.18, 18.96],
  [42.95, 18.66], [42.73, 18.56], [42.56, 18.45], [42.65, 18.15], [42.89, 17.85],
  [42.92, 17.58], [43.08, 17.45], [43.25, 17.27], [43.4, 16.9], [43.62, 16.7],
  [43.87, 16.2], [44.2, 15.92], [44.42, 16.13], [44.72, 15.78], [44.88, 15.74],
]

/**
 * Šematska mapa BiH sa svim poslovnicama: pinovi „padaju" uz blagi odskok,
 * odabrani pin pulsira jednom; klik vodi na stranicu poslovnice.
 */
export function MapaBiH({ lokacije }: { lokacije: PinLokacija[] }) {
  const [aktivan, setAktivan] = useState<string | null>(null)
  const putanja = KONTURA.map(([la, ln], i) => `${i === 0 ? 'M' : 'L'}${x(ln).toFixed(1)},${y(la).toFixed(1)}`).join(' ') + ' Z'

  return (
    <figure className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Mapa Bosne i Hercegovine sa označenim Audio BM poslovnicama"
        className="w-full"
      >
        <path d={putanja} fill="var(--color-neutral-100)" stroke="var(--color-neutral-300)" strokeWidth="2" strokeLinejoin="round" />
        {lokacije
          .filter((l) => l.geoSirina && l.geoDuzina)
          .map((l, i) => {
            const px = x(l.geoDuzina!)
            const py = y(l.geoSirina!)
            const jeAktivan = aktivan === l.slug
            return (
              <Link key={l.slug} href={`/poslovnice/${l.slug}`} aria-label={`Poslovnica ${l.grad}`}>
                <m.g
                  initial={{ opacity: 0, y: -16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 18 }}
                  onMouseEnter={() => setAktivan(l.slug)}
                  onMouseLeave={() => setAktivan(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <m.circle
                    cx={px}
                    cy={py}
                    r="11"
                    fill="var(--color-brand-600)"
                    animate={jeAktivan ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ transformOrigin: `${px}px ${py}px` }}
                  />
                  <circle cx={px} cy={py} r="4.5" fill="white" />
                  <text
                    x={px}
                    y={py + 30}
                    textAnchor="middle"
                    className="fill-neutral-800"
                    style={{ fontSize: '17px', fontWeight: 600 }}
                  >
                    {l.grad}
                  </text>
                  {l.novaPoslovnica && (
                    <text
                      x={px}
                      y={py - 20}
                      textAnchor="middle"
                      className="fill-brand-600"
                      style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.08em' }}
                    >
                      NOVO
                    </text>
                  )}
                </m.g>
              </Link>
            )
          })}
      </svg>
      <figcaption className="mt-2 text-center text-small text-neutral-400">
        Šematski prikaz — kliknite na grad za detalje poslovnice
      </figcaption>
    </figure>
  )
}
