import type { GuideSource } from '../../schemas/index.ts'
import type { CompiledGuide, CompiledPlace, PlaceRegistry, AffiliateRegistry } from '../types.ts'
import { compileVariant } from './itinerary.ts'
import { compileBudget } from './budget.ts'

function uniquePlaces(places: CompiledPlace[]): CompiledPlace[] {
  const seen = new Map<string, CompiledPlace>()
  for (const place of places) {
    if (!seen.has(place.place_id)) {
      seen.set(place.place_id, place)
    }
  }
  return [...seen.values()]
}

export function compileGuide(
  source: GuideSource,
  places: PlaceRegistry,
  affiliates: AffiliateRegistry,
  now: Date = new Date(),
): CompiledGuide {
  const variants = source.variants?.map((variant) => compileVariant(variant, places, affiliates, now))
  const budget = source.budget ? compileBudget(source.budget, source.base_travelers ?? 1) : undefined
  const allPlaces = uniquePlaces((variants ?? []).flatMap((variant) => variant.all_places))

  return {
    slug: source.slug,
    destination: source.destination,
    hub: source.hub,
    type: source.type,
    content_type: source.content_type,
    status: source.status,
    trip_done: source.trip_done,
    title: source.title,
    description: source.description,
    updated_at: source.updated_at,
    cover_image: source.cover_image,
    gallery: source.gallery,
    days: source.days,
    base_travelers: source.base_travelers,
    our_criteria: source.our_criteria,
    pitfalls: source.pitfalls,
    terrain_tips: source.terrain_tips,
    practical: source.practical,
    adaptation_notes: source.adaptation_notes,
    faq: source.faq,
    related: source.related,

    summary: {
      ...source.summary,
      budget_per_person:
        budget && source.base_travelers ? budget.total_reference / source.base_travelers : undefined,
    },
    variants,
    budget,
    accommodation: source.accommodation,
    transport: source.transport,
    booking_checklist: source.booking_checklist,

    places: allPlaces,
    has_experience: source.content_type === 'experience' && source.trip_done != null,
    compiled_at: now.toISOString(),
  }
}
