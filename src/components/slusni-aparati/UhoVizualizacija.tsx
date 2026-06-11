'use client'

import { useState } from 'react'

type Faza = 'zvuk' | 'obrada' | 'razumijevanje'

const FAZE: Record<Faza, { naslov: string; opis: string }> = {
  zvuk: {
    naslov: '1. Mikrofon hvata zvuk',
    opis: 'Sitni mikrofoni hvataju govor i zvukove oko Vas — i one tihe koje uho više ne čuje samo.',
  },
  obrada: {
    naslov: '2. Procesor pojačava ono što Vam treba',
    opis: 'Računar u aparatu hiljade puta u sekundi pojačava govor, a stišava buku — svaki aparat se podešava tačno prema Vašem sluhu.',
  },
  razumijevanje: {
    naslov: '3. Čist zvuk ide u uho',
    opis: 'Obrađeni zvuk stiže u ušni kanal: razgovori postaju jasniji, televizor tiši, a Vi ponovo u toku.',
  },
}

/**
 * Animirana vizualizacija rada slušnog aparata: zvučni talasi → aparat →
 * unutrašnje uho. Klik na fazu ističe odgovarajući dio ilustracije.
 * Uz prefers-reduced-motion sve dekorativne animacije nestaju (CSS).
 */
export function UhoVizualizacija() {
  const [faza, setFaza] = useState<Faza>('zvuk')

  const aktivnoUho = faza === 'razumijevanje'
  const aktivanAparat = faza === 'obrada'
  const aktivniTalasi = faza === 'zvuk'

  return (
    <div className="grid items-center gap-8 overflow-hidden rounded-[24px] border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-brand-50/40 p-6 shadow-[var(--shadow-lift)] md:grid-cols-[1.15fr_1fr] md:p-10">
      <figure className="relative">
        <svg
          viewBox="0 0 440 330"
          role="img"
          aria-label="Prikaz kako slušni aparat obrađuje zvuk i prenosi ga u uho"
          className="w-full"
        >
          <defs>
            <linearGradient id="kozaG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FAF6F3" />
              <stop offset="100%" stopColor="#EFE7E1" />
            </linearGradient>
            <linearGradient id="aparatG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F03C43" />
              <stop offset="100%" stopColor="#BF181E" />
            </linearGradient>
            <linearGradient id="aparatSivaG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#79726C" />
              <stop offset="100%" stopColor="#57534E" />
            </linearGradient>
            <filter id="sjaj" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="meka" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#1C1917" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* pozadinski krug */}
          <circle cx="260" cy="170" r="135" fill="white" opacity="0.7" />
          <circle cx="260" cy="170" r="135" fill="none" stroke="#E8E5E3" strokeWidth="1.5" strokeDasharray="3 7" />

          {/* zvučni talasi */}
          <g
            stroke={aktivniTalasi ? '#ED1C24' : '#D7D3D0'}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            filter={aktivniTalasi ? 'url(#sjaj)' : undefined}
            style={{ transition: 'stroke 250ms' }}
          >
            <path d="M76 130 a 42 46 0 0 1 0 84" opacity="0.95" />
            <path d="M56 112 a 64 70 0 0 1 0 120" opacity="0.6" />
            <path d="M36 94 a 86 94 0 0 1 0 156" opacity="0.35" />
          </g>

          {/* ušna školjka */}
          <g filter="url(#meka)">
            <path
              d="M212 64 C 280 38, 348 80, 350 150 C 351 200, 322 224, 296 246 C 276 263, 270 292, 240 298 C 206 304, 178 284, 175 252 C 173 230, 184 218, 196 210"
              fill="url(#kozaG)"
              stroke="#C9BFB7"
              strokeWidth="3.5"
            />
          </g>
          <path
            d="M232 102 C 280 88, 318 116, 316 156 C 314 186, 294 200, 278 214"
            fill="none"
            stroke="#C9BFB7"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M252 130 C 284 124, 300 146, 294 172"
            fill="none"
            stroke="#D9D0C9"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* ušni kanal */}
          <path
            d="M268 218 C 310 224, 348 234, 376 252"
            fill="none"
            stroke={faza !== 'zvuk' ? '#F3656A' : '#D7D3D0'}
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.5"
            style={{ transition: 'stroke 250ms' }}
          />

          {/* pužnica */}
          <g filter={aktivnoUho ? 'url(#sjaj)' : undefined}>
            <path
              d="M398 234 a 27 27 0 1 1 -27 27 a 20 20 0 1 0 20 -20 a 13 13 0 1 1 -13 13 a 6 6 0 1 0 6 -6"
              fill="none"
              stroke={aktivnoUho ? '#ED1C24' : '#A9A39E'}
              strokeWidth="6.5"
              strokeLinecap="round"
              style={{ transition: 'stroke 250ms' }}
            />
          </g>

          {/* slušni aparat iza uha */}
          <g filter="url(#meka)" className={aktivanAparat ? 'lebdi' : undefined} style={{ transformOrigin: '190px 130px' }}>
            <rect
              x="172"
              y="92"
              width="30"
              height="82"
              rx="15"
              fill={aktivanAparat ? 'url(#aparatG)' : 'url(#aparatSivaG)'}
              style={{ transition: 'fill 250ms' }}
            />
            <path
              d="M187 92 C 187 66, 214 60, 228 74"
              fill="none"
              stroke={aktivanAparat ? '#ED1C24' : '#6B6360'}
              strokeWidth="7"
              strokeLinecap="round"
              style={{ transition: 'stroke 250ms' }}
            />
            <circle cx="234" cy="82" r="10" fill={aktivanAparat ? '#F3656A' : '#A9A39E'} style={{ transition: 'fill 250ms' }} />
            {/* mikrofonski prorezi */}
            <g stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8">
              <line x1="180" y1="106" x2="194" y2="106" />
              <line x1="180" y1="113" x2="194" y2="113" />
            </g>
          </g>

          {/* putujuće zvučne tačkice (CSS offset-path) */}
          {[0, 0.85, 1.7].map((kasni) => (
            <circle
              key={kasni}
              r="5"
              fill="#ED1C24"
              className="zvucna-tacka"
              style={{ animationDelay: `${kasni}s` }}
              opacity="0"
            />
          ))}
        </svg>
        <figcaption className="sr-only">
          Zvučni talasi ulaze u mikrofon slušnog aparata, aparat ih obrađuje i pojačan, čist zvuk
          prenosi kroz ušni kanal do unutrašnjeg uha.
        </figcaption>
      </figure>

      <div>
        <p className="nadnaslov">Interaktivni prikaz</p>
        <h3 className="text-h3 mt-2">Kako slušni aparat radi?</h3>
        <div className="mt-5 space-y-2.5" role="tablist" aria-label="Faze rada slušnog aparata">
          {(Object.keys(FAZE) as Faza[]).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={faza === f}
              onClick={() => setFaza(f)}
              className={`block w-full cursor-pointer rounded-[14px] border p-4 text-left transition-[border-color,background-color,box-shadow] duration-250 ${
                faza === f
                  ? 'border-brand-300 bg-white shadow-[var(--shadow-lift)]'
                  : 'border-neutral-200 bg-white/60 hover:bg-white'
              }`}
            >
              <span className={`font-bold ${faza === f ? 'text-brand-700' : 'text-neutral-900'}`}>
                {FAZE[f].naslov}
              </span>
              <span
                className="grid transition-[grid-template-rows] duration-250"
                style={{ gridTemplateRows: faza === f ? '1fr' : '0fr' }}
              >
                <span className="overflow-hidden">
                  <span className="mt-1.5 block text-[15px] text-neutral-600">{FAZE[f].opis}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
