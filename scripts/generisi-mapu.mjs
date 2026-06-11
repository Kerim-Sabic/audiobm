/** Iz stvarne GeoJSON granice BiH pravi tačnu SVG putanju + projekciju za pinove. */
import { readFileSync, writeFileSync } from 'node:fs'

const d = JSON.parse(readFileSync('./bih2.json', 'utf8'))
const g = d.features ? d.features[0].geometry : (d.geometry || d)
let ring = g.type === 'Polygon' ? g.coordinates[0] : g.coordinates[0][0]

// Ramer–Douglas–Peucker pojednostavljenje
function rdp(points, eps) {
  if (points.length < 3) return points
  const [p1, p2] = [points[0], points[points.length - 1]]
  let maxD = 0, idx = 0
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i]
    const dx = p2[0] - p1[0], dy = p2[1] - p1[1]
    const norm = Math.hypot(dx, dy) || 1e-12
    const dist = Math.abs(dy * x - dx * y + p2[0] * p1[1] - p2[1] * p1[0]) / norm
    if (dist > maxD) { maxD = dist; idx = i }
  }
  if (maxD <= eps) return [p1, p2]
  return [...rdp(points.slice(0, idx + 1), eps).slice(0, -1), ...rdp(points.slice(idx), eps)]
}
// zatvoreni prsten — RDP preskočen, 746 tačaka je prihvatljivo
console.log('tacaka nakon pojednostavljenja:', ring.length)

const lngs = ring.map((p) => p[0]), lats = ring.map((p) => p[1])
const lngMin = Math.min(...lngs), lngMax = Math.max(...lngs)
const latMin = Math.min(...lats), latMax = Math.max(...lats)
const kx = Math.cos(((latMin + latMax) / 2) * Math.PI / 180)
const PAD = 14, W = 700
const skala = (W - 2 * PAD) / ((lngMax - lngMin) * kx)
const H = Math.round((latMax - latMin) * skala + 2 * PAD)
const X = (lng) => +(((lng - lngMin) * kx) * skala + PAD).toFixed(1)
const Y = (lat) => +((latMax - lat) * skala + PAD).toFixed(1)

const path = ring.map(([lng, lat], i) => `${i === 0 ? 'M' : 'L'}${X(lng)},${Y(lat)}`).join('') + 'Z'

const ts = `/**
 * Tačna kontura Bosne i Hercegovine — generisano iz stvarne GeoJSON granice
 * (georgique/world-geojson, pojednostavljeno RDP algoritmom na ${ring.length} tačaka).
 * Ne uređivati ručno — regenerisati: node scripts/generisi-mapu.mjs
 */
export const BIH_W = ${W}
export const BIH_H = ${H}
export const BIH_PUTANJA = '${path}'

const LNG_MIN = ${lngMin}
const LAT_MAX = ${latMax}
const KX = ${kx}
const SKALA = ${skala}
const PAD = ${PAD}

/** Geografske koordinate → koordinate na SVG mapi (ista projekcija kao kontura). */
export const projekcija = (lat: number, lng: number) => ({
  x: (lng - LNG_MIN) * KX * SKALA + PAD,
  y: (LAT_MAX - lat) * SKALA + PAD,
})
`
writeFileSync('src/components/poslovnice/bihKontura.ts', ts)
console.log(`SVG: ${W}x${H}, putanja ${path.length} znakova → src/components/poslovnice/bihKontura.ts`)
