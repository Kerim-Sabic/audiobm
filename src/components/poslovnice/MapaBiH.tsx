'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BIH_H, BIH_PUTANJA, BIH_W, projekcija } from './bihKontura'

export type PinLokacija = {
  slug: string
  grad: string
  geoSirina?: number | null
  geoDuzina?: number | null
  novaPoslovnica?: boolean | null
}

/**
 * Tačna mapa Bosne i Hercegovine (stvarna GeoJSON granica) sa pinovima
 * poslovnica: klik vodi na stranicu poslovnice, prelaz ističe pin.
 */
export function MapaBiH({ lokacije }: { lokacije: PinLokacija[] }) {
  const [aktivan, setAktivan] = useState<string | null>(null)

  return (
    <figure className="relative">
      <svg
        viewBox={`0 0 ${BIH_W} ${BIH_H}`}
        role="img"
        aria-label="Mapa Bosne i Hercegovine sa označenim Audio BM poslovnicama"
        className="w-full"
      >
        <defs>
          <linearGradient id="bihIspuna" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FAF9F8" />
            <stop offset="100%" stopColor="#F0EDEA" />
          </linearGradient>
          <filter id="bihSjena" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#1C1917" floodOpacity="0.10" />
          </filter>
        </defs>

        <path
          d={BIH_PUTANJA}
          fill="url(#bihIspuna)"
          stroke="#D7D3D0"
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#bihSjena)"
        />

        {lokacije
          .filter((l) => l.geoSirina && l.geoDuzina)
          .map((l, i) => {
            const { x, y } = projekcija(l.geoSirina!, l.geoDuzina!)
            const jeAktivan = aktivan === l.slug
            return (
              <Link key={l.slug} href={`/poslovnice/${l.slug}`} aria-label={`Poslovnica ${l.grad}`}>
                <g
                  data-otkrij
                  className="otkrij-vidljivo cursor-pointer"
                  style={{ transitionDelay: `${i * 80}ms` }}
                  onMouseEnter={() => setAktivan(l.slug)}
                  onMouseLeave={() => setAktivan(null)}
                  onFocus={() => setAktivan(l.slug)}
                  onBlur={() => setAktivan(null)}
                >
                  {/* puls prsten oko aktivnog pina */}
                  {jeAktivan && (
                    <circle cx={x} cy={y} r="22" fill="none" stroke="#ED1C24" strokeWidth="2" className="prsten-puls" />
                  )}
                  {/* kapljica pina */}
                  <g
                    style={{
                      transform: jeAktivan ? 'translateY(-3px)' : undefined,
                      transition: 'transform 250ms cubic-bezier(0.22,1,0.36,1)',
                    }}
                  >
                    <path
                      d={`M${x} ${y} c -10 -12, -15 -18, -15 -27 a 15 15 0 1 1 30 0 c 0 9 -5 15 -15 27 Z`}
                      fill={jeAktivan ? '#BF181E' : '#ED1C24'}
                      stroke="white"
                      strokeWidth="2.5"
                    />
                    <circle cx={x} cy={y - 27} r="6" fill="white" />
                  </g>
                  {/* naziv grada */}
                  <text
                    x={x}
                    y={y + 22}
                    textAnchor="middle"
                    style={{ fontSize: '19px', fontWeight: 700, fill: '#44403C' }}
                  >
                    {l.grad}
                  </text>
                  {l.novaPoslovnica && (
                    <g>
                      <rect x={x - 26} y={y - 66} rx="10" width="52" height="21" fill="#ED1C24" />
                      <text
                        x={x}
                        y={y - 51}
                        textAnchor="middle"
                        style={{ fontSize: '12px', fontWeight: 800, fill: 'white', letterSpacing: '0.08em' }}
                      >
                        NOVO
                      </text>
                    </g>
                  )}
                </g>
              </Link>
            )
          })}
      </svg>
      <figcaption className="text-small mt-3 text-center text-neutral-400">
        Kliknite na grad za detalje poslovnice
      </figcaption>
    </figure>
  )
}
