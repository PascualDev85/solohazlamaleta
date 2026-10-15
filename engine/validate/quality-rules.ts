import type { DaySource, PlaceSource, VariantSource } from '../../schemas/index.ts'
import type { PlaceRegistry } from '../types.ts'
import { resolvePlace } from '../compile/place.ts'

// Editorial quality checks that used to be done by hand. Every rule here only
// ever produces warnings: none of them blocks the build (1.7.2 §14, proposed
// by the implementer, pending the author's confirmation).

export const FIRST_PERSON = /\b(nosotros|nuestro|nuestra|nuestros|nuestras|nos|hicimos|vimos|fuimos|comimos|llegamos|estuvimos|recomendamos)\b/i

// Letter-aware word boundaries: JS \b is ASCII-only and fails around "á", "í".
const word = (source: string) => new RegExp(`(?<!\\p{L})(?:${source})(?!\\p{L})`, 'iu')

// Comparative superlatives in LUGAR.description. A figure in the same sentence
// ("una de las más altas, con 122 metros") counts as their source, so they only
// warn when the sentence has no digit.
const RANKING_SUPERLATIVES = [
  word('(?:uno|una) de (?:los|las)(?: \\p{L}+)? más'), // "una de las más", "una de las cascadas más"
  word('(?:el|la|los|las) más'),
  word('más famos[oa]s?'),
]

// Evaluative words: a figure never backs an opinion, so these always warn.
const EVALUATIVE_WORDS = [
  word('imprescindibles?'),
  word('espectacular(?:es)?'),
  word('incre[ií]bles?'),
  word('merecen? la pena'),
]

// Opinion markers in LUGAR.notes, on top of FIRST_PERSON. notes is practical
// information for any visitor (1.9 A.1); opinion belongs in the guide.
const NOTES_OPINION = [
  ...EVALUATIVE_WORDS,
  word('vale la pena'),
  word('recomiendo'),
  word('me (?:gustó|encantó|pareció)'),
  word('impresionantes?'),
  word('precios[oa]s?'),
]

// Instructions to the implementer that must not reach readers. "Pendiente de
// confirmar" is a legitimate, reader-safe flag and is deliberately absent.
const INTERNAL_INSTRUCTIONS: [label: string, pattern: RegExp][] = [
  ['"al confirmar coordenadas"', word('al confirmar (?:las )?coordenadas')],
  ['"lugar agrupado"', word('lugar agrupado')],
  ['"TODO"', /(?<!\p{L})TODO(?!\p{L})/u],
  ['"implementador"', word('implementador(?:es|a)?')],
  ['texto entre corchetes', /\[[^\]]*\]/],
]

const MIN_ALT_LENGTH = 20
// Longest name that fits the card's route line without a short_name.
const MAX_ROUTE_NAME_LENGTH = 16
const PRICE_MAX_AGE_MONTHS = 12

function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/)
}

function firstMatch(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[0]
  }
  return undefined
}

function where(variant: VariantSource, day: DaySource): string {
  return `variante ${variant.id}, día ${day.day}`
}

export function placeDescriptionWarnings(place: PlaceSource): string[] {
  if (!place.description) return []
  const warnings: string[] = []
  const firstPerson = place.description.match(FIRST_PERSON)
  if (firstPerson) {
    warnings.push(`[WARNING] ${place.place_id}: primera persona en description ("${firstPerson[0]}"): va en la guía, no en el lugar`)
  }
  for (const sentence of sentences(place.description)) {
    const ranking = /\d/.test(sentence) ? undefined : firstMatch(sentence, RANKING_SUPERLATIVES)
    const found = ranking ?? firstMatch(sentence, EVALUATIVE_WORDS)
    if (found) {
      warnings.push(`[WARNING] ${place.place_id}: superlativo u opinión sin cifra en description ("${found}")`)
    }
  }
  return warnings
}

export function placeNotesOpinionWarnings(place: PlaceSource): string[] {
  if (!place.notes) return []
  const found = place.notes.match(FIRST_PERSON)?.[0] ?? firstMatch(place.notes, NOTES_OPINION)
  return found ? [`[WARNING] ${place.place_id}: opinión o primera persona en notes ("${found}"): va en la guía, no en el lugar`] : []
}

export function placeNotesInternalWarnings(place: PlaceSource): string[] {
  if (!place.notes) return []
  const found = INTERNAL_INSTRUCTIONS.filter(([, pattern]) => pattern.test(place.notes!)).map(([label]) => label)
  return found.length > 0 ? [`[WARNING] ${place.place_id}: instrucción interna en notes (${found.join(', ')}): el lector la vería`] : []
}

export function longRouteNameWarnings(place: PlaceSource): string[] {
  if (place.short_name || place.name.length <= MAX_ROUTE_NAME_LENGTH) return []
  return [
    `[WARNING] ${place.place_id}: name de ${place.name.length} caracteres sin short_name en la línea de ruta de un día con drive ("${place.name}", máximo ${MAX_ROUTE_NAME_LENGTH})`,
  ]
}

/**
 * Entry and parking prices checked more than 12 months ago, whatever the
 * place's review_interval. Fields the regular staleness warning already
 * reports are left out, so nothing is said twice.
 */
export function outdatedPriceWarnings(place: PlaceSource, now: Date, alreadyReported: string[]): string[] {
  const priceFields = new Set(['entry.price', 'parking'])
  const outdated = resolvePlace({ ...place, review_interval: PRICE_MAX_AGE_MONTHS }, now).stale_fields
    .filter((field) => priceFields.has(field) && !alreadyReported.includes(field))
  return outdated.length > 0
    ? [`[WARNING] ${place.place_id}: precio verificado hace más de ${PRICE_MAX_AGE_MONTHS} meses (${outdated.join(', ')})`]
    : []
}

export function skippedStopWithoutReasonWarnings(variant: VariantSource, day: DaySource): string[] {
  return day.stops
    .filter((stop) => stop.visit_status === 'not_visited' && !stop.skip_reason)
    .map((stop) => `[WARNING] parada not_visited sin skip_reason: "Lo que dejamos fuera" no la mostrará (${where(variant, day)}, place_id ${stop.place_id})`)
}

function routeStops(day: DaySource) {
  return [...day.stops]
    .filter((stop) => stop.visit_status !== 'not_visited')
    .sort((a, b) => a.order - b.order)
}

export function driveDayTravelTimeWarnings(variant: VariantSource, day: DaySource): string[] {
  if (!day.drive) return []
  const missing = routeStops(day).slice(0, -1).filter((stop) => stop.travel_to_next_min == null)
  return missing.length > 0
    ? [`[WARNING] día con drive y paradas de ruta sin travel_to_next_min (${where(variant, day)}, place_id ${missing.map((s) => s.place_id).join(', ')})`]
    : []
}

export function dayPhotoAltWarnings(variant: VariantSource, day: DaySource): string[] {
  if (!day.photo) return []
  const alt = day.photo.alt.trim()
  const warnings: string[] = []
  if (day.photo.caption && alt.toLowerCase() === day.photo.caption.trim().toLowerCase()) {
    warnings.push(`[WARNING] photo.alt repite el caption: describe la imagen, no la firma (${where(variant, day)})`)
  }
  if (alt.length < MIN_ALT_LENGTH) {
    warnings.push(`[WARNING] photo.alt de ${alt.length} caracteres, menos de ${MIN_ALT_LENGTH} (${where(variant, day)})`)
  }
  return warnings
}

/** Places on the route line of every day that has a drive. */
export function driveDayRoutePlaces(variant: VariantSource, places: PlaceRegistry): PlaceSource[] {
  return variant.days
    .filter((day) => day.drive)
    .flatMap((day) => routeStops(day))
    .map((stop) => places.get(stop.place_id))
    .filter((place): place is PlaceSource => place != null)
}

export function overnightSequenceWarnings(variant: VariantSource): string[] {
  const days = [...variant.days].sort((a, b) => a.day - b.day)
  const warnings: string[] = []
  const lastDay = days.at(-1)?.day

  for (const day of days) {
    if (day.overnight === undefined && day.day !== lastDay) {
      warnings.push(`[WARNING] día sin overnight que no es el último (${where(variant, day)}): usa null si la noche fue fuera de un camping`)
    }
  }

  const nightsByPlace = new Map<string, number[]>()
  for (const day of days) {
    if (day.overnight) nightsByPlace.set(day.overnight, [...(nightsByPlace.get(day.overnight) ?? []), day.day])
  }
  for (const [placeId, nights] of nightsByPlace) {
    if (nights.some((night, i) => i > 0 && night !== nights[i - 1] + 1)) {
      warnings.push(`[WARNING] overnight ${placeId} repetido en días no consecutivos (variante ${variant.id}, días ${nights.join(', ')})`)
    }
  }
  return warnings
}
