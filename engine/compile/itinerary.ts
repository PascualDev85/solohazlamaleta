import type { StopSource, DaySource, VariantSource, PlaceSource } from '../../schemas/index.ts'
import type { CompiledStop, CompiledDay, CompiledVariant, PlaceRegistry, AffiliateRegistry } from '../types.ts'
import { resolvePlace, resolveAffiliate, uniquePlaces } from './place.ts'

/**
 * The check date a stop shows next to its price (today the parking price,
 * the only price a stop displays). Only when that check is older than the
 * guide's own update: a guide updated after the check vouches for it.
 * Without a guide date the check date is always shown.
 */
function priceCheckedAt(place: PlaceSource, guideUpdatedAt?: string): string | undefined {
  const checked = place.parking?.verified_at
  if (!checked) return undefined
  if (guideUpdatedAt && new Date(checked) >= new Date(guideUpdatedAt)) return undefined
  return checked
}

export function compileStop(
  stop: StopSource,
  places: PlaceRegistry,
  affiliates: AffiliateRegistry,
  now: Date = new Date(),
  guideUpdatedAt?: string,
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
    price_checked_at: priceCheckedAt(place, guideUpdatedAt),
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
  guideUpdatedAt?: string,
): CompiledDay {
  const stops = day.stops.map((stop) => compileStop(stop, places, affiliates, now, guideUpdatedAt))
  const routeStops = stops.filter((stop) => stop.visit_status !== 'not_visited')
  return {
    day: day.day,
    title: day.title,
    summary: day.summary,
    physical_level: day.physical_level,
    stops,
    route_stops: routeStops,
    skipped_stops: stops.filter((stop) => stop.visit_status === 'not_visited'),
    n_stops: stops.length,
    n_route_stops: routeStops.length,
    route_line: routeStops.map((stop) => stop.place.short_name ?? stop.place.name),
    food: day.food,
    our_take: day.our_take,
    plan_b: day.plan_b,
    seniors_note: day.seniors_note,
    photo: day.photo,
    highlight: day.highlight,
    drive: day.drive,
    overnight: day.overnight,
  }
}

export function compileVariant(
  variant: VariantSource,
  places: PlaceRegistry,
  affiliates: AffiliateRegistry,
  now: Date = new Date(),
  guideUpdatedAt?: string,
): CompiledVariant {
  const days = variant.days.map((day) => compileDay(day, places, affiliates, now, guideUpdatedAt))
  const allStopPlaces = days.flatMap((day) => day.stops.map((stop) => stop.place))

  return {
    id: variant.id,
    name: variant.name,
    description: variant.description,
    days,
    n_stops_total: days.reduce((sum, day) => sum + day.n_stops, 0),
    n_route_stops_total: days.reduce((sum, day) => sum + day.route_stops.length, 0),
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
