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

  for (const zone of guide.accommodation?.zones ?? []) {
    for (const pick of zone.picks ?? []) {
      if (pick.affiliate_id) {
        const affiliate = affiliates.get(pick.affiliate_id)
        if (!affiliate) {
          errors.push(`[ERROR] affiliate_id inexistente en accommodation: "${pick.affiliate_id}"`)
        } else if (!affiliate.active) {
          errors.push(`[ERROR] affiliate_id inactivo en accommodation: "${pick.affiliate_id}"`)
        }
      }
    }
  }

  const insuranceAffiliateId = guide.practical?.insurance_affiliate_id
  if (insuranceAffiliateId) {
    const affiliate = affiliates.get(insuranceAffiliateId)
    if (!affiliate) {
      errors.push(`[ERROR] affiliate_id inexistente en practical.insurance_affiliate_id: "${insuranceAffiliateId}"`)
    } else if (!affiliate.active) {
      errors.push(`[ERROR] affiliate_id inactivo en practical.insurance_affiliate_id: "${insuranceAffiliateId}"`)
    }
  }

  return errors
}
