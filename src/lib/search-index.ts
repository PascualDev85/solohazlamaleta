import { isPublished, guidePath } from '../../engine/index.ts'
import type { CompiledGuide } from '../../engine/index.ts'
import { dayAnchorId } from './anchors.ts'
import { normalizeSearch } from './search.ts'
import type { SearchGuide, SearchPlace } from './search.ts'

/** A destination slug as a name: "islandia" → "Islandia", "costa-brava" → "Costa brava". */
export function destinationLabel(slug: string): string {
  const words = slug.replace(/-/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * What the search page lists, built at build time from the compiled guides:
 * only published ones (see isPublished), each with the places on its route
 * (the first variant, the one the guide page shows) and the day each is
 * visited. A place visited twice on one day is listed once.
 */
export function buildSearchIndex(guides: CompiledGuide[]): SearchGuide[] {
  return guides.filter(isPublished).map((guide) => {
    const url = guidePath(guide)
    const days = guide.variants?.[0]?.days ?? []
    const places: SearchPlace[] = days.flatMap((day) => {
      const seen = new Set<string>()
      return day.route_stops.flatMap(({ place }) => {
        if (seen.has(place.place_id)) return []
        seen.add(place.place_id)
        return [{
          name: place.name,
          day: day.day,
          url: `${url}#${dayAnchorId(day.day)}`,
          text: normalizeSearch([place.name, place.short_name].filter(Boolean).join(' ')),
        }]
      })
    })
    return {
      title: guide.title,
      destination: guide.destination,
      url,
      days: days.length || (guide.days ?? 0),
      text: normalizeSearch(`${guide.title} ${destinationLabel(guide.destination)}`),
      places,
    }
  })
}
