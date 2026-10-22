import type { CompiledDay, CompiledPlace } from '../../engine/index.ts'
import { dayAnchorId } from './anchors.ts'
import { shortName } from './placeName.ts'

/** The part of a compiled day that the hub's "Qué ver" needs. */
export interface DayToSee {
  day: number
  title: string
  photo?: CompiledDay['photo']
  stops: {
    visit_status: 'visited' | 'not_visited' | 'unknown'
    place: Pick<CompiledPlace, 'place_id' | 'name' | 'short_name' | 'type'>
  }[]
}

export interface WhatToSeeGroup {
  day: number
  /** The day's title already names its area ("Círculo Dorado", "Fiordos del este"). */
  title: string
  /** The day in the guide: where the reader sees how we visited each place. */
  href: string
  photo?: CompiledDay['photo']
  places: { place_id: string; name: string }[]
}

// Places that are on the route but are not something to see.
const NOT_SIGHTS = new Set(['food', 'accommodation', 'transport'])

/**
 * "Qué ver" on the destination hub (1.13 §6), derived from the route, never
 * written by hand: the places we visited, grouped by the day we visited them,
 * each linking to that day in the guide. A place visited on two days is listed
 * on the first; a day with nothing left is dropped.
 */
export function whatToSeeByDay(days: DayToSee[], guideHref: string): WhatToSeeGroup[] {
  const seen = new Set<string>()
  const groups: WhatToSeeGroup[] = []
  for (const day of days) {
    const places = day.stops
      .filter((stop) => stop.visit_status === 'visited' && !NOT_SIGHTS.has(stop.place.type))
      .filter((stop) => !seen.has(stop.place.place_id))
      .map((stop) => {
        seen.add(stop.place.place_id)
        return { place_id: stop.place.place_id, name: shortName(stop.place) }
      })
    if (places.length === 0) continue
    groups.push({
      day: day.day,
      title: day.title,
      href: `${guideHref}#${dayAnchorId(day.day)}`,
      photo: day.photo,
      places,
    })
  }
  return groups
}
