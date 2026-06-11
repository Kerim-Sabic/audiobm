'use client'

import { m, useReducedMotion } from 'motion/react'
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
 * Animirana vizualizacija: kako slušni aparat pomaže uhu da čuje.
 * Zvučni talasi → aparat → unutrašnje uho; klik mijenja fazu objašnjenja.
 * Uz prefers-reduced-motion prikazuje statičan dijagram.
 */
export function UhoVizualizacija() {
  const [faza, setFaza] = useState<Faza>('zvuk')
  const smanjeno = useReducedMotion()

  const talasAnim = smanjeno
    ? {}
    : {
        animate: { opacity: [0, 1, 0], x: [0, 26] },
        transition: { duration: 1.8, repeat: Infinity, ease: 'easeOut' as const },
      }

  return (
    <div className="grid items-center gap-8 rounded-[16px] border border-neutral-200 bg-white p-6 shadow-sm md:grid-cols-[1.1fr_1fr] md:p-10">
      <figure>
        <svg viewBox="0 0 420 320" role="img" aria-label="Prikaz kako slušni aparat obrađuje zvuk i prenosi ga u uho" className="w-full">
          {/* zvučni talasi */}
          <g stroke="var(--color-brand-400)" strokeWidth="5" strokeLinecap="round" fill="none">
            {[0, 1, 2].map((i) => (
              <m.path
                key={i}
                d={`M${52 - i * 18} ${130 - (2 - i) * 6} a ${26 + i * 14} ${30 + i * 16} 0 0 1 0 ${(2 - i) * 12 + 60}`}
                opacity={smanjeno ? 0.7 : undefined}
                {...(smanjeno ? {} : { ...talasAnim, transition: { ...talasAnim.transition!, delay: i * 0.35 } })}
              />
            ))}
          </g>

          {/* vanjsko uho — stilizovana ušna školjka */}
          <path
            d="M198 60 C 250 40, 296 74, 296 130 C 296 172, 272 192, 252 210 C 236 224, 230 248, 206 252 C 180 256, 160 240, 158 218"
            fill="var(--color-neutral-100)"
            stroke="var(--color-neutral-400)"
            strokeWidth="4"
          />
          <path
            d="M214 92 C 248 82, 272 102, 270 134 C 268 158, 252 170, 240 182"
            fill="none"
            stroke="var(--color-neutral-400)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* ušni kanal */}
          <path
            d="M236 196 C 280 200, 320 206, 348 218"
            fill="none"
            stroke={faza !== 'zvuk' ? 'var(--color-brand-500)' : 'var(--color-neutral-300)'}
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.55"
          />

          {/* pužnica (unutrašnje uho) */}
          <m.g
            animate={
              smanjeno || faza !== 'razumijevanje'
                ? { scale: 1 }
                : { scale: [1, 1.08, 1] }
            }
            transition={{ duration: 1.2, repeat: faza === 'razumijevanje' && !smanjeno ? Infinity : 0 }}
            style={{ transformOrigin: '372px 230px' }}
          >
            <path
              d="M372 206 a 24 24 0 1 1 -24 24 a 18 18 0 1 0 18 -18 a 12 12 0 1 1 -12 12"
              fill="none"
              stroke={faza === 'razumijevanje' ? 'var(--color-brand-600)' : 'var(--color-neutral-400)'}
              strokeWidth="6"
              strokeLinecap="round"
            />
          </m.g>

          {/* slušni aparat iza uha */}
          <m.g
            animate={smanjeno ? {} : faza === 'obrada' ? { y: [0, -3, 0] } : { y: 0 }}
            transition={{ duration: 1, repeat: faza === 'obrada' && !smanjeno ? Infinity : 0 }}
          >
            <rect x="160" y="92" width="26" height="74" rx="13" fill={faza === 'obrada' ? 'var(--color-brand-600)' : 'var(--color-neutral-600)'} />
            <path d="M173 92 C 173 70, 196 64, 208 76" fill="none" stroke={faza === 'obrada' ? 'var(--color-brand-600)' : 'var(--color-neutral-600)'} strokeWidth="6" strokeLinecap="round" />
            <circle cx="214" cy="84" r="9" fill={faza === 'obrada' ? 'var(--color-brand-400)' : 'var(--color-neutral-400)'} />
          </m.g>
        </svg>
        <figcaption className="sr-only">
          Zvučni talasi ulaze u mikrofon slušnog aparata, aparat ih obrađuje i pojačan, čist zvuk
          prenosi kroz ušni kanal do unutrašnjeg uha.
        </figcaption>
      </figure>

      <div>
        <h3 className="text-h3">Kako slušni aparat radi?</h3>
        <div className="mt-4 space-y-2" role="tablist" aria-label="Faze rada slušnog aparata">
          {(Object.keys(FAZE) as Faza[]).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={faza === f}
              onClick={() => setFaza(f)}
              className={`block w-full cursor-pointer rounded-[12px] border p-4 text-left transition-colors duration-250 ${
                faza === f
                  ? 'border-brand-300 bg-brand-50'
                  : 'border-neutral-200 bg-white hover:bg-neutral-50'
              }`}
            >
              <span className="font-bold text-neutral-900">{FAZE[f].naslov}</span>
              <span
                className="grid transition-[grid-template-rows] duration-250"
                style={{ gridTemplateRows: faza === f ? '1fr' : '0fr' }}
              >
                <span className="overflow-hidden">
                  <span className="mt-1 block text-[15px] text-neutral-600">{FAZE[f].opis}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
