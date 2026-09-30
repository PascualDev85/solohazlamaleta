import type { GuideSource } from '../../schemas/index.ts'
import type { PlaceRegistry } from '../types.ts'
import { resolvePlace } from '../compile/place.ts'

export interface ContentRuleResult {
  errors: string[]
  warnings: string[]
}

const FIRST_PERSON = /\b(nosotros|nuestro|nuestra|nuestros|nuestras|nos|hicimos|vimos|fuimos|comimos|llegamos|estuvimos|recomendamos)\b/i

export function validateContentRules(
  guide: GuideSource,
  places: PlaceRegistry,
  now: Date = new Date(),
): ContentRuleResult {
  const errors: string[] = []
  const warnings: string[] = []
  const warnedStalePlaces = new Set<string>()

  if (guide.status === 'draft') {
    errors.push('[ERROR] status: draft no puede compilarse en build de producción')
  }

  for (const variant of guide.variants ?? []) {
    for (const day of variant.days) {
      for (const stop of day.stops) {
        const visitStatus = stop.visit_status ?? 'unknown'

        if (stop.experience && visitStatus !== 'visited') {
          errors.push(
            `[ERROR] experience{} en parada con visit_status: ${visitStatus} (variante ${variant.id}, día ${day.day}, place_id ${stop.place_id})`,
          )
        }

        if (stop.variant_note && FIRST_PERSON.test(stop.variant_note) && visitStatus !== 'visited') {
          warnings.push(
            `[WARNING] primera persona en variant_note sin visit_status: visited (día ${day.day}, place_id ${stop.place_id})`,
          )
        }

        const place = places.get(stop.place_id)
        if (place && !warnedStalePlaces.has(place.place_id)) {
          const resolved = resolvePlace(place, now)
          if (resolved.is_stale) {
            warnedStalePlaces.add(place.place_id)
            warnings.push(
              `[WARNING] ${place.place_id}: datos caducados (${resolved.stale_fields.join(', ')})`,
            )
          }
        }
      }
    }
  }

  if (guide.content_type === 'experience' && !guide.trip_done) {
    warnings.push('[WARNING] content_type: experience sin trip_done')
  }

  return { errors, warnings }
}
