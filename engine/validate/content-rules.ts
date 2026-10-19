import type { GuideSource, PlaceSource } from '../../schemas/index.ts'
import type { PlaceRegistry } from '../types.ts'
import { resolvePlace } from '../compile/place.ts'
import {
  FIRST_PERSON,
  placeDescriptionWarnings,
  placeNotesOpinionWarnings,
  placeNotesInternalWarnings,
  longRouteNameWarnings,
  outdatedPriceWarnings,
  skippedStopWithoutReasonWarnings,
  driveDayTravelTimeWarnings,
  dayPhotoAltWarnings,
  driveDayRoutePlaces,
  overnightSequenceWarnings,
} from './quality-rules.ts'

export interface ContentRuleResult {
  errors: string[]
  warnings: string[]
}

export type BuildEnv = 'development' | 'production'

function defaultEnv(): BuildEnv {
  return process.env.NODE_ENV === 'production' ? 'production' : 'development'
}

export function validateContentRules(
  guide: GuideSource,
  places: PlaceRegistry,
  now: Date = new Date(),
  env: BuildEnv = defaultEnv(),
): ContentRuleResult {
  const errors: string[] = []
  const warnings: string[] = []
  // place_id → stale fields already reported for it.
  const warnedStalePlaces = new Map<string, string[]>()

  if (guide.status === 'draft') {
    if (env === 'production') {
      errors.push('[ERROR] status: draft no puede compilarse en build de producción')
    } else {
      warnings.push('[WARNING] status: draft (bloqueará el build en producción)')
    }
  }

  if (guide.budget && guide.base_travelers == null) {
    warnings.push('[WARNING] budget presente sin base_travelers: se asumirá 1 viajero para total_reference')
  }

  const allBudgetItems = [
    ...(guide.budget?.items ?? []),
    ...(guide.variants ?? []).flatMap((v) => v.budget_delta?.items ?? []),
  ]
  for (const item of allBudgetItems) {
    if (item.basis === 'per_room' && item.travelers_per_room == null) {
      warnings.push(
        `[WARNING] ítem de presupuesto "${item.label}" con basis: per_room sin travelers_per_room: se asumirá 1 viajero por habitación`,
      )
    }
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

        if (stop.skip_reason && visitStatus !== 'not_visited') {
          errors.push(
            `[ERROR] skip_reason presente en parada con visit_status: ${visitStatus} (variante ${variant.id}, día ${day.day}, place_id ${stop.place_id})`,
          )
        }

        if (stop.variant_note && FIRST_PERSON.test(stop.variant_note) && visitStatus !== 'visited') {
          warnings.push(
            `[WARNING] primera persona en variant_note sin visit_status: visited (día ${day.day}, place_id ${stop.place_id})`,
          )
        }

        const place = places.get(stop.place_id)
        if (place && !warnedStalePlaces.has(place.place_id)) {
          const resolved = resolvePlace(place, now)
          if (resolved.is_stale) {
            warnedStalePlaces.set(place.place_id, resolved.stale_fields)
            warnings.push(
              `[WARNING] ${place.place_id}: datos caducados (${resolved.stale_fields.join(', ')})`,
            )
          }
        }
      }

      warnings.push(...skippedStopWithoutReasonWarnings(variant, day))
      warnings.push(...driveDayTravelTimeWarnings(variant, day))
      warnings.push(...dayPhotoAltWarnings(variant, day))
    }

    warnings.push(...overnightSequenceWarnings(variant))
  }

  warnings.push(...placeQualityWarnings(guide, places, now, warnedStalePlaces))

  if (guide.content_type === 'experience' && !guide.trip_done) {
    warnings.push('[WARNING] content_type: experience sin trip_done')
  }

  return { errors, warnings }
}

function referencedPlaceIds(guide: GuideSource): Set<string> {
  const ids = new Set<string>()
  for (const variant of guide.variants ?? []) {
    for (const day of variant.days) {
      for (const stop of day.stops) ids.add(stop.place_id)
      if (day.overnight) ids.add(day.overnight)
    }
  }
  for (const zone of guide.accommodation?.zones ?? []) {
    for (const pick of zone.picks ?? []) ids.add(pick.place_id)
  }
  return ids
}

/** Editorial checks on every place the guide references, once per place. */
function placeQualityWarnings(
  guide: GuideSource,
  places: PlaceRegistry,
  now: Date,
  reportedStale: Map<string, string[]>,
): string[] {
  const warnings: string[] = []
  for (const placeId of referencedPlaceIds(guide)) {
    const place = places.get(placeId)
    if (!place) continue
    warnings.push(...placeDescriptionWarnings(place))
    warnings.push(...placeNotesOpinionWarnings(place))
    warnings.push(...placeNotesInternalWarnings(place))
    warnings.push(...outdatedPriceWarnings(place, now, reportedStale.get(placeId) ?? []))
  }

  const routePlaces = new Map<string, PlaceSource>()
  for (const variant of guide.variants ?? []) {
    for (const place of driveDayRoutePlaces(variant, places)) routePlaces.set(place.place_id, place)
  }
  for (const place of routePlaces.values()) warnings.push(...longRouteNameWarnings(place))

  return warnings
}
