import type { Guide } from '../content/schema'
import type { CompiledGuide } from '../../engine/index.ts'
import { GROUP_LABELS } from './guide.ts'

/** What the landing page needs to list one guide, whichever source it comes from. */
export interface GuideListItem {
  title: string
  description: string
  destination: string
  days: number[]
  url: string
  lived: boolean
  /** Who and when, shown under the description. Only the legacy model records it. */
  livedNote: string | null
  draft: boolean
  updatedAt: string
}

/** A guide from the legacy `guides` content collection. */
export function fromLegacyGuide(id: string, guide: Guide): GuideListItem {
  const { meta } = guide
  const trip = meta.tripDone
  return {
    title: meta.title,
    description: meta.description,
    destination: meta.destination,
    days: meta.days,
    url: `/${meta.destination}/${id}/`,
    lived: trip !== null,
    livedNote: trip ? `${GROUP_LABELS[trip.group]} · ${trip.season} de ${trip.date.slice(0, 4)}` : null,
    draft: meta.draft,
    updatedAt: meta.updatedAt,
  }
}

/** A guide compiled by the engine. Anything not yet `published` is listed as a draft. */
export function fromCompiledGuide(guide: CompiledGuide): GuideListItem {
  const variantDays = guide.variants?.[0]?.days.length ?? guide.days
  return {
    title: guide.title,
    description: guide.description,
    destination: guide.destination,
    days: variantDays ? [variantDays] : [],
    url: `/${guide.destination}/${guide.slug}/`,
    lived: Boolean(guide.trip_done),
    livedNote: null,
    draft: guide.status !== 'published',
    updatedAt: guide.updated_at,
  }
}

/** Published guides first, then the most recently updated. */
export function sortGuideList(items: GuideListItem[]): GuideListItem[] {
  return [...items].sort((a, b) => {
    if (a.draft !== b.draft) return a.draft ? 1 : -1
    return b.updatedAt.localeCompare(a.updatedAt)
  })
}

/**
 * Engine guides listed on the landing page, as paths for loadCompiledGuide.
 * Explicit while there is a single engine guide: a glob over content/guides
 * would be the first discovery mechanism, and it is not needed yet.
 */
export const ENGINE_GUIDE_SOURCES: { guide: string; places: string }[] = [
  {
    guide: 'content/guides/islandia/islandia-en-camper-13-dias.yaml',
    places: 'content/places/islandia.yaml',
  },
]
