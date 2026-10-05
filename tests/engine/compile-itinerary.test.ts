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

test('compileDay derives route_line from short_name, falling back to name, and only for route stops', () => {
  const registry: PlaceRegistry = {
    get: (id) => ({
      long: { place_id: 'long', name: 'Parque Nacional de Þingvellir', short_name: 'Þingvellir', destination: 'islandia', lat: 1, lng: 1, type: 'park', verified_at: '2024-01-01', review_interval: 12 },
      plain: { place_id: 'plain', name: 'Gullfoss', destination: 'islandia', lat: 1, lng: 1, type: 'other', verified_at: '2024-01-01', review_interval: 12 },
      skipped: { place_id: 'skipped', name: 'Kerið', destination: 'islandia', lat: 1, lng: 1, type: 'other', verified_at: '2024-01-01', review_interval: 12 },
    } as Record<string, PlaceSource>)[id],
  }
  const day = compileDay({
    day: 2, title: 'D2',
    stops: [
      { place_id: 'long', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
      { place_id: 'skipped', order: 2, duration_min: 30, planning_status: 'optional', visit_status: 'not_visited' },
      { place_id: 'plain', order: 3, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
    ],
  }, registry, emptyAffiliates, now)
  assert.deepStrictEqual(day.route_line, ['Þingvellir', 'Gullfoss'])
  assert.strictEqual(day.n_route_stops, 2)
})

test('compileDay keeps photo, highlight, drive and overnight unchanged', () => {
  const extras = {
    photo: { src: 'islandia/x.jpg', alt: 'A waterfall', caption: 'X, 2025' },
    highlight: 'The best bit.',
    drive: { km: 275, minutes: 225 },
    overnight: 'Camping X',
  }
  const day = compileDay({ day: 1, title: 'D1', stops: [], ...extras }, placeRegistry, emptyAffiliates, now)
  assert.deepStrictEqual(
    { photo: day.photo, highlight: day.highlight, drive: day.drive, overnight: day.overnight },
    extras,
  )
})

const parkedPlace: PlaceSource = {
  place_id: 'p', name: 'P', destination: 'islandia', lat: 1, lng: 1, type: 'other',
  verified_at: '2025-09-12', review_interval: 12,
  parking: { price: 1000, currency: 'ISK', verified_at: '2025-09-12' },
}
const parkedRegistry: PlaceRegistry = { get: (id) => (id === 'p' ? parkedPlace : places[id]) }
const parkedStop = { place_id: 'p', order: 1, duration_min: 30, planning_status: 'required' as const, visit_status: 'visited' as const }

test('price_checked_at is set when the price was checked before the guide update', () => {
  const stop = compileStop(parkedStop, parkedRegistry, emptyAffiliates, now, '2026-10-04')
  assert.strictEqual(stop.price_checked_at, '2025-09-12')
})

test('price_checked_at is absent when the price was checked on or after the guide update', () => {
  assert.strictEqual(compileStop(parkedStop, parkedRegistry, emptyAffiliates, now, '2025-09-12').price_checked_at, undefined)
  assert.strictEqual(compileStop(parkedStop, parkedRegistry, emptyAffiliates, now, '2025-01-01').price_checked_at, undefined)
})

test('price_checked_at is absent when the place has no parking price', () => {
  const stop = compileStop({ ...parkedStop, place_id: 'a' }, parkedRegistry, emptyAffiliates, now, '2026-10-04')
  assert.strictEqual(stop.price_checked_at, undefined)
})

test('compileVariant passes the guide update date down to every stop', () => {
  const variant = compileVariant(
    { id: 'intensivo', name: 'V', description: 'd', days: [{ day: 1, title: 'D1', stops: [parkedStop] }] },
    parkedRegistry, emptyAffiliates, now, '2026-10-04',
  )
  assert.strictEqual(variant.days[0].route_stops[0].price_checked_at, '2025-09-12')
})
