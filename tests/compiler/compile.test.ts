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

test('the compiled guide keeps exactly the 13 authored days', async () => {
  const places = await loadPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  const days = compiled.variants![0].days.map((d) => d.day).sort((a, b) => a - b)
  assert.deepStrictEqual(days, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
})

test('skogafoss is visited on day 4 only: the arrival on day 3 is the night, not a stop (author, 2026-10-07)', async () => {
  const places = await loadPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  const days = compiled.variants![0].days
  const day3 = days.find((d) => d.day === 3)!
  const day4Stop = days.find((d) => d.day === 4)!.stops.find((s) => s.place.place_id === 'skogafoss')

  assert.strictEqual(day3.stops.some((s) => s.place.place_id === 'skogafoss'), false)
  assert.strictEqual(day3.overnight?.place_id, 'camp_skogafoss')
  assert.ok(day4Stop)
  assert.strictEqual(day4Stop.visit_status, 'visited')
})

test('places is the deduplicated union of every place actually used by a stop (85 of 95 registered: the 10 campsites are nights, not stops)', async () => {
  const places = await loadPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  assert.strictEqual(compiled.places.length, 85)
  assert.strictEqual(compiled.places.filter((p) => p.place_id === 'skogafoss').length, 1)
})

test('budget compiles with the real 2025 figures: total_base equals the raw sum of per_group item amounts (4495.21 €)', async () => {
  const places = await loadPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  assert.ok(compiled.budget)
  assert.ok(Math.abs(compiled.budget!.total_base - 4495.21) < 0.001)
  assert.strictEqual(compiled.budget!.type, 'real')
})

test('total_reference for the real base_travelers (2) matches the real 2025 trip total exactly (4495.21 €), not a rounding-drifted 4495.24', async () => {
  const places = await loadPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  assert.ok(Math.abs(compiled.budget!.total_reference - 4495.21) < 0.001)
})

test('has_experience is true for this real, lived guide', async () => {
  const places = await loadPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  assert.strictEqual(compiled.has_experience, true)
})
