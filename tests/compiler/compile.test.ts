import { test } from 'node:test'
import assert from 'node:assert'
import { loadGuide, loadPlaces, validateGuide, compileGuide, buildPlaceRegistry } from '../../engine/index.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../../engine/index.ts'

const GUIDE_PATH = new URL('../../content/guides/islandia/islandia-en-camper-13-dias.yaml', import.meta.url).pathname
const PLACES_PATH = new URL('../../content/places/islandia.yaml', import.meta.url).pathname

async function loadPlaceRegistry(): Promise<PlaceRegistry> {
  const raw = await loadPlaces(PLACES_PATH) as unknown[]
  const { registry, errors } = buildPlaceRegistry(raw)
  if (errors.length > 0) {
    throw new Error(`unexpected place registry errors in fixture: ${errors.join('; ')}`)
  }
  return registry
}

const emptyAffiliates: AffiliateRegistry = { get: () => undefined }

test('the real Islandia guide loads, validates with zero errors, and compiles', async () => {
  const places = await loadPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)

  const result = validateGuide(rawGuide, places, emptyAffiliates)
  assert.deepStrictEqual(result.errors, [])
  assert.ok(result.guide)

  const compiled = compileGuide(result.guide!, places, emptyAffiliates)
  assert.strictEqual(compiled.slug, 'islandia-en-camper-13-dias')
})

test('the compiled guide keeps exactly the 6 authored days, not all 13', async () => {
  const places = await loadPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  const days = compiled.variants![0].days.map((d) => d.day).sort((a, b) => a - b)
  assert.deepStrictEqual(days, [1, 2, 9, 10, 11, 12])
})

test('places is the deduplicated union of every place actually used by a stop (24 of the 26 registered — jokulsarlon and vestrahorn belong to the excluded days 5-6 and are never referenced)', async () => {
  const places = await loadPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  assert.strictEqual(compiled.places.length, 24)
  assert.ok(!compiled.places.some((p) => p.place_id === 'jokulsarlon'))
  assert.ok(!compiled.places.some((p) => p.place_id === 'vestrahorn'))
})

test('budget compiles with the real 2024 figures: total_base equals the sum of per-person amounts', async () => {
  const places = await loadPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  assert.ok(compiled.budget)
  assert.ok(Math.abs(compiled.budget!.total_base - 2247.62) < 0.01)
  assert.strictEqual(compiled.budget!.type, 'real')
})

test('has_experience is true for this real, lived guide', async () => {
  const places = await loadPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  assert.strictEqual(compiled.has_experience, true)
})
