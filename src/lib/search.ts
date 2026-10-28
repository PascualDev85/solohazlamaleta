// The search's matching, ranking and highlighting. Pure and free of engine
// imports: the panel's script bundles this file for the browser, so it must
// stay small.

/** A place of a guide, linked to the day it is visited on. */
export interface SearchPlace {
  name: string
  day: number
  /** The day card on the guide page: "/islandia/…/#dia-7". */
  url: string
  /** What the query is matched against, already normalized. */
  text: string
  /** The day's photo when it shows this place (see photoPlaceIndex), as a path under src/assets/guides/. */
  photo: string | null
}

/** A section of a guide page: "Presupuesto real", linked to "/islandia/…/#presupuesto". */
export interface SearchSection {
  id: string
  label: string
  icon: string
  url: string
  /** Its title and id, normalized: "faq" finds "Preguntas frecuentes". */
  text: string
}

/** A guide, the places on its route in route order, and the sections of its page. */
export interface SearchGuide {
  title: string
  destination: string
  url: string
  days: number
  /** Not published yet: listed with a "Borrador" pill, as on the landing page. */
  draft: boolean
  /** Cover photo, as a path under src/assets/guides/ (see guideImage), for the result's thumbnail. */
  cover: string | null
  /** Title and destination, normalized. */
  text: string
  places: SearchPlace[]
  sections: SearchSection[]
}

/** The four groups of results, in the order the panel shows them. */
export const SEARCH_KINDS = ['destination', 'guide', 'place', 'section'] as const
export type SearchKind = (typeof SEARCH_KINDS)[number]

/** What can be searched: its own words and, optionally, the words around it (its guide, its destination). */
export interface Matchable {
  text: string
  context?: string
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

/** Letters added, dropped, changed or two neighbours swapped to turn one word into the other. */
export function editDistance(a: string, b: string): number {
  // Optimal string alignment: Levenshtein plus adjacent swaps, three rows.
  let before: number[] = []
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const current = [i]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) current[j] = Math.min(current[j], before[j - 2] + 1)
    }
    before = previous
    previous = current
  }
  return previous[b.length]
}

/** Shorter words match exactly only: one edit in "foss" would find half of Iceland. */
const FUZZY_MIN = 5

/**
 * The length of the start of the word that is one edit from the term, or 0.
 * The start, not the whole word, so a word still being typed counts too
 * ("gulfos" → "gullfos|s"). The longest start wins, to mark the most.
 */
function fuzzyLength(term: string, word: string): number {
  if (term.length < FUZZY_MIN) return 0
  for (const length of [term.length + 1, term.length, term.length - 1]) {
    if (length <= word.length && editDistance(term, word.slice(0, length)) <= 1) return length
  }
  return 0
}

/** Whether a word (5 letters or more) is one letter added, dropped, changed or swapped from the start of the word. */
export function fuzzyWordMatch(term: string, word: string): boolean {
  return fuzzyLength(term, word) > 0
}

/** Where a term is in normalized text: the exact text first, else a word one edit away. */
export function findTerm(text: string, term: string): { start: number; end: number; fuzzy: boolean } | null {
  // The first time it starts a word, else the first time at all.
  let start = text.indexOf(term)
  for (let at = start; at >= 0; at = text.indexOf(term, at + 1)) {
    if (wordStart(text, at)) {
      start = at
      break
    }
  }
  if (start >= 0) return { start, end: start + term.length, fuzzy: false }
  for (const word of text.matchAll(/[\p{L}\p{N}]+/gu)) {
    const length = fuzzyLength(term, word[0])
    if (length) return { start: word.index, end: word.index + length, fuzzy: true }
  }
  return null
}

const wordStart = (text: string, index: number) => index === 0 || !/[\p{L}\p{N}]/u.test(text[index - 1])

/**
 * How well the terms match: 0 when every word found in the entry's own text
 * starts a word there, 1 when one is found inside a word, 2 when one is a
 * typo; null when a word is missing. Words may come from the context ("gullfoss
 * islandia"), but one must be the entry's own, so a destination alone does
 * not list every place in it.
 */
export function matchScore(entry: Matchable, terms: string[]): number | null {
  let own = false
  let score = 0
  for (const term of terms) {
    const found = findTerm(entry.text, term)
    if (found) {
      own = true
      score = Math.max(score, found.fuzzy ? 2 : wordStart(entry.text, found.start) ? 0 : 1)
      continue
    }
    const around = entry.context ? findTerm(entry.context, term) : null
    if (!around) return null
    if (around.fuzzy) score = 2
  }
  return own ? score : null
}

/** What the query finds, best first: exact before typos; otherwise in their original order. An empty query finds nothing. */
export function rankSearch<T extends Matchable>(entries: T[], query: string): T[] {
  const terms = searchTerms(query)
  if (terms.length === 0) return []
  return entries
    .map((entry, index) => ({ entry, index, score: matchScore(entry, terms) }))
    .filter((hit): hit is { entry: T; index: number; score: number } => hit.score !== null)
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((hit) => hit.entry)
}

/** The stretches of the label, as [start, end) in its own letters, that the query's words matched: what the panel marks. */
export function highlightRanges(label: string, query: string): [number, number][] {
  // Normalize letter by letter, keeping where each one came from: "Þ" is two letters once normalized.
  let text = ''
  const from: number[] = []
  for (let i = 0; i < label.length; i++) {
    const letters = normalizeSearch(label[i])
    text += letters
    for (let n = 0; n < letters.length; n++) from.push(i)
  }
  const ranges = searchTerms(query)
    .map((term) => findTerm(text, term))
    .filter((found) => found !== null)
    .map(({ start, end }): [number, number] => [from[start], from[end - 1] + 1])
    .sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const range of ranges) {
    const last = merged.at(-1)
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1])
    else merged.push(range)
  }
  return merged
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

const KIND_NAMES: Record<SearchKind, [string, string]> = {
  destination: ['destino', 'destinos'],
  guide: ['guía', 'guías'],
  place: ['lugar', 'lugares'],
  section: ['sección', 'secciones'],
}

/** What the status line announces: "11 resultados: 1 guía, 8 lugares y 2 secciones", or "Sin resultados". */
export function resultsSummary(counts: Record<SearchKind, number>): string {
  const parts = SEARCH_KINDS.filter((kind) => counts[kind] > 0).map((kind) => plural(counts[kind], ...KIND_NAMES[kind]))
  if (parts.length === 0) return 'Sin resultados'
  const total = SEARCH_KINDS.reduce((sum, kind) => sum + counts[kind], 0)
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} y ${parts.at(-1)}`
  return `${plural(total, 'resultado', 'resultados')}: ${list}`
}
