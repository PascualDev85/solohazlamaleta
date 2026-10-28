import type { Guide } from '../content/schema'
import { isPublished, guidePath } from '../../engine/index.ts'
import type { CompiledGuide } from '../../engine/index.ts'
import { dayAnchorId } from './anchors.ts'
import { engineGuideSections, legacyGuideSections } from './guide-sections.ts'
import type { GuideSection } from './guide-sections.ts'
import { normalizeSearch, searchTerms } from './search.ts'
import type { Matchable, SearchGuide, SearchKind, SearchPlace, SearchSection } from './search.ts'

/** A destination slug as a name: "islandia" → "Islandia", "costa-brava" → "Costa brava". */
export function destinationLabel(slug: string): string {
  const words = slug.replace(/-/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * Which of the day's places its photo shows, from the caption the author
 * wrote ("Gullfoss, septiembre de 2025": the words before the comma), or -1.
 */
export function photoPlaceIndex(caption: string | undefined, places: Matchable[]): number {
  const terms = searchTerms(caption?.split(',')[0] ?? '')
  if (terms.length === 0) return -1
  return places.findIndex((place) => terms.every((term) => place.text.split(/\s+/).includes(term)))
}

/**
 * What the search lists, built at build time from the compiled guides: every
 * guide, drafts marked as such (see isPublished), each with the places on its
 * route (the first variant, the one the guide page shows), the day each is
 * visited, and the sections of its page. A place visited twice on one day is
 * listed once.
 */
export function buildSearchIndex(guides: CompiledGuide[]): SearchGuide[] {
  return guides.map((guide) => {
    const url = guidePath(guide)
    const days = guide.variants?.[0]?.days ?? []
    const places: SearchPlace[] = days.flatMap((day) => {
      const seen = new Set<string>()
      const dayPlaces = day.route_stops.flatMap(({ place }) => {
        if (seen.has(place.place_id)) return []
        seen.add(place.place_id)
        return [searchPlace(place.name, day.day, url, place.short_name)]
      })
      const pictured = photoPlaceIndex(day.photo?.caption, dayPlaces)
      if (pictured >= 0 && day.photo) dayPlaces[pictured].photo = day.photo.src
      return dayPlaces
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
      sections: engineGuideSections(guide).map((section) => searchSection(section, url)),
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
    sections: legacyGuideSections(guide).map((section) => searchSection(section, url)),
  }
}

/** One place of a guide, linked to the day card it is visited on. */
function searchPlace(name: string, day: number, guideUrl: string, shortName?: string | null): SearchPlace {
  return {
    name,
    day,
    url: `${guideUrl}#${dayAnchorId(day)}`,
    text: normalizeSearch([name, shortName].filter(Boolean).join(' ')),
    photo: null,
  }
}

function searchSection({ id, label, icon }: GuideSection, guideUrl: string): SearchSection {
  return { id, label, icon, url: `${guideUrl}#${id}`, text: normalizeSearch(`${label} ${id}`) }
}

/**
 * What the search window suggests before anything is typed: the places in
 * the authors' own photos, then the first stop of each guide that has none of
 * them. Chosen from the data, not from any popularity the site cannot measure.
 */
export function featuredPlaces(guides: SearchGuide[], max: number): (SearchPlace & { guide: SearchGuide })[] {
  const pictured = guides.flatMap((guide) => guide.places.filter((place) => place.photo).map((place) => ({ ...place, guide })))
  const firsts = guides
    .filter((guide) => guide.places.length > 0 && !guide.places.some((place) => place.photo))
    .map((guide) => ({ ...guide.places[0], guide }))
  return [...pictured, ...firsts].slice(0, max)
}

/** One result, of any kind, as the panel renders it. */
export interface SearchEntry extends Matchable {
  label: string
  /** The second line: the guide of a place or section, the count of a destination's guides. */
  detail: string
  url: string
  context: string
  /** A photo, as a path under src/assets/guides/, or null. */
  image: string | null
  /** A place's day, shown in its coin. */
  day?: number
  /** A section's icon (SectionIcon). */
  icon?: string
  draft?: boolean
}

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/**
 * The guides as the panel's four groups of results. A destination leads to
 * its hub page when it exists (hubPaths, as on the landing page), else to its
 * first guide. Places and sections carry their guide and destination as
 * context: "gullfoss islandia" and "presupuesto islandia" find them.
 */
export function searchEntries(guides: SearchGuide[], hubPaths: Set<string>): Record<SearchKind, SearchEntry[]> {
  const destinations = new Map<string, SearchGuide[]>()
  for (const guide of guides) destinations.set(guide.destination, [...(destinations.get(guide.destination) ?? []), guide])
  return {
    destination: [...destinations].map(([slug, list]) => {
      const name = destinationLabel(slug)
      return {
        label: name,
        detail: count(list.length, 'guía', 'guías') + (list.every((guide) => guide.draft) ? ' · en preparación' : ''),
        url: hubPaths.has(`/${slug}/`) ? `/${slug}/` : list[0].url,
        text: normalizeSearch(name),
        context: '',
        image: list.find((guide) => guide.cover)?.cover ?? null,
      }
    }),
    guide: guides.map((guide) => ({
      label: guide.title,
      detail: `${guide.days} días · ${count(guide.places.length, 'lugar', 'lugares')}`,
      url: guide.url,
      text: normalizeSearch(guide.title),
      context: normalizeSearch(destinationLabel(guide.destination)),
      image: guide.cover,
      draft: guide.draft,
    })),
    place: guides.flatMap((guide) =>
      guide.places.map((place) => ({
        label: place.name,
        detail: guide.title,
        url: place.url,
        text: place.text,
        context: normalizeSearch(`${destinationLabel(guide.destination)} ${guide.title}`),
        image: null,
        day: place.day,
      })),
    ),
    section: guides.flatMap((guide) =>
      guide.sections.map((section) => ({
        label: section.label,
        detail: guide.title,
        url: section.url,
        text: section.text,
        context: normalizeSearch(`${destinationLabel(guide.destination)} ${guide.title}`),
        image: null,
        icon: section.icon,
      })),
    ),
  }
}
