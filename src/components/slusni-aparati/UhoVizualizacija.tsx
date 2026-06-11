'use client'

import dynamic from 'next/dynamic'
import React, { Component, useEffect, useState, type ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { DugmeLink } from '@/components/ui/Dugme'
import type { Faza3D } from './UhoScena3D'

const UhoScena3DDyn = dynamic(() => import('./UhoScena3D'), { ssr: false, loading: () => null })

type Faza = Faza3D

const FAZE: { id: Faza; broj: number; naslov: string; opis: string }[] = [
  {
    id: 'zvuk',
    broj: 1,
    naslov: 'Mikrofon hvata zvuk',
    opis: 'Osjetljivi mikrofoni na vrhu aparata hvataju govor i zvukove oko Vas — i one tihe koje uho više ne čuje samo.',
  },
  {
    id: 'obrada',
    broj: 2,
    naslov: 'Procesor čisti govor i smanjuje buku',
    opis: 'Procesor hiljade puta u sekundi pojačava govor, a stišava pozadinsku buku — podešen tačno prema Vašem nalazu sluha.',
  },
  {
    id: 'razumijevanje',
    broj: 3,
    naslov: 'Jasan zvuk ide u ušni kanal',
    opis: 'Obrađeni zvuk tankom žicom stiže do zvučnika u ušnom kanalu: razgovori postaju jasniji, televizor tiši, a Vi ponovo u toku.',
  },
]

/* putanje signala u SVG prikazu (viewBox 0 0 720 440) */
const PUT_ZVUK = 'M 95 150 C 220 80, 400 48, 538 92'
const PUT_OBRADA = 'M 546 104 L 546 156'
const PUT_UHO = 'M 543 96 C 532 56, 470 50, 440 80 C 414 104, 404 160, 403 230 C 452 250, 512 272, 562 292 C 580 298, 592 300, 600 302'

/** Granica greške oko 3D platna — svaka greška renderovanja vraća SVG prikaz. */
class GranicaGreske3D extends Component<{ onGreska: () => void; children: ReactNode }, { puklo: boolean }> {
  state = { puklo: false }
  static getDerivedStateFromError() {
    return { puklo: true }
  }
  componentDidCatch() {
    this.props.onGreska()
  }
  render() {
    return this.state.puklo ? null : this.props.children
  }
}

/** Tačke koje putuju aktivnim segmentom signala (CSS offset-path, SVG prikaz). */
function PutujuceTacke({ putanja, boja = '#ED1C24', broj = 3, trajanje = 2.4 }: {
  putanja: string
  boja?: string
  broj?: number
  trajanje?: number
}) {
  return (
    <>
      {Array.from({ length: broj }).map((_, i) => (
        <circle
          key={i}
          r="4.5"
          fill={boja}
          opacity="0"
          className="putujuca-tacka"
          style={{
            offsetPath: `path('${putanja}')`,
            animationDuration: `${trajanje}s`,
            animationDelay: `${(i * trajanje) / broj}s`,
          }}
        />
      ))}
    </>
  )
}

/** Statički/animirani SVG prikaz — SSR sadržaj, reduced-motion i WebGL fallback. */
function IlustracijaSVG({ faza, setFaza }: { faza: Faza; setFaza: (f: Faza) => void }) {
  const aktivnaBoja = (f: Faza, aktivno: string, neaktivno: string) => (faza === f ? aktivno : neaktivno)

  return (
    <svg
      viewBox="0 0 720 440"
      role="img"
      aria-label="Prikaz rada slušnog aparata: mikrofon hvata zvuk, procesor ga obrađuje, čist zvuk tankom žicom ide u ušni kanal do unutrašnjeg uha"
      className="relative h-full w-full"
    >
      <defs>
        <linearGradient id="uhoAparat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#79726C" />
          <stop offset="100%" stopColor="#57534E" />
        </linearGradient>
        <filter id="uhoSjena" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#1C1917" floodOpacity="0.14" />
        </filter>
      </defs>

      <g
        stroke={aktivnaBoja('zvuk', '#ED1C24', '#D7D3D0')}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
        style={{ transition: 'stroke 250ms' }}
      >
        <path d="M104 122 a 34 38 0 0 1 0 64" opacity="0.95" />
        <path d="M84 106 a 52 58 0 0 1 0 98" opacity="0.55" />
        <path d="M64 90 a 72 80 0 0 1 0 130" opacity="0.3" />
      </g>

      <path
        d={PUT_ZVUK}
        fill="none"
        stroke={aktivnaBoja('zvuk', '#F7999C', '#E8E5E3')}
        strokeWidth="2"
        strokeDasharray="2 8"
        strokeLinecap="round"
        style={{ transition: 'stroke 250ms' }}
      />
      {faza === 'zvuk' && <PutujuceTacke putanja={PUT_ZVUK} />}

      <g fill="none" stroke="#C9BFB7" strokeWidth="3" strokeLinecap="round" filter="url(#uhoSjena)">
        <path
          d="M 398 332 C 360 318, 342 272, 348 222 C 354 168, 382 126, 428 112 C 474 99, 514 124, 519 170 C 523 206, 508 234, 489 257 C 472 277, 460 298, 451 318 C 442 338, 416 344, 398 332 Z"
          fill="#FAF6F3"
        />
      </g>
      <g fill="none" stroke="#C9BFB7" strokeWidth="2.5" strokeLinecap="round">
        <path d="M 384 240 C 380 198, 396 158, 432 146 C 463 136, 490 152, 494 184" />
        <path d="M 402 256 C 392 244, 392 226, 402 214" />
      </g>

      <path
        d="M 403 236 C 452 252, 512 272, 562 292"
        fill="none"
        stroke={aktivnaBoja('razumijevanje', '#F7999C', '#E8E5E3')}
        strokeWidth="16"
        strokeLinecap="round"
        opacity="0.55"
        style={{ transition: 'stroke 250ms' }}
      />

      <path
        d="M 612 282 a 26 26 0 1 1 -26 26 a 19 19 0 1 0 19 -19 a 12 12 0 1 1 -12 12 a 5 5 0 1 0 5 -5"
        fill="none"
        stroke={aktivnaBoja('razumijevanje', '#ED1C24', '#A9A39E')}
        strokeWidth="5.5"
        strokeLinecap="round"
        style={{ transition: 'stroke 250ms' }}
      />

      <path
        d="M 543 96 C 532 56, 470 50, 440 80 C 414 104, 404 160, 403 230"
        fill="none"
        stroke={aktivnaBoja('razumijevanje', '#ED1C24', '#79726C')}
        strokeWidth="3.5"
        strokeLinecap="round"
        style={{ transition: 'stroke 250ms' }}
      />
      <ellipse
        cx="403"
        cy="236"
        rx="9"
        ry="12"
        fill={aktivnaBoja('razumijevanje', '#F03C43', '#A9A39E')}
        style={{ transition: 'fill 250ms' }}
      />

      <g filter="url(#uhoSjena)">
        <rect x="528" y="92" width="36" height="112" rx="18" fill="url(#uhoAparat)" />
        <g stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.85">
          <line x1="538" y1="104" x2="554" y2="104" />
          <line x1="538" y1="111" x2="554" y2="111" />
        </g>
        <rect
          x="537"
          y="148"
          width="18"
          height="26"
          rx="3"
          fill={aktivnaBoja('obrada', '#ED1C24', '#44403C')}
          stroke="white"
          strokeWidth="1.5"
          style={{ transition: 'fill 250ms' }}
        />
        <g stroke="white" strokeWidth="1.2" opacity="0.8">
          <line x1="541" y1="154" x2="551" y2="154" />
          <line x1="541" y1="160" x2="551" y2="160" />
          <line x1="541" y1="166" x2="551" y2="166" />
        </g>
      </g>
      {faza === 'obrada' && (
        <>
          <circle cx="546" cy="161" r="26" fill="none" stroke="#ED1C24" strokeWidth="2" className="prsten-puls" />
          <PutujuceTacke putanja={PUT_OBRADA} broj={2} trajanje={1.4} />
        </>
      )}
      {faza === 'razumijevanje' && <PutujuceTacke putanja={PUT_UHO} broj={4} trajanje={3} />}

      {[
        { f: 'zvuk' as Faza, x: 596, y: 98, oznaka: 'Mikrofon', lx: 566, ly: 104 },
        { f: 'obrada' as Faza, x: 608, y: 170, oznaka: 'Procesor', lx: 558, ly: 164 },
        { f: 'razumijevanje' as Faza, x: 648, y: 360, oznaka: 'Unutrašnje uho', lx: 618, ly: 322 },
      ].map((m, i) => (
        <g
          key={m.f}
          role="button"
          tabIndex={0}
          aria-label={`Faza ${i + 1}: ${m.oznaka}`}
          onClick={() => setFaza(m.f)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setFaza(m.f)
          }}
          style={{ cursor: 'pointer' }}
        >
          <circle cx={m.x} cy={m.y} r="34" fill="transparent" />
          <line x1={m.lx} y1={m.ly} x2={m.x - 13} y2={m.y - 4} stroke="#D7D3D0" strokeWidth="1.5" />
          <circle
            cx={m.x}
            cy={m.y}
            r="14"
            fill={faza === m.f ? '#ED1C24' : 'white'}
            stroke={faza === m.f ? '#ED1C24' : '#D7D3D0'}
            strokeWidth="2"
            style={{ transition: 'fill 250ms, stroke 250ms' }}
          />
          <text
            x={m.x}
            y={m.y + 4.5}
            textAnchor="middle"
            fontSize="13"
            fontWeight="800"
            fill={faza === m.f ? 'white' : '#79726C'}
            style={{ transition: 'fill 250ms', pointerEvents: 'none' }}
          >
            {i + 1}
          </text>
          <text
            x={m.x}
            y={m.y + 32}
            textAnchor="middle"
            fontSize="11.5"
            fontWeight="600"
            fill={faza === m.f ? '#BF181E' : '#A9A39E'}
            style={{ transition: 'fill 250ms', pointerEvents: 'none' }}
          >
            {m.oznaka}
          </text>
        </g>
      ))}
    </svg>
  )
}

/* pozicije 3D oznaka faza u procentima platna (fiksna kamera → stabilne) */
const OZNAKE_3D: { f: Faza; broj: number; oznaka: string; left: string; top: string }[] = [
  { f: 'zvuk', broj: 1, oznaka: 'Mikrofon', left: '67%', top: '9%' },
  { f: 'obrada', broj: 2, oznaka: 'Procesor', left: '85%', top: '38%' },
  { f: 'razumijevanje', broj: 3, oznaka: 'Unutrašnje uho', left: '86%', top: '82%' },
]

/**
 * Interaktivni edukativni modul: kako slušni aparat (RITE) obrađuje zvuk.
 * Progresivno poboljšanje: SVG prikaz je osnovni sadržaj (SSR, reduced-motion,
 * uređaji bez WebGL-a); 3D scena se montira tek kad je WebGL provjeren, a
 * svaka greška platna trajno vraća SVG. Bez pomjeranja rasporeda — oba
 * prikaza žive u istom omjeru 720:440.
 */
export function UhoVizualizacija() {
  const [faza, setFaza] = useState<Faza>('zvuk')
  const [nacin, setNacin] = useState<'svg' | '3d'>('svg')
  const [scenaSpremna, setScenaSpremna] = useState(false)

  useEffect(() => {
    // 3D samo uz WebGL i bez zahtjeva za smanjenim animacijama
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const c = document.createElement('canvas')
      const gl = c.getContext('webgl2') ?? c.getContext('webgl')
      if (gl) setNacin('3d')
    } catch {
      /* ostaje SVG */
    }
  }, [])

  const naGresku3D = () => {
    setNacin('svg')
    setScenaSpremna(false)
  }

  return (
    <div className="povrsina overflow-hidden !rounded-[28px]">
      <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
        {/* ——— prikaz ——— */}
        <figure className="relative border-b border-neutral-200/70 bg-gradient-to-br from-white to-neutral-50 p-4 sm:p-6 lg:border-r lg:border-b-0">
          <div className="mreza-audiogram absolute inset-0" aria-hidden />
          <div className="relative aspect-[720/440] w-full">
            {/* SVG je uvijek prisutan dok 3D ne preuzme — nema praznog platna */}
            {(nacin === 'svg' || !scenaSpremna) && <IlustracijaSVG faza={faza} setFaza={setFaza} />}

            {nacin === '3d' && (
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{ opacity: scenaSpremna ? 1 : 0 }}
              >
                <GranicaGreske3D onGreska={naGresku3D}>
                  <UhoScena3DDyn faza={faza} onGreska={naGresku3D} onSpremno={() => setScenaSpremna(true)} />
                </GranicaGreske3D>
                {/* oznake faza preko 3D platna */}
                {scenaSpremna &&
                  OZNAKE_3D.map((m) => (
                    <button
                      key={m.f}
                      type="button"
                      onClick={() => setFaza(m.f)}
                      aria-label={`Faza ${m.broj}: ${m.oznaka}`}
                      className="absolute grid -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center p-2.5"
                      style={{ left: m.left, top: m.top }}
                    >
                      <span
                        className={`grid size-7 place-items-center rounded-full border-2 text-[12.5px] font-extrabold shadow-sm transition-colors duration-250 ${
                          faza === m.f
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-neutral-300 bg-white text-neutral-600'
                        }`}
                      >
                        {m.broj}
                      </span>
                      <span
                        className={`mt-1 text-[10.5px] font-semibold whitespace-nowrap transition-colors duration-250 ${
                          faza === m.f ? 'text-brand-700' : 'text-neutral-400'
                        }`}
                      >
                        {m.oznaka}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
          <figcaption className="sr-only">
            Zvučni talasi ulaze u mikrofon na vrhu aparata, procesor ih obrađuje i pojačan, čist zvuk
            se tankom žicom prenosi do zvučnika u ušnom kanalu i dalje do unutrašnjeg uha.
          </figcaption>
        </figure>

        {/* ——— faze ——— */}
        <div className="p-6 md:p-8">
          <p className="nadnaslov">Interaktivni prikaz</p>
          <h3 className="text-h3 mt-2.5">Kako slušni aparat radi?</h3>
          <div className="mt-5 space-y-2.5" role="tablist" aria-label="Faze rada slušnog aparata">
            {FAZE.map((f) => {
              const aktivna = faza === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={aktivna}
                  onClick={() => setFaza(f.id)}
                  className={`block w-full cursor-pointer rounded-[16px] border p-4 text-left transition-[border-color,background-color,box-shadow] duration-250 ${
                    aktivna
                      ? 'border-brand-300 bg-white shadow-[var(--shadow-lift)]'
                      : 'border-neutral-200 bg-white/60 hover:bg-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full text-[14px] font-extrabold transition-colors duration-250 ${
                        aktivna ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {f.broj}
                    </span>
                    <span className={`font-bold ${aktivna ? 'text-brand-700' : 'text-neutral-900'}`}>
                      {f.naslov}
                    </span>
                  </span>
                  <span
                    className="grid transition-[grid-template-rows] duration-250"
                    style={{ gridTemplateRows: aktivna ? '1fr' : '0fr' }}
                  >
                    <span className="overflow-hidden">
                      <span className="mt-2 block pl-11 text-[15px] text-neutral-600">{f.opis}</span>
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA pojas */}
      <div className="flex flex-col items-start justify-between gap-4 border-t border-neutral-200/70 bg-neutral-50/60 px-6 py-5 sm:flex-row sm:items-center md:px-8">
        <p className="font-semibold text-neutral-800">
          Ne morate sami birati aparat — dođite na besplatno savjetovanje.
        </p>
        <DugmeLink href="/zakazivanje" velicina="malo" className="shrink-0">
          Zakažite besplatno savjetovanje <ArrowRight className="size-4" aria-hidden />
        </DugmeLink>
      </div>
    </div>
  )
}
