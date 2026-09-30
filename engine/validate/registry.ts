import type { PlaceSource } from '../../schemas/index.ts'
import type { PlaceRegistry } from '../types.ts'
import { validatePlaceSchema } from './schema.ts'

function identifyRaw(raw: unknown, index: number): string {
  if (typeof raw === 'object' && raw !== null && 'place_id' in raw && typeof (raw as { place_id: unknown }).place_id === 'string') {
    return (raw as { place_id: string }).place_id
  }
  return `#${index}`
}

export function buildPlaceRegistry(rawPlaces: unknown[]): { registry: PlaceRegistry; errors: string[] } {
  const errors: string[] = []
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

  return { registry: { get: (id) => map.get(id) }, errors }
}
