import { test } from 'node:test'
import assert from 'node:assert'
import { compileStop, compileDay, compileVariant } from '../../engine/compile/itinerary.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../../engine/types.ts'
import type { PlaceSource } from '../../schemas/index.ts'

const places: Record<string, PlaceSource> = {
  a: { place_id: 'a', name: 'A', destination: 'islandia', lat: 1, lng: 1, type: 'other', verified_at: '2024-01-01', review_interval: 12, entry: { price: 10, currency: 'EUR', verified_at: '2024-01-01' } },
}

const placeRegistry: PlaceRegistry = { get: (id) => places[id] }
const emptyAffiliates: AffiliateRegistry = { get: () => undefined }
const now = new Date('2024-06-01')

test('compileStop resolves place_id to a CompiledPlace', () => {
  const compiled = compileStop(
    { place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
    placeRegistry, emptyAffiliates, now,
  )
  assert.strictEqual(compiled.place.place_id, 'a')
  assert.strictEqual('place_id' in compiled, false)
})

test('compileStop throws when place_id does not exist (I5)', () => {
  assert.throws(() =>
    compileStop(
      { place_id: 'missing', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
      placeRegistry, emptyAffiliates, now,
    ),
  )
})

test('I1: the same place_id in two different stops resolves to equal CompiledPlace values', () => {
  const stop1 = compileStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' }, placeRegistry, emptyAffiliates, now)
  const stop2 = compileStop({ place_id: 'a', order: 2, duration_min: 45, planning_status: 'required', visit_status: 'visited' }, placeRegistry, emptyAffiliates, now)
  assert.deepStrictEqual(stop1.place, stop2.place)
})

test('I16: actual_price_paid (stop) and entry.price (place) coexist independently', () => {
  const compiled = compileStop(
    {
      place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited',
      experience: { visited_at: '2024-05', actual_price_paid: { amount: 6, currency: 'EUR' } },
    },
    placeRegistry, emptyAffiliates, now,
  )
  assert.strictEqual(compiled.experience?.actual_price_paid?.amount, 6)
  assert.strictEqual(compiled.place.entry?.price, 10)
  assert.notStrictEqual(compiled.experience?.actual_price_paid?.amount, compiled.place.entry?.price)
})

test('skip_reason flows through to CompiledStop unchanged', () => {
  const compiled = compileStop(
    { place_id: 'a', order: 1, duration_min: 30, planning_status: 'optional', visit_status: 'not_visited', skip_reason: 'No daba tiempo con el ritmo del día.' },
    placeRegistry, emptyAffiliates, now,
  )
  assert.strictEqual(compiled.skip_reason, 'No daba tiempo con el ritmo del día.')
})

test('compileDay splits stops into route_stops and skipped_stops, with no not_visited stop leaking into route_stops', () => {
  const day = compileDay(
    { day: 1, title: 'D1', stops: [
      { place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
      { place_id: 'a', order: 2, duration_min: 15, planning_status: 'optional', visit_status: 'not_visited' },
      { place_id: 'a', order: 3, duration_min: 20, planning_status: 'optional', visit_status: 'unknown' },
    ] },
    placeRegistry, emptyAffiliates, now,
  )
  assert.strictEqual(day.stops.length, 3)
  assert.strictEqual(day.route_stops.length, 2)
  assert.strictEqual(day.skipped_stops.length, 1)
  assert.ok(day.route_stops.every((stop) => stop.visit_status !== 'not_visited'))
  assert.ok(day.skipped_stops.every((stop) => stop.visit_status === 'not_visited'))
})

test('compileDay computes n_stops', () => {
  const day = compileDay(
    { day: 1, title: 'D1', stops: [
      { place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
      { place_id: 'a', order: 2, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
    ] },
    placeRegistry, emptyAffiliates, now,
  )
  assert.strictEqual(day.n_stops, 2)
})

test('compileVariant computes n_stops_total and deduplicated all_places', () => {
  const variant = compileVariant(
    {
      id: 'intensivo', name: 'V', description: 'd',
      days: [
        { day: 1, title: 'D1', stops: [{ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' }] },
        { day: 2, title: 'D2', stops: [{ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' }] },
      ],
    },
    placeRegistry, emptyAffiliates, now,
  )
  assert.strictEqual(variant.n_stops_total, 2)
  assert.strictEqual(variant.all_places.length, 1)
})

test('compileVariant computes n_route_stops_total excluding not_visited stops', () => {
  const variant = compileVariant(
    {
      id: 'intensivo', name: 'V', description: 'd',
      days: [
        {
          day: 1, title: 'D1', stops: [
            { place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
            { place_id: 'a', order: 2, duration_min: 30, planning_status: 'optional', visit_status: 'not_visited' },
          ],
        },
        { day: 2, title: 'D2', stops: [{ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required' }] },
      ],
    },
    placeRegistry, emptyAffiliates, now,
  )
  assert.strictEqual(variant.n_stops_total, 3)
  assert.strictEqual(variant.n_route_stops_total, 2)
})
