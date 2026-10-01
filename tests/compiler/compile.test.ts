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

test('the compiled guide keeps exactly the 12 authored days, not all 13 (day 13 is the departure, no stops)', async () => {
  const places = await loadPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  const days = compiled.variants![0].days.map((d) => d.day).sort((a, b) => a - b)
  assert.deepStrictEqual(days, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
})

test('I1: skogafoss appears on both day 2 (brief arrival) and day 3 (full morning visit) and resolves to the same place', async () => {
  const places = await loadPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  const days = compiled.variants![0].days
  const day2Stop = days.find((d) => d.day === 2)!.stops.find((s) => s.place.place_id === 'skogafoss')
  const day3Stop = days.find((d) => d.day === 3)!.stops.find((s) => s.place.place_id === 'skogafoss')

  assert.ok(day2Stop && day3Stop)
  assert.strictEqual(day2Stop.visit_status, 'visited')
  assert.strictEqual(day3Stop.visit_status, 'visited')
  assert.deepStrictEqual(day2Stop.place, day3Stop.place)
})

test('places is the deduplicated union of every place actually used by a stop (55 of 55 registered — skogafoss is referenced by two stops but counts once)', async () => {
  const places = await loadPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  assert.strictEqual(compiled.places.length, 55)
  assert.strictEqual(compiled.places.filter((p) => p.place_id === 'skogafoss').length, 1)
})

test('budget compiles with the real 2024 figures: total_base equals the sum of per-person amounts', async () => {
  const places = await loadPlaceRegistry()
  const rawGuide = await loadGuide(GUIDE_PATH)
  const result = validateGuide(rawGuide, places, emptyAffiliates)
  const compiled = compileGuide(result.guide!, places, emptyAffiliates)

  assert.ok(compiled.budget)
  assert.ok(Math.abs(compiled.budget!.total_base - 2247.605) < 0.001)
  assert.strictEqual(compiled.budget!.type, 'real')
})

test('total_reference for the real base_travelers (2) matches the real 2024 trip total exactly (4495.21 €), not a rounding-drifted 4495.24', async () => {
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
