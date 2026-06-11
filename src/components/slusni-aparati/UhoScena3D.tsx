'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * 3D scena: stilizovani RITE sistem — ušna školjka, kućište iza uha sa
 * mikrofonima i procesorom, tanka žica do zvučnika (dome) u ušnom kanalu
 * i pužnica. Tri faze ističu odgovarajući dio; zvučne čestice putuju
 * aktivnom putanjom. Boje/intenziteti se mekano lerpaju (250–350 ms osjećaj),
 * bez bljeskanja. Montira se SAMO kad WebGL radi i bez reduced-motion
 * (odluka u UhoVizualizacija) — inače ostaje SVG prikaz.
 */

export type Faza3D = 'zvuk' | 'obrada' | 'razumijevanje'

const BOJE = {
  neutralna: new THREE.Color('#a9a39e'),
  zica: new THREE.Color('#79726c'),
  brand: new THREE.Color('#ed1c24'),
  brandMeka: new THREE.Color('#f3656a'),
  koza: new THREE.Color('#f2e6dd'),
  hrskavica: new THREE.Color('#d9c9bd'),
  tijelo: new THREE.Color('#6b6360'),
  cip: new THREE.Color('#44403c'),
} as const

/* — geometrija uha: SVG silueta preslikana u jedinice scene (u=(x−430)/55, v=−(y−230)/55) — */
function uhoOblik(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(-0.58, -1.85)
  s.bezierCurveTo(-1.27, -1.6, -1.6, -0.76, -1.49, 0.15)
  s.bezierCurveTo(-1.38, 1.13, -0.87, 1.89, -0.04, 2.15)
  s.bezierCurveTo(0.8, 2.38, 1.53, 1.93, 1.62, 1.09)
  s.bezierCurveTo(1.69, 0.44, 1.42, -0.07, 1.07, -0.49)
  s.bezierCurveTo(0.76, -0.85, 0.55, -1.24, 0.38, -1.6)
  s.bezierCurveTo(0.22, -1.96, -0.25, -2.07, -0.58, -1.85)
  return s
}

const tackice = (t: [number, number, number][]) => t.map((p) => new THREE.Vector3(...p))

/* putanje signala */
const PUT_ZVUK = new THREE.CatmullRomCurve3(
  tackice([
    [-5.6, 0.7, 0.5],
    [-3.6, 1.8, 0.7],
    [-1.0, 2.7, 0.75],
    [1.1, 2.95, 0.6],
    [2.0, 2.6, 0.5],
  ]),
)
const PUT_OBRADA = new THREE.CatmullRomCurve3(
  tackice([
    [2.11, 2.35, 0.6],
    [2.11, 1.9, 0.68],
    [2.11, 1.5, 0.74],
  ]),
)
const PUT_UHO = new THREE.CatmullRomCurve3(
  tackice([
    [2.11, 2.45, 0.55],
    [1.45, 3.0, 0.7],
    [0.3, 2.6, 0.85],
    [-0.45, 1.3, 0.8],
    [-0.49, -0.05, 0.6],
    [0.9, -0.65, 0.45],
    [2.3, -1.1, 0.3],
    [2.95, -1.25, 0.25],
  ]),
)
/* žica: gornji dio putanje PUT_UHO (do dome-a) */
const ZICA = new THREE.CatmullRomCurve3(
  tackice([
    [2.11, 2.45, 0.55],
    [1.45, 3.0, 0.7],
    [0.3, 2.6, 0.85],
    [-0.45, 1.3, 0.8],
    [-0.49, -0.05, 0.6],
  ]),
)
const KANAL = new THREE.CatmullRomCurve3(
  tackice([
    [-0.45, -0.1, 0.42],
    [0.9, -0.68, 0.35],
    [2.3, -1.12, 0.28],
  ]),
)

function spiralaPuznice(): THREE.CatmullRomCurve3 {
  const c = { x: 3.0, y: -1.27, z: 0.25 }
  const pts: THREE.Vector3[] = []
  const okreta = 2.3
  for (let i = 0; i <= 60; i++) {
    const t = i / 60
    const ugao = t * okreta * Math.PI * 2
    const r = 0.46 * (1 - t * 0.88)
    pts.push(new THREE.Vector3(c.x + Math.cos(ugao) * r, c.y + Math.sin(ugao) * r, c.z))
  }
  return new THREE.CatmullRomCurve3(pts)
}

/** Mekano lerpanje boje materijala prema cilju (premium prelaz, bez skoka). */
function koristiLerpBoje(ref: React.RefObject<THREE.MeshStandardMaterial | null>, cilj: THREE.Color, brzina = 7) {
  useFrame((_, delta) => {
    ref.current?.color.lerp(cilj, Math.min(1, delta * brzina))
  })
}

/** Čestice koje putuju krivuljom; intenzitet se mekano diže/spušta sa aktivnošću. */
function Cestice({
  kriva,
  aktivno,
  boja = '#ed1c24',
  broj = 8,
  brzina = 0.16,
}: {
  kriva: THREE.Curve<THREE.Vector3>
  aktivno: boolean
  boja?: string
  broj?: number
  brzina?: number
}) {
  const grupa = useRef<THREE.Group>(null)
  const jacina = useRef(0)

  useFrame(({ clock }, delta) => {
    const g = grupa.current
    if (!g) return
    // glatko pojavljivanje/nestajanje čestica (≈300 ms)
    jacina.current = THREE.MathUtils.lerp(jacina.current, aktivno ? 1 : 0, Math.min(1, delta * 6))
    g.visible = jacina.current > 0.02
    if (!g.visible) return
    const t0 = clock.elapsedTime * brzina
    g.children.forEach((dijete, i) => {
      const t = (t0 + i / broj) % 1
      const p = kriva.getPoint(t)
      dijete.position.copy(p)
      const s = Math.sin(Math.PI * t) * jacina.current
      dijete.scale.setScalar(Math.max(0.001, s))
    })
  })

  return (
    <group ref={grupa}>
      {Array.from({ length: broj }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshBasicMaterial color={boja} transparent opacity={0.95} />
        </mesh>
      ))}
    </group>
  )
}

function Scena({ faza }: { faza: Faza3D }) {
  const koren = useRef<THREE.Group>(null)

  const uhoGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(uhoOblik(), {
      depth: 0.34,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.07,
      bevelSegments: 3,
      curveSegments: 24,
    })
    geo.translate(0, 0, 0)
    return geo
  }, [])
  const heliksGeo = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(
          tackice([
            [-0.84, -0.18, 0.46],
            [-0.91, 0.58, 0.46],
            [-0.62, 1.31, 0.46],
            [0.04, 1.53, 0.46],
            [0.65, 1.25, 0.46],
          ]),
        ),
        32,
        0.04,
        8,
      ),
    [],
  )
  const zicaGeo = useMemo(() => new THREE.TubeGeometry(ZICA, 48, 0.032, 8), [])
  const kanalGeo = useMemo(() => new THREE.TubeGeometry(KANAL, 24, 0.15, 10), [])
  const puznicaGeo = useMemo(() => new THREE.TubeGeometry(spiralaPuznice(), 90, 0.05, 8), [])

  const talasiMat = useRef<THREE.MeshStandardMaterial>(null)
  const cipMat = useRef<THREE.MeshStandardMaterial>(null)
  const zicaMat = useRef<THREE.MeshStandardMaterial>(null)
  const domeMat = useRef<THREE.MeshStandardMaterial>(null)
  const kanalMat = useRef<THREE.MeshStandardMaterial>(null)
  const puznicaMat = useRef<THREE.MeshStandardMaterial>(null)
  const cipMesh = useRef<THREE.Mesh>(null)

  koristiLerpBoje(talasiMat, faza === 'zvuk' ? BOJE.brand : BOJE.neutralna)
  koristiLerpBoje(zicaMat, faza === 'razumijevanje' ? BOJE.brand : BOJE.zica)
  koristiLerpBoje(domeMat, faza === 'razumijevanje' ? BOJE.brandMeka : BOJE.neutralna)
  koristiLerpBoje(kanalMat, faza === 'razumijevanje' ? BOJE.brandMeka : BOJE.neutralna)
  koristiLerpBoje(puznicaMat, faza === 'razumijevanje' ? BOJE.brand : BOJE.neutralna)

  useFrame(({ clock, pointer }, delta) => {
    // tiho lebdjenje + diskretna paralaksa prema pokazivaču
    if (koren.current) {
      const t = clock.elapsedTime
      const ciljY = Math.sin(t * 0.25) * 0.05 + pointer.x * 0.07
      const ciljX = pointer.y * -0.04
      koren.current.rotation.y = THREE.MathUtils.lerp(koren.current.rotation.y, ciljY, Math.min(1, delta * 3))
      koren.current.rotation.x = THREE.MathUtils.lerp(koren.current.rotation.x, ciljX, Math.min(1, delta * 3))
    }
    // puls procesora u fazi obrade
    if (cipMat.current && cipMesh.current) {
      const cilj = faza === 'obrada' ? 0.9 + Math.sin(clock.elapsedTime * 4) * 0.35 : 0
      cipMat.current.emissiveIntensity = THREE.MathUtils.lerp(cipMat.current.emissiveIntensity, cilj, Math.min(1, delta * 6))
      const s = faza === 'obrada' ? 1 + Math.sin(clock.elapsedTime * 4) * 0.04 : 1
      cipMesh.current.scale.setScalar(THREE.MathUtils.lerp(cipMesh.current.scale.x, s, Math.min(1, delta * 6)))
    }
  })

  return (
    <group ref={koren} position={[0.4, -0.35, 0]}>
      {/* zvučni talasi (izvor) */}
      {[0.42, 0.7, 0.98].map((r, i) => (
        <mesh key={r} position={[-4.7, 0.7, 0.45]} rotation={[0, 0, Math.PI / 2 - 0.55]}>
          <torusGeometry args={[r, 0.04, 8, 40, 1.1]} />
          {i === 0 ? (
            <meshStandardMaterial ref={talasiMat} color="#a9a39e" roughness={0.6} />
          ) : (
            <meshStandardMaterial
              color="#a9a39e"
              roughness={0.6}
              transparent
              opacity={i === 1 ? 0.55 : 0.3}
            />
          )}
        </mesh>
      ))}

      {/* ušna školjka */}
      <mesh geometry={uhoGeo} position={[0, 0, 0]}>
        <meshStandardMaterial color={BOJE.koza} roughness={0.92} metalness={0} />
      </mesh>
      <mesh geometry={heliksGeo}>
        <meshStandardMaterial color={BOJE.hrskavica} roughness={0.9} />
      </mesh>

      {/* ušni kanal (poluprovidan) i pužnica */}
      <mesh geometry={kanalGeo}>
        <meshStandardMaterial ref={kanalMat} color="#a9a39e" roughness={0.7} transparent opacity={0.32} />
      </mesh>
      <mesh geometry={puznicaGeo}>
        <meshStandardMaterial ref={puznicaMat} color="#a9a39e" roughness={0.55} />
      </mesh>

      {/* kućište iza uha */}
      <group position={[2.11, 1.45, 0.5]}>
        <mesh>
          <capsuleGeometry args={[0.3, 1.45, 6, 18]} />
          <meshStandardMaterial color={BOJE.tijelo} roughness={0.42} metalness={0.12} />
        </mesh>
        {/* mikrofonski otvori */}
        {[0.62, 0.48].map((y) => (
          <mesh key={y} position={[0.02, y + 0.45, 0.26]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color="#2c2725" roughness={0.5} />
          </mesh>
        ))}
        {/* procesorski čip */}
        <mesh ref={cipMesh} position={[0, -0.05, 0.27]}>
          <boxGeometry args={[0.3, 0.42, 0.12]} />
          <meshStandardMaterial
            ref={cipMat}
            color={BOJE.cip}
            emissive="#ed1c24"
            emissiveIntensity={0}
            roughness={0.45}
          />
        </mesh>
      </group>

      {/* tanka žica do zvučnika */}
      <mesh geometry={zicaGeo}>
        <meshStandardMaterial ref={zicaMat} color="#79726c" roughness={0.5} />
      </mesh>
      {/* zvučnik (dome) na ulazu u kanal */}
      <mesh position={[-0.49, -0.08, 0.55]}>
        <sphereGeometry args={[0.15, 14, 14]} />
        <meshStandardMaterial ref={domeMat} color="#a9a39e" roughness={0.5} />
      </mesh>

      {/* zvučne čestice po fazama */}
      <Cestice kriva={PUT_ZVUK} aktivno={faza === 'zvuk'} />
      <Cestice kriva={PUT_OBRADA} aktivno={faza === 'obrada'} broj={4} brzina={0.35} />
      <Cestice kriva={PUT_UHO} aktivno={faza === 'razumijevanje'} broj={10} brzina={0.1} />
    </group>
  )
}

/** Omot platna — montira se tek kad je WebGL provjeren (vidjeti UhoVizualizacija). */
export default function UhoScena3D({
  faza,
  onGreska,
  onSpremno,
}: {
  faza: Faza3D
  onGreska: () => void
  onSpremno: () => void
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.35, 9.4], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      onCreated={({ gl }) => {
        // izgubljeni WebGL kontekst → trajni povratak na SVG prikaz
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          onGreska()
        })
        onSpremno()
      }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden
    >
      <ambientLight intensity={1.25} />
      <directionalLight position={[4, 6, 7]} intensity={1.35} />
      <directionalLight position={[-5, -2, 4]} intensity={0.4} />
      <Scena faza={faza} />
    </Canvas>
  )
}
