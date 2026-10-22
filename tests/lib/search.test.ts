import { test } from 'node:test'
import assert from 'node:assert'
import { readFile } from 'node:fs/promises'
import type { CompiledGuide } from '../../engine/index.ts'
import { loadCompiledGuide } from '../../src/lib/engine-guide.ts'
import {
  editDistance, findTerm, fuzzyWordMatch, highlightRanges, matchScore, normalizeSearch, rankSearch,
  resultsSummary, searchTerms,
} from '../../src/lib/search.ts'
import { buildSearchIndex, destinationLabel, featuredPlaces, legacySearchGuide, photoPlaceIndex, searchEntries } from '../../src/lib/search-index.ts'

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

test('matchScore needs every word somewhere in the text, in any order', () => {
  const lagoon = { text: normalizeSearch('Laguna Glaciar Fjallsárlón') }
  assert.notStrictEqual(matchScore(lagoon, searchTerms('fjallsarlon')), null)
  assert.notStrictEqual(matchScore(lagoon, searchTerms('glaciar laguna')), null)
  assert.notStrictEqual(matchScore(lagoon, searchTerms('lagu')), null)
  assert.strictEqual(matchScore(lagoon, searchTerms('laguna azul')), null)
})

// A place, section or guide as the panel's script sees it: its own words and
// the words around it (the destination, the guide).
const entry = (text: string, context = '') => ({ text: normalizeSearch(text), context: normalizeSearch(context) })

test('editDistance counts letters added, dropped, changed or swapped', () => {
  assert.strictEqual(editDistance('gullfoss', 'gullfoss'), 0)
  assert.strictEqual(editDistance('gullfoss', 'gulfoss'), 1, 'one letter less')
  assert.strictEqual(editDistance('geysir', 'geyysir'), 1, 'one letter more')
  assert.strictEqual(editDistance('jokulsarlon', 'jokulsarlom'), 1, 'one letter changed')
  assert.strictEqual(editDistance('geysir', 'geyisr'), 1, 'two letters swapped')
  assert.strictEqual(editDistance('kitten', 'sitting'), 3)
  assert.strictEqual(editDistance('', 'abc'), 3)
})

test('fuzzyWordMatch allows one edit in words of 5 letters or more, also while typing', () => {
  assert.ok(fuzzyWordMatch('jokulsarlom', 'jokulsarlon'))
  assert.ok(fuzzyWordMatch('gulfos', 'gullfoss'), 'a word still being typed: one edit from its start')
  assert.ok(fuzzyWordMatch('skogafos', 'skogafoss'))
  assert.ok(!fuzzyWordMatch('gulf', 'gull'), 'four letters: exact only')
  assert.ok(!fuzzyWordMatch('geysir', 'reykir'), 'two edits')
  assert.ok(!fuzzyWordMatch('gulfos', 'gufufoss'))
})

test('findTerm finds the exact text first, else a word one edit away', () => {
  assert.deepStrictEqual(findTerm('p.n. de thingvellir', 'thing'), { start: 8, end: 13, fuzzy: false })
  assert.deepStrictEqual(findTerm('gullfoss', 'gulfos'), { start: 0, end: 7, fuzzy: true })
  assert.deepStrictEqual(findTerm('playa de reynisfjara', 'reynisfjra'), { start: 9, end: 20, fuzzy: true })
  assert.strictEqual(findTerm('gullfoss', 'tokio'), null)
})

test('matchScore: a word start beats the middle of a word, and both beat a typo', () => {
  assert.strictEqual(matchScore(entry('Gullfoss'), searchTerms('gull')), 0)
  assert.strictEqual(matchScore(entry('Skógafoss'), searchTerms('foss')), 1)
  assert.strictEqual(matchScore(entry('Gullfoss'), searchTerms('gulfos')), 2)
  assert.strictEqual(matchScore(entry('Gullfoss'), searchTerms('tokio')), null)
  assert.strictEqual(matchScore(entry('Gullfoss'), []), null, 'an empty query finds nothing: the panel shows suggestions')
})

test('matchScore takes words from the context, but one must be the entry\'s own', () => {
  const budget = entry('Presupuesto real presupuesto', 'Islandia Islandia en camper')
  assert.strictEqual(matchScore(budget, searchTerms('presupuesto islandia')), 0)
  assert.strictEqual(matchScore(budget, searchTerms('islandia')), null, 'the destination alone does not list every section')
  assert.strictEqual(matchScore(budget, searchTerms('presupuesto tokio')), null)
})

test('rankSearch puts exact matches before typos, keeping the original order otherwise', () => {
  const entries = [entry('Gulfoss Bar'), entry('Skógafoss'), entry('Gullfoss'), entry('Foss á Síðu')]
  const names = (query: string) => rankSearch(entries, query).map((e) => e.text)
  assert.deepStrictEqual(names('gullfos'), ['gullfoss', 'gulfoss bar'])
  assert.deepStrictEqual(names('foss'), ['foss a sidu', 'gulfoss bar', 'skogafoss', 'gullfoss'], 'a word that starts with it first')
  assert.deepStrictEqual(names('  '), [])
})

test('highlightRanges marks what matched in the original label, accents and Þ included', () => {
  assert.deepStrictEqual(highlightRanges('Jökulsárlón', 'jokul'), [[0, 5]])
  assert.deepStrictEqual(highlightRanges('P.N. de Þingvellir', 'thing'), [[8, 12]])
  assert.deepStrictEqual(highlightRanges('Gullfoss', 'gulfos'), [[0, 7]])
  assert.deepStrictEqual(highlightRanges('Laguna Glaciar Fjallsárlón', 'glaciar lag'), [[0, 3], [7, 14]])
  assert.deepStrictEqual(highlightRanges('Gullfoss', 'gullfoss islandia'), [[0, 8]], 'a word found only in the context is not marked')
  assert.deepStrictEqual(highlightRanges('Gullfoss', ''), [])
  // A decomposed accent (NFD: "o" + U+0308) is two letters of the label, and the mark keeps both.
  assert.deepStrictEqual(highlightRanges('Jo\u0308kulsa\u0301rlo\u0301n', 'jokul'), [[0, 6]])
  assert.deepStrictEqual(highlightRanges('Jo\u0308kulsa\u0301rlo\u0301n', 'sarlon'), [[6, 14]])
})

test('resultsSummary counts the results by type, in Spanish, singular and plural', () => {
  assert.strictEqual(resultsSummary({ destination: 0, guide: 1, place: 8, section: 2 }), '11 resultados: 1 guía, 8 lugares y 2 secciones')
  assert.strictEqual(resultsSummary({ destination: 0, guide: 0, place: 1, section: 0 }), '1 resultado: 1 lugar')
  assert.strictEqual(resultsSummary({ destination: 2, guide: 0, place: 0, section: 0 }), '2 resultados: 2 destinos')
  assert.strictEqual(resultsSummary({ destination: 0, guide: 0, place: 0, section: 0 }), 'Sin resultados')
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
  const [hit] = rankSearch(guide.places, 'riquewihr')
  assert.strictEqual(hit?.day, 1, 'a stop of day 1 is found')
  assert.ok(guide.places.every((p) => p.url === `/alsacia/ruta-pueblos-y-vinos/#dia-${p.day}`))
  assert.notStrictEqual(matchScore(guide, searchTerms('alsacia')), null, 'the destination finds the guide')
})

test('buildSearchIndex links each place of a published guide to the day it is visited', async () => {
  const [guide] = buildSearchIndex([await publishedIslandia()])
  assert.strictEqual(guide.url, '/islandia/islandia-en-camper-13-dias/')
  for (const query of ['jokulsarlon', 'thingvellir', 'skogafoss']) {
    const hits = rankSearch(guide.places, query)
    assert.ok(hits.length, `"${query}" finds nothing`)
    for (const place of hits) assert.match(place.url, /^\/islandia\/islandia-en-camper-13-dias\/#dia-\d+$/)
    assert.ok(hits.every((p) => p.url.endsWith(`#dia-${p.day}`)))
  }
  const days = guide.places.map((p) => p.day)
  assert.deepStrictEqual(days, [...days].sort((a, b) => a - b), 'places follow the route, day by day')
})

test('buildSearchIndex lists a place once per day, not once per stop', async () => {
  const [guide] = buildSearchIndex([await publishedIslandia()])
  const keys = guide.places.map((p) => `${p.day} ${p.name}`)
  assert.strictEqual(new Set(keys).size, keys.length)
})

test('buildSearchIndex lists the sections of the guide page, linked to their ids', async () => {
  const [guide] = buildSearchIndex([await publishedIslandia()])
  const budget = guide.sections.find((section) => section.id === 'presupuesto')
  assert.strictEqual(budget?.url, '/islandia/islandia-en-camper-13-dias/#presupuesto')
  assert.strictEqual(budget?.label, 'Presupuesto real')
  assert.strictEqual(budget?.icon, 'budget')
  // "Lo práctico" moved to the hub (1.13 §3): the guide page no longer has it.
  assert.ok(!guide.sections.some((section) => section.id === 'practico'))
  for (const query of ['donde dormir', 'que reservar', 'preguntas', 'faq']) {
    assert.ok(rankSearch(guide.sections, query).length, `"${query}" finds no section`)
  }
})

test('legacySearchGuide lists the sections its page shows', async () => {
  const alsacia = JSON.parse(await readFile('src/content/guides/ruta-pueblos-y-vinos.json', 'utf-8'))
  const guide = legacySearchGuide('ruta-pueblos-y-vinos', alsacia)
  const ids = guide.sections.map((section) => section.id)
  assert.deepStrictEqual(ids.slice(0, 3), ['resumen', 'duraciones', 'itinerario'])
  assert.strictEqual(ids.includes('dormir'), alsacia.lodging.length > 0)
  assert.ok(guide.sections.every((section) => section.url === `/alsacia/ruta-pueblos-y-vinos/#${section.id}`))
})

test('photoPlaceIndex finds the place a day photo shows, from its caption', () => {
  const places = [entry('P.N. de Þingvellir Þingvellir'), entry('Gullfoss Gullfoss'), entry('Gljúfrafoss (Gljúfrabúi) Gljúfrafoss')]
  assert.strictEqual(photoPlaceIndex('Gullfoss, septiembre de 2025', places), 1)
  assert.strictEqual(photoPlaceIndex('Gljúfrafoss, septiembre de 2025', places), 2)
  assert.strictEqual(photoPlaceIndex('Atardecer en la costa', places), -1)
  assert.strictEqual(photoPlaceIndex(undefined, places), -1)
})

test('buildSearchIndex gives a place the photo of its day when the photo shows it', async () => {
  const [guide] = buildSearchIndex([await publishedIslandia()])
  const photo = (name: string) => guide.places.find((p) => p.name === name)?.photo
  assert.strictEqual(photo('Gullfoss'), 'islandia/islandia-gullfoss.jpg')
  assert.strictEqual(photo('P.N. de Þingvellir'), null, 'same day, but not in the photo')
})

test('featuredPlaces: the places in the authors\' photos, then the first stop of a guide without one', async () => {
  const alsacia = JSON.parse(await readFile('src/content/guides/ruta-pueblos-y-vinos.json', 'utf-8'))
  const guides = [...buildSearchIndex([await publishedIslandia()]), legacySearchGuide('ruta-pueblos-y-vinos', alsacia)]
  const featured = featuredPlaces(guides, 6)
  assert.deepStrictEqual(featured.map((p) => p.name), ['Reikiavik', 'Gullfoss', 'Gljúfrafoss (Gljúfrabúi)', 'Bergheim'])
  assert.ok(featured.length <= 6)
  assert.strictEqual(featuredPlaces(guides, 2).length, 2)
})

test('searchEntries flattens the guides into the four groups of results', async () => {
  const alsacia = JSON.parse(await readFile('src/content/guides/ruta-pueblos-y-vinos.json', 'utf-8'))
  const guides = [...buildSearchIndex([await publishedIslandia()]), legacySearchGuide('ruta-pueblos-y-vinos', alsacia)]
  const groups = searchEntries(guides, new Set(['/islandia/']))
  assert.deepStrictEqual(groups.destination.map((d) => [d.label, d.url, d.detail]), [
    ['Islandia', '/islandia/', '1 guía'],
    ['Alsacia', '/alsacia/ruta-pueblos-y-vinos/', alsacia.meta.draft ? '1 guía · en preparación' : '1 guía'],
  ], 'a destination without its hub page leads to its guide')
  assert.strictEqual(groups.guide.length, 2)
  assert.strictEqual(groups.place.length, guides.reduce((sum, g) => sum + g.places.length, 0))
  const [gullfoss] = rankSearch(groups.place, 'gullfoss islandia')
  assert.strictEqual(gullfoss.label, 'Gullfoss')
  assert.strictEqual(gullfoss.day, 2)
  assert.strictEqual(gullfoss.detail, 'Islandia en camper: ruta de 13 días por la Ring Road')
  const [budget] = rankSearch(groups.section, 'presupuesto islandia')
  assert.strictEqual(budget.url, '/islandia/islandia-en-camper-13-dias/#presupuesto')
  assert.strictEqual(rankSearch(groups.section, 'islandia').length, 0, 'the destination alone lists no sections')
})
