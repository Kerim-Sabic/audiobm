'use client'

import { useRef, type ReactNode } from 'react'

/**
 * Blagi 3D nagib kartice prema pokazivaču (≤6°) — samo uređaji sa mišem,
 * isključeno uz prefers-reduced-motion. Čisto CSS transform (kompozitor).
 */
export function Tilt3D({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  const naPomak = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = el.getBoundingClientRect()
    const dx = (e.clientX - r.left) / r.width - 0.5
    const dy = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateX(${(-dy * 5).toFixed(2)}deg) rotateY(${(dx * 6).toFixed(2)}deg) translateY(-4px)`
  }

  const naIzlaz = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <div
      ref={ref}
      onPointerMove={naPomak}
      onPointerLeave={naIzlaz}
      className={className}
      style={{ transition: 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1)', transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  )
}
