import { test } from 'node:test'
import assert from 'node:assert'
import { readFile } from 'node:fs/promises'
import type { CompiledGuide } from '../../engine/index.ts'
import { loadCompiledGuide } from '../../src/lib/engine-guide.ts'
import { filterSearch, matches, normalizeSearch, searchSummary, searchTerms } from '../../src/lib/search.ts'
import type { SearchGuide } from '../../src/lib/search.ts'
import { buildSearchIndex, destinationLabel, legacySearchGuide } from '../../src/lib/search-index.ts'

const ISLANDIA_GUIDE = 'content/guides/islandia/islandia-en-camper-13-dias.yaml'
const ISLANDIA_PLACES = 'content/places/islandia.yaml'

/** The Islandia guide as if it were published: today it is "reviewed". */
async function publishedIslandia(): Promise<CompiledGuide> {
  return { ...(await loadCompiledGuide(ISLANDIA_GUIDE, ISLANDIA_PLACES)), status: 'published' }
}

test('normalizeSearch ignores case, accents and Icelandic letters', () => {
  assert.strictEqual(normalizeSearch('Jökulsárlón'), 'jokulsarlon')
  assert.strictEqual(normalizeSearch('P.N. de Þingvellir'), 'p.n. de thingvellir')
  assert.strictEqual(normalizeSearch('Goðafoss'), 'godafoss')
  assert.strictEqual(normalizeSearch('SKÓGAFOSS'), 'skogafoss')
  assert.strictEqual(normalizeSearch('Cañón'), 'canon')
  assert.strictEqual(normalizeSearch('Æðey'), 'aedey')
})

test('searchTerms splits the query into normalized words, ignoring extra spaces', () => {
  assert.deepStrictEqual(searchTerms('  Þingvellir   Geysir '), ['thingvellir', 'geysir'])
  assert.deepStrictEqual(searchTerms('   '), [])
})

test('matches needs every word somewhere in the text, in any order', () => {
  const text = normalizeSearch('Laguna Glaciar Fjallsárlón')
  assert.ok(matches(text, searchTerms('fjallsarlon')))
  assert.ok(matches(text, searchTerms('glaciar laguna')))
  assert.ok(matches(text, searchTerms('lagu')))
  assert.ok(!matches(text, searchTerms('laguna azul')))
  assert.ok(matches(text, []), 'an empty query matches everything')
})

const sample: SearchGuide[] = [
  {
    title: 'Islandia en camper', destination: 'islandia', url: '/islandia/x/', days: 13, draft: false, cover: null,
    text: normalizeSearch('Islandia en camper islandia'),
    places: [
      { name: 'Skógafoss', day: 2, url: '/islandia/x/#dia-2', text: normalizeSearch('Skógafoss') },
      { name: 'Jökulsárlón', day: 4, url: '/islandia/x/#dia-4', text: normalizeSearch('Jökulsárlón') },
      { name: 'Seljalandsfoss', day: 2, url: '/islandia/x/#dia-2', text: normalizeSearch('Seljalandsfoss') },
    ],
  },
  {
    title: 'Mallorca sin coche', destination: 'mallorca', url: '/mallorca/y/', days: 5, draft: true, cover: null,
    text: normalizeSearch('Mallorca sin coche mallorca'),
    places: [{ name: 'Cala Varques', day: 1, url: '/mallorca/y/#dia-1', text: normalizeSearch('Cala Varques') }],
  },
]

test('filterSearch keeps only the matching places, in their original order', () => {
  const result = filterSearch(sample, 'foss')
  assert.deepStrictEqual(result.map((g) => g.title), ['Islandia en camper'])
  assert.deepStrictEqual(result[0].places.map((p) => p.name), ['Skógafoss', 'Seljalandsfoss'])
})

test('filterSearch finds "jokulsarlon", "skogafoss" without accents', () => {
  assert.deepStrictEqual(filterSearch(sample, 'jokulsarlon')[0].places.map((p) => p.name), ['Jökulsárlón'])
  assert.deepStrictEqual(filterSearch(sample, 'skogafoss')[0].places.map((p) => p.name), ['Skógafoss'])
})

test('filterSearch keeps every place of a guide whose title or destination matches', () => {
  const result = filterSearch(sample, 'mallorca')
  assert.deepStrictEqual(result.map((g) => g.title), ['Mallorca sin coche'])
  assert.strictEqual(result[0].places.length, 1)
})

test('filterSearch with an empty query returns everything; with no match, nothing', () => {
  assert.deepStrictEqual(filterSearch(sample, '  '), sample)
  assert.deepStrictEqual(filterSearch(sample, 'tokio'), [])
})

test('destinationLabel turns a slug into a readable name', () => {
  assert.strictEqual(destinationLabel('islandia'), 'Islandia')
  assert.strictEqual(destinationLabel('costa-brava'), 'Costa brava')
})

test('buildSearchIndex keeps guides that are not published yet, marked as drafts', async () => {
  // The landing page lists drafts with a "Borrador" pill; its search finds them too.
  const islandia = await loadCompiledGuide(ISLANDIA_GUIDE, ISLANDIA_PLACES)
  const [draft] = buildSearchIndex([{ ...islandia, status: 'reviewed' }])
  assert.strictEqual(draft.draft, true)
  assert.ok(draft.places.length > 0)
  const [published] = buildSearchIndex([await publishedIslandia()])
  assert.strictEqual(published.draft, false)
})

test('buildSearchIndex carries the cover photo path, for the result thumbnail', async () => {
  const islandia = await loadCompiledGuide(ISLANDIA_GUIDE, ISLANDIA_PLACES)
  const [guide] = buildSearchIndex([islandia])
  assert.strictEqual(guide.cover, islandia.cover_image)
})

test('legacySearchGuide indexes a legacy guide and its stops, each linked to its day', async () => {
  const alsacia = JSON.parse(await readFile('src/content/guides/ruta-pueblos-y-vinos.json', 'utf-8'))
  const guide = legacySearchGuide('ruta-pueblos-y-vinos', alsacia)
  assert.strictEqual(guide.url, '/alsacia/ruta-pueblos-y-vinos/')
  assert.strictEqual(guide.destination, 'alsacia')
  assert.strictEqual(guide.draft, alsacia.meta.draft)
  assert.strictEqual(guide.days, Math.max(...alsacia.meta.days))
  const [hit] = filterSearch([guide], 'riquewihr')
  assert.ok(hit, 'a stop of day 1 is found')
  assert.ok(hit.places.every((p) => p.url === `/alsacia/ruta-pueblos-y-vinos/#dia-${p.day}`))
  assert.ok(filterSearch([guide], 'alsacia').length === 1, 'the destination finds the guide')
})

test('buildSearchIndex links each place of a published guide to the day it is visited', async () => {
  const [guide] = buildSearchIndex([await publishedIslandia()])
  assert.strictEqual(guide.url, '/islandia/islandia-en-camper-13-dias/')
  for (const query of ['jokulsarlon', 'thingvellir', 'skogafoss']) {
    const [hit] = filterSearch([guide], query)
    assert.ok(hit, `"${query}" finds nothing`)
    for (const place of hit.places) assert.match(place.url, /^\/islandia\/islandia-en-camper-13-dias\/#dia-\d+$/)
    assert.ok(hit.places.every((p) => p.url.endsWith(`#dia-${p.day}`)))
  }
  const days = guide.places.map((p) => p.day)
  assert.deepStrictEqual(days, [...days].sort((a, b) => a - b), 'places follow the route, day by day')
})

test('buildSearchIndex lists a place once per day, not once per stop', async () => {
  const [guide] = buildSearchIndex([await publishedIslandia()])
  const keys = guide.places.map((p) => `${p.day} ${p.name}`)
  assert.strictEqual(new Set(keys).size, keys.length)
})

test('searchSummary counts what is shown, in Spanish, singular and plural', () => {
  assert.strictEqual(searchSummary(1, 1), '1 lugar en 1 guía')
  assert.strictEqual(searchSummary(70, 2), '70 lugares en 2 guías')
  assert.strictEqual(searchSummary(0, 0), 'Sin resultados')
  assert.strictEqual(searchSummary(0, 1), '1 guía', 'a guide found by its title, with no place listed')
})
