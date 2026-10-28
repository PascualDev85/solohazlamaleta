import type { GuideListItem } from './guide-list.ts'
import { destinationLabel } from './search-index.ts'

/** One destination on the landing page: its guides counted, and where the card leads. */
export interface DestinationCard {
  slug: string
  name: string
  guides: number
  /** The destination's hub when it has one ("/islandia/"), otherwise its first guide. */
  url: string
  /** Every guide of it is still a draft. */
  draft: boolean
  /** Cover of its first guide that has one (a path under src/assets/guides/). */
  cover: string | null
}

/**
 * The hub pages that exist, from the keys of import.meta.glob over
 * src/pages: "/src/pages/islandia/index.astro" is the hub of "islandia".
 * Only destinations that have guides count, so /buscar/ is not taken for one.
 */
export function hubPathsFromPages(pageKeys: string[], destinations: string[]): Set<string> {
  const hubs = new Set<string>()
  for (const key of pageKeys) {
    const slug = key.match(/^\/src\/pages\/([^/]+)\/index\.astro$/)?.[1]
    if (slug && destinations.includes(slug)) hubs.add(`/${slug}/`)
  }
  return hubs
}

/**
 * Destinations in the order of the guide list (published first), each with
 * how many guides it has. A destination whose guides are all drafts goes last.
 */
export function destinationCards(items: GuideListItem[], hubPaths: Set<string>): DestinationCard[] {
  const bySlug = new Map<string, GuideListItem[]>()
  for (const item of items) bySlug.set(item.destination, [...(bySlug.get(item.destination) ?? []), item])
  const cards = [...bySlug].map(([slug, guides]): DestinationCard => {
    const hub = `/${slug}/`
    return {
      slug,
      name: destinationLabel(slug),
      guides: guides.length,
      url: hubPaths.has(hub) ? hub : guides[0].url,
      draft: guides.every((guide) => guide.draft),
      cover: guides.find((guide) => guide.coverImage)?.coverImage ?? null,
    }
  })
  return [...cards.filter((card) => !card.draft), ...cards.filter((card) => card.draft)]
}

/** The figures in "Hola, somos…": all counted from the guides, none written by hand. */
export interface HomeStats {
  guides: number
  destinations: number
  /** Days of route planned: the longest version of each guide. */
  days: number
  /** Places on the routes, each linked to its day. */
  places: number
}

export function homeStats(items: GuideListItem[], index: { places: unknown[] }[]): HomeStats {
  return {
    guides: items.length,
    destinations: new Set(items.map((item) => item.destination)).size,
    days: items.reduce((sum, item) => sum + Math.max(0, ...item.days), 0),
    places: index.reduce((sum, guide) => sum + guide.places.length, 0),
  }
}

/**
 * The postcards behind the hero's cover: the authors' other photos of the
 * same destination (the cover's folder under src/assets/guides/), in a stable
 * order, at most `max`. Only the authors' own photos live there, so nothing
 * from a third party ends up in the stack.
 */
export function postcardPhotos(cover: string, paths: string[], max = 3): string[] {
  const folder = cover.slice(0, cover.lastIndexOf('/') + 1)
  return paths
    .filter((path) => path !== cover && path.startsWith(folder) && !path.slice(folder.length).includes('/'))
    .sort()
    .slice(0, max)
}
