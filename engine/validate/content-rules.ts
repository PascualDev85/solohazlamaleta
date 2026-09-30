import type { GuideSource } from '../../schemas/index.ts'

export interface ContentRuleResult {
  errors: string[]
  warnings: string[]
}

const FIRST_PERSON = /\b(nosotros|nuestro|nuestra|hicimos|vimos)\b/i

export function validateContentRules(guide: GuideSource): ContentRuleResult {
  const errors: string[] = []
  const warnings: string[] = []

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
      }
    }
  }

  if (guide.content_type === 'experience' && !guide.trip_done) {
    warnings.push('[WARNING] content_type: experience sin trip_done')
  }

  return { errors, warnings }
}
