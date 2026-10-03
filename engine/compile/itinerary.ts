import type { StopSource, DaySource, VariantSource } from '../../schemas/index.ts'
import type { CompiledStop, CompiledDay, CompiledVariant, PlaceRegistry, AffiliateRegistry } from '../types.ts'
import { resolvePlace, resolveAffiliate, uniquePlaces } from './place.ts'

export function compileStop(
  stop: StopSource,
  places: PlaceRegistry,
  affiliates: AffiliateRegistry,
  now: Date = new Date(),
): CompiledStop {
  const place = places.get(stop.place_id)
  if (!place) {
    throw new Error(`place_id inexistente: ${stop.place_id}`)
  }

  const compiled: CompiledStop = {
    place: resolvePlace(place, now),
    order: stop.order,
    duration_min: stop.duration_min,
    planning_status: stop.planning_status,
    visit_status: stop.visit_status ?? 'unknown',
    start_time: stop.start_time,
    travel_to_next_min: stop.travel_to_next_min,
    travel_to_next_mode: stop.travel_to_next_mode,
    variant_note: stop.variant_note,
    skip_reason: stop.skip_reason,
    experience: stop.experience,
  }

  if (stop.booking) {
    const affiliate = affiliates.get(stop.booking.affiliate_id)
    if (!affiliate) {
      throw new Error(`affiliate_id inexistente: ${stop.booking.affiliate_id}`)
    }
    compiled.booking = {
      affiliate: resolveAffiliate(affiliate),
      advance_notice: stop.booking.advance_notice,
    }
  }

  return compiled
}

export function compileDay(
  day: DaySource,
  places: PlaceRegistry,
  affiliates: AffiliateRegistry,
  now: Date = new Date(),
): CompiledDay {
  const stops = day.stops.map((stop) => compileStop(stop, places, affiliates, now))
  return {
    day: day.day,
    title: day.title,
    summary: day.summary,
    physical_level: day.physical_level,
    stops,
    route_stops: stops.filter((stop) => stop.visit_status !== 'not_visited'),
    skipped_stops: stops.filter((stop) => stop.visit_status === 'not_visited'),
    n_stops: stops.length,
    food: day.food,
    our_take: day.our_take,
    plan_b: day.plan_b,
    seniors_note: day.seniors_note,
  }
}

export function compileVariant(
  variant: VariantSource,
  places: PlaceRegistry,
  affiliates: AffiliateRegistry,
  now: Date = new Date(),
): CompiledVariant {
  const days = variant.days.map((day) => compileDay(day, places, affiliates, now))
  const allStopPlaces = days.flatMap((day) => day.stops.map((stop) => stop.place))

  return {
    id: variant.id,
    name: variant.name,
    description: variant.description,
    days,
    n_stops_total: days.reduce((sum, day) => sum + day.n_stops, 0),
    all_places: uniquePlaces(allStopPlaces),
    budget_delta: variant.budget_delta
      ? {
          items: variant.budget_delta.items,
          total: variant.budget_delta.items.reduce((sum, item) => sum + item.amount, 0),
        }
      : undefined,
    pace_notes: variant.pace_notes,
  }
}
