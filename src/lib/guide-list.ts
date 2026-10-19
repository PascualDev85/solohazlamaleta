import type { Guide } from '../content/schema'
import { isPublished, guidePath } from '../../engine/index.ts'
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
  /** Cover photo, as a path under src/assets/guides/ (see guideImage). Null when the guide has none yet. */
  coverImage: string | null
  /**
   * Budget per person, only when the engine derived it from the itemised
   * budget. The legacy model's range is written by hand, so it is not listed.
   */
  budgetPerPerson: { amount: number; currency: string } | null
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
    coverImage: meta.coverImage ?? null,
    budgetPerPerson: null,
  }
}

/** A guide compiled by the engine. Anything not yet `published` is listed as a draft (see isPublished). */
export function fromCompiledGuide(guide: CompiledGuide): GuideListItem {
  const variantDays = guide.variants?.[0]?.days.length ?? guide.days
  const perPerson = guide.summary.budget_per_person
  return {
    title: guide.title,
    description: guide.description,
    destination: guide.destination,
    days: variantDays ? [variantDays] : [],
    url: guidePath(guide),
    lived: Boolean(guide.trip_done),
    livedNote: null,
    draft: !isPublished(guide),
    updatedAt: guide.updated_at,
    coverImage: guide.cover_image,
    budgetPerPerson:
      perPerson != null && guide.budget ? { amount: perPerson, currency: guide.budget.currency } : null,
  }
}

/** Published guides first, then the most recently updated. */
export function sortGuideList(items: GuideListItem[]): GuideListItem[] {
  return [...items].sort((a, b) => {
    if (a.draft !== b.draft) return a.draft ? 1 : -1
    return b.updatedAt.localeCompare(a.updatedAt)
  })
}

// The engine guides to list live in the engine, shared with the sitemap.
export { ENGINE_GUIDE_SOURCES } from '../../engine/index.ts'
