import type { PlaceSource } from '../../schemas/index.ts'
import type { PlaceRegistry } from '../types.ts'
import { validatePlaceSchema } from './schema.ts'

function identifyRaw(raw: unknown, index: number): string {
  if (typeof raw === 'object' && raw !== null && 'place_id' in raw && typeof (raw as { place_id: unknown }).place_id === 'string') {
    return (raw as { place_id: string }).place_id
  }
  return `#${index}`
}

/** Meters between two coordinates (haversine). */
function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const EARTH_RADIUS_M = 6_371_000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Below this, two places are treated as a likely duplicate rather than two
// distinct nearby attractions (e.g. Seljalandsfoss/Gljúfrafoss sit ~300 m apart).
const NEAR_DUPLICATE_THRESHOLD_M = 150

export function buildPlaceRegistry(rawPlaces: unknown[]): { registry: PlaceRegistry; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  const map = new Map<string, PlaceSource>()

  rawPlaces.forEach((raw, index) => {
    const result = validatePlaceSchema(raw)
    if (!result.success) {
      errors.push(
        `[ERROR] esquema de lugar inválido (${identifyRaw(raw, index)}): ${result.error.issues.map((i) => i.message).join(', ')}`,
      )
      return
    }

    if (map.has(result.data.place_id)) {
      errors.push(`[ERROR] place_id duplicado: "${result.data.place_id}"`)
      return
    }

    map.set(result.data.place_id, result.data)
  })

  const places = [...map.values()]
  for (let i = 0; i < places.length; i++) {
    for (let j = i + 1; j < places.length; j++) {
      const a = places[i]
      const b = places[j]
      const meters = distanceMeters(a.lat, a.lng, b.lat, b.lng)
      if (meters < NEAR_DUPLICATE_THRESHOLD_M) {
        warnings.push(
          `[WARNING] "${a.place_id}" y "${b.place_id}" tienen coordenadas casi idénticas (${Math.round(meters)} m) — revisa si son el mismo lugar duplicado`,
        )
      }
    }
  }

  return { registry: { get: (id) => map.get(id) }, errors, warnings }
}
