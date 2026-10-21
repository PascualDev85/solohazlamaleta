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

/** A published guide and the places on its route, in route order. */
export interface SearchGuide {
  title: string
  destination: string
  url: string
  days: number
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
