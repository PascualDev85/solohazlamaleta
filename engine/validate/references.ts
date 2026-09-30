import type { GuideSource } from '../../schemas/index.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../types.ts'

export function validateReferences(
  guide: GuideSource,
  places: PlaceRegistry,
  affiliates: AffiliateRegistry,
): string[] {
  const errors: string[] = []

  for (const variant of guide.variants ?? []) {
    for (const day of variant.days) {
      for (const stop of day.stops) {
        if (!places.get(stop.place_id)) {
          errors.push(`[ERROR] place_id inexistente: "${stop.place_id}" (variante ${variant.id}, día ${day.day})`)
        }
        if (stop.booking) {
          const affiliate = affiliates.get(stop.booking.affiliate_id)
          if (!affiliate) {
            errors.push(`[ERROR] affiliate_id inexistente: "${stop.booking.affiliate_id}" (variante ${variant.id}, día ${day.day})`)
          } else if (!affiliate.active) {
            errors.push(`[ERROR] affiliate_id inactivo: "${stop.booking.affiliate_id}" (variante ${variant.id}, día ${day.day})`)
          }
        }
      }
    }
  }

  for (const item of guide.booking_checklist ?? []) {
    if (item.affiliate_id) {
      const affiliate = affiliates.get(item.affiliate_id)
      if (!affiliate) {
        errors.push(`[ERROR] affiliate_id inexistente en booking_checklist: "${item.affiliate_id}"`)
      } else if (!affiliate.active) {
        errors.push(`[ERROR] affiliate_id inactivo en booking_checklist: "${item.affiliate_id}"`)
      }
    }
  }

  return errors
}
