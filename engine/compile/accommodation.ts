import type { AccommodationSource } from '../../schemas/index.ts'
import type { CompiledAccommodation, PlaceRegistry, AffiliateRegistry } from '../types.ts'
import { resolvePlace, resolveAffiliate } from './place.ts'

/**
 * Each pick's place_id becomes the campsite itself (coordinates, facilities,
 * current price) and its affiliate_id, when present, the resolved affiliate.
 * What stays on the pick is ours alone: what we paid, what we thought.
 */
export function compileAccommodation(
  source: AccommodationSource,
  places: PlaceRegistry,
  affiliates: AffiliateRegistry,
  now: Date = new Date(),
): CompiledAccommodation {
  return {
    notes: source.notes,
    zones: source.zones.map((zone) => ({
      name: zone.name,
      description: zone.description,
      pros: zone.pros,
      cons: zone.cons,
      best_for: zone.best_for,
      picks: (zone.picks ?? []).map((pick) => {
        const place = places.get(pick.place_id)
        if (!place) {
          throw new Error(`place_id inexistente en accommodation: ${pick.place_id}`)
        }
        const affiliate = pick.affiliate_id ? affiliates.get(pick.affiliate_id) : undefined
        if (pick.affiliate_id && !affiliate) {
          throw new Error(`affiliate_id inexistente en accommodation: ${pick.affiliate_id}`)
        }
        return {
          place: resolvePlace(place, now),
          price_paid: pick.price_paid,
          opinion: pick.opinion,
          notes: pick.notes,
          affiliate: affiliate ? resolveAffiliate(affiliate) : undefined,
        }
      }),
    })),
  }
}
