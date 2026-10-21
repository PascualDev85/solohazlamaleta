import type { Guide } from '../content/schema'
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
 * What the search lists, built at build time from the compiled guides: every
 * guide, drafts marked as such (see isPublished), each with the places on its
 * route (the first variant, the one the guide page shows) and the day each is
 * visited. A place visited twice on one day is listed once.
 */
export function buildSearchIndex(guides: CompiledGuide[]): SearchGuide[] {
  return guides.map((guide) => {
    const url = guidePath(guide)
    const days = guide.variants?.[0]?.days ?? []
    const places: SearchPlace[] = days.flatMap((day) => {
      const seen = new Set<string>()
      return day.route_stops.flatMap(({ place }) => {
        if (seen.has(place.place_id)) return []
        seen.add(place.place_id)
        return [searchPlace(place.name, day.day, url, place.short_name)]
      })
    })
    return {
      title: guide.title,
      destination: guide.destination,
      url,
      days: days.length || (guide.days ?? 0),
      draft: !isPublished(guide),
      cover: guide.cover_image,
      text: normalizeSearch(`${guide.title} ${destinationLabel(guide.destination)}`),
      places,
    }
  })
}

/** A guide of the legacy `guides` collection (Alsacia), indexed the same way: its stops, day by day. */
export function legacySearchGuide(id: string, guide: Guide): SearchGuide {
  const { meta } = guide
  const url = `/${meta.destination}/${id}/`
  const places = guide.days.flatMap((day) => {
    const seen = new Set<string>()
    return day.stops.flatMap((stop) => {
      if (seen.has(stop.name)) return []
      seen.add(stop.name)
      return [searchPlace(stop.name, day.day, url)]
    })
  })
  return {
    title: meta.title,
    destination: meta.destination,
    url,
    days: Math.max(...meta.days),
    draft: meta.draft,
    cover: meta.coverImage ?? null,
    text: normalizeSearch(`${meta.title} ${destinationLabel(meta.destination)}`),
    places,
  }
}

/** One place of a guide, linked to the day card it is visited on. */
function searchPlace(name: string, day: number, guideUrl: string, shortName?: string | null): SearchPlace {
  return {
    name,
    day,
    url: `${guideUrl}#${dayAnchorId(day)}`,
    text: normalizeSearch([name, shortName].filter(Boolean).join(' ')),
  }
}
