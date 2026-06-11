/**
 * Mini audiogram — autentičan audiometrijski UI detalj (mreža, dvije krivulje,
 * dB/Hz ose). Krivulje se iscrtavaju CSS animacijom (crtaj-liniju); uz
 * prefers-reduced-motion prikazuju se odmah. Čist SVG — bez JavaScripta.
 */
export function Audiogram({ className = '' }: { className?: string }) {
  return (
    <figure className={className}>
      <div className="flex items-center justify-between gap-4">
        <figcaption className="text-[12px] font-bold tracking-[0.12em] text-neutral-500 uppercase">
          Audiogram
        </figcaption>
        <span className="flex items-center gap-2 text-[11px] font-semibold text-neutral-400">
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-brand-600" aria-hidden /> desno
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-neutral-400" aria-hidden /> lijevo
          </span>
        </span>
      </div>
      <svg viewBox="0 0 200 116" className="mt-2 w-full" role="img" aria-label="Prikaz audiograma — krivulja praga sluha">
        {/* mreža */}
        <g stroke="#E8E5E3" strokeWidth="1">
          {[10, 32, 54, 76, 98].map((y) => (
            <line key={y} x1="14" x2="196" y1={y} y2={y} />
          ))}
          {[14, 50, 86, 122, 158, 196].map((x) => (
            <line key={x} y1="10" y2="98" x1={x} x2={x} />
          ))}
        </g>
        {/* oznake osa */}
        <g fill="#A9A39E" fontSize="7.5" fontWeight="600">
          <text x="2" y="13">0</text>
          <text x="2" y="57">40</text>
          <text x="2" y="101">80</text>
          <text x="14" y="110">250</text>
          <text x="80" y="110">1k</text>
          <text x="150" y="110">4k Hz</text>
        </g>
        {/* lijevo uho — tiha siva isprekidana krivulja */}
        <path
          d="M14 24 C 45 28, 70 36, 95 48 S 160 78, 196 84"
          fill="none"
          stroke="#A9A39E"
          strokeWidth="2"
          strokeDasharray="4 5"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* desno uho — brend krivulja koja se iscrtava */}
        <path
          d="M14 18 C 48 22, 75 32, 100 44 S 165 70, 196 74"
          fill="none"
          stroke="#ED1C24"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="crtaj-liniju"
          style={{ '--duzina-linije': '220' } as React.CSSProperties}
        />
        {/* mjerne tačke */}
        {[
          [14, 18],
          [50, 24],
          [86, 36],
          [122, 52],
          [158, 64],
          [196, 74],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="3" fill="white" stroke="#ED1C24" strokeWidth="2" />
        ))}
      </svg>
    </figure>
  )
}
