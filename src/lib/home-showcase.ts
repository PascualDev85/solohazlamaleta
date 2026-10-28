import type { CompiledDay, CompiledGuide, CompiledStop } from '../../engine/index.ts'
import { shortName } from './placeName.ts'

type ChecklistItem = NonNullable<CompiledGuide['booking_checklist']>[number]

// "Dentro de cada guía" on the landing page shows one real day of a guide
// instead of describing it, with margin notes that quote the guide's own
// facts. Everything here is picked from the compiled guide, never written.

/**
 * The day to show: the first with a photo, a night and at least three stops,
 * so the excerpt carries all a day card does. Otherwise the first day with
 * stops; null when no day has any.
 */
export function showcaseDay(days: CompiledDay[]): CompiledDay | null {
  const withStops = days.filter((day) => day.route_stops.length > 0)
  return withStops.find((day) => day.photo && day.overnight && day.route_stops.length >= 3) ?? withStops[0] ?? null
}

/** What to book and when: the first high-priority item of the checklist, otherwise its first. */
export function bookingNote(items: readonly ChecklistItem[] | undefined): { label: string; when: string } | null {
  const item = items?.find((i) => i.priority === 'alta') ?? items?.[0]
  return item ? { label: item.label, when: item.when } : null
}

/**
 * A price with its date: the first stop that pays for its own car park
 * (not free, not shared with another stop), and when that price was checked.
 */
export function checkedParking(
  stops: CompiledStop[],
): { place: string; price: number; currency: string; verifiedAt: string } | null {
  const stop = stops.find((s) => s.place.parking && s.place.parking.price > 0 && !s.parking_shared_with)
  const parking = stop?.place.parking
  if (!stop || !parking) return null
  return { place: shortName(stop.place), price: parking.price, currency: parking.currency, verifiedAt: parking.verified_at }
}

/** "1 destino", "2 destinos". */
export function countLabel(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}
