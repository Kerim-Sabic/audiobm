'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * 3D polje zvučnih talasa — tačkice se njišu poput zvučnog vala.
 * Diskretna pozadina hero sekcije; učitava se lijeno, samo na desktopu
 * i samo bez prefers-reduced-motion (provjerava omotač).
 */

const KOLONA = 110
const REDOVA = 44

function Talasi() {
  const ref = useRef<THREE.Points>(null)

  const { pozicije, boje } = useMemo(() => {
    const n = KOLONA * REDOVA
    const poz = new Float32Array(n * 3)
    const boj = new Float32Array(n * 3)
    const crvena = new THREE.Color('#ED1C24')
    const siva = new THREE.Color('#d8d2cf')
    let i = 0
    for (let x = 0; x < KOLONA; x++) {
      for (let y = 0; y < REDOVA; y++) {
        const px = (x / (KOLONA - 1) - 0.5) * 26
        const py = (y / (REDOVA - 1) - 0.5) * 11
        poz[i * 3] = px
        poz[i * 3 + 1] = py
        poz[i * 3 + 2] = 0
        // crvenilo raste prema desnoj strani (iza fotografije), lijevo neutralno
        const t = Math.min(1, Math.max(0, x / (KOLONA - 1) - 0.1) * 1.45)
        const c = siva.clone().lerp(crvena, t)
        boj[i * 3] = c.r
        boj[i * 3 + 1] = c.g
        boj[i * 3 + 2] = c.b
        i++
      }
    }
    return { pozicije: poz, boje: boj }
  }, [])

  useFrame(({ clock }) => {
    const geo = ref.current?.geometry
    if (!geo) return
    const t = clock.elapsedTime * 0.55
    const arr = geo.attributes.position.array as Float32Array
    for (let i = 0; i < KOLONA * REDOVA; i++) {
      const x = arr[i * 3]
      const y = arr[i * 3 + 1]
      arr[i * 3 + 2] =
        Math.sin(x * 0.5 + t) * 0.5 +
        Math.cos(y * 0.7 + x * 0.18 + t * 0.7) * 0.3
    }
    geo.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref} rotation={[-0.95, 0, -0.12]} position={[0.6, -2.2, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pozicije, 3]} />
        <bufferAttribute attach="attributes-color" args={[boje, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.075} vertexColors transparent opacity={0.75} sizeAttenuation depthWrite={false} />
    </points>
  )
}

export default function ZvucniTalasi() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8.5], fov: 42 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      dpr={[1, 1.5]}
      style={{ pointerEvents: 'none' }}
      aria-hidden
    >
      <Talasi />
    </Canvas>
  )
}
