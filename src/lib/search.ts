// The search page's filter. Pure and free of engine imports: the page's
// script bundles this file for the browser, so it must stay small.

/** A place of a guide, linked to the day it is visited on. */
export interface SearchPlace {
  name: string
  day: number
  /** The day card on the guide page: "/islandia/…/#dia-7". */
  url: string
  /** What the query is matched against, already normalized. */
  text: string
}

/** A guide and the places on its route, in route order. */
export interface SearchGuide {
  title: string
  destination: string
  url: string
  days: number
  /** Not published yet: listed with a "Borrador" pill, as on the landing page. */
  draft: boolean
  /** Cover photo, as a path under src/assets/guides/ (see guideImage), for the result's thumbnail. */
  cover: string | null
  /** Title and destination, normalized: a match keeps all its places. */
  text: string
  places: SearchPlace[]
}

// Letters that Unicode does not decompose into a base letter plus an accent.
// Icelandic ones first: "thingvellir" must find "Þingvellir". Only letters the
// site's fonts cover: the script ships inline, and fonts:check reads it.
const LETTERS: Record<string, string> = { þ: 'th', ð: 'd', æ: 'ae', ø: 'o', œ: 'oe', ß: 'ss' }

/** Lower case, no accents, Icelandic letters spelled out: "Jökulsárlón" → "jokulsarlon". */
export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[þðæøœß]/g, (letter) => LETTERS[letter])
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

/** The query's words, normalized. An empty or blank query has none. */
export function searchTerms(query: string): string[] {
  return normalizeSearch(query).split(/\s+/).filter(Boolean)
}

/** Whether every word appears somewhere in the text, in any order. No words match everything. */
export function matches(text: string, terms: string[]): boolean {
  return terms.every((term) => text.includes(term))
}

/**
 * The guides and places the query finds, in their original order. A guide
 * whose title or destination matches keeps all its places; otherwise it keeps
 * only the places that match, and drops out when none do. Generic so the
 * page's script can pass its own rows (each with its element) and get the
 * same objects back.
 */
export function filterSearch<G extends { text: string; places: { text: string }[] }>(guides: G[], query: string): G[] {
  const terms = searchTerms(query)
  if (terms.length === 0) return guides
  return guides.flatMap((guide) => {
    if (matches(guide.text, terms)) return [guide]
    const places = guide.places.filter((place) => matches(place.text, terms))
    return places.length ? [{ ...guide, places }] : []
  })
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** What the status line says about the results shown: "70 lugares en 2 guías", or "Sin resultados". */
export function searchSummary(places: number, guides: number): string {
  if (guides === 0) return 'Sin resultados'
  if (places === 0) return plural(guides, 'guía', 'guías')
  return `${plural(places, 'lugar', 'lugares')} en ${plural(guides, 'guía', 'guías')}`
}
