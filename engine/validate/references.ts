import type { GuideSource } from '../../schemas/index.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../types.ts'

export function validateReferences(
  guide: GuideSource,
  places: PlaceRegistry,
  affiliates: AffiliateRegistry,
): string[] {
  const errors: string[] = []

  // A night must point at a registered campsite, like a stop at a place (I5):
  // names change spelling, ids do not.
  function checkCampsite(placeId: string, where: string): void {
    const place = places.get(placeId)
    if (!place) {
      errors.push(`[ERROR] place_id inexistente en ${where}: "${placeId}"`)
    } else if (place.type !== 'accommodation') {
      errors.push(`[ERROR] place_id en ${where} no es un alojamiento (type: ${place.type}): "${placeId}"`)
    }
  }

  for (const variant of guide.variants ?? []) {
    for (const day of variant.days) {
      if (day.overnight) {
        checkCampsite(day.overnight, `overnight (variante ${variant.id}, día ${day.day})`)
      }
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
      checkCampsite(pick.place_id, `accommodation (zona ${zone.name})`)
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
