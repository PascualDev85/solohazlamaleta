import { test } from 'node:test'
import assert from 'node:assert'
import { compileAccommodation } from '../../engine/compile/accommodation.ts'
import { compileDay, compileStop } from '../../engine/compile/itinerary.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../../engine/types.ts'
import type { PlaceSource } from '../../schemas/index.ts'

const camp: PlaceSource = {
  place_id: 'camp_x', name: 'Camping X', destination: 'islandia', lat: 64, lng: -21, type: 'accommodation',
  verified_at: '2025-09-15',
  facilities: { showers: 'included', toilets: true, common_room: false, electricity: false, verified_at: '2025-09-15' },
}
const places: PlaceRegistry = { get: (id) => (id === 'camp_x' ? camp : undefined) }
const affiliates: AffiliateRegistry = {
  get: (id) => (id === 'aff' ? { id: 'aff', partner: 'P', category: 'accommodation', description: 'd', active: true, verified_at: '2024-01-01' } : undefined),
}
const now = new Date('2025-10-01')

test('compileAccommodation resolves each pick to its place and keeps only what is ours on the pick', () => {
  const compiled = compileAccommodation(
    {
      notes: 'n',
      zones: [{
        name: 'Sur',
        picks: [{ place_id: 'camp_x', price_paid: { amount: 4400, currency: 'ISK', verified_at: '2025-09-13' }, opinion: 'Bien.' }],
      }],
    },
    places, affiliates, now,
  )
  const pick = compiled.zones[0].picks[0]
  assert.strictEqual(pick.place.place_id, 'camp_x')
  assert.strictEqual(pick.place.facilities?.showers, 'included')
  assert.strictEqual(pick.price_paid?.amount, 4400)
  assert.strictEqual(pick.opinion, 'Bien.')
  assert.strictEqual('place_id' in pick, false)
  assert.strictEqual(pick.affiliate, undefined)
})

test('compileAccommodation resolves affiliate_id to an affiliate and drops the id', () => {
  const compiled = compileAccommodation(
    { zones: [{ name: 'Sur', picks: [{ place_id: 'camp_x', affiliate_id: 'aff' }] }] },
    places, affiliates, now,
  )
  const pick = compiled.zones[0].picks[0]
  assert.strictEqual(pick.affiliate?.redirect_url, '/ir/aff')
  assert.strictEqual('affiliate_id' in pick, false)
})

test('compileAccommodation throws on a pick whose place_id does not exist (I5)', () => {
  assert.throws(() =>
    compileAccommodation({ zones: [{ name: 'Sur', picks: [{ place_id: 'nope' }] }] }, places, affiliates, now),
  )
})

test('compileDay resolves overnight to the campsite place', () => {
  const day = compileDay(
    { day: 1, title: 'D1', stops: [], overnight: 'camp_x' },
    places, affiliates, now,
  )
  assert.strictEqual(day.overnight?.place_id, 'camp_x')
  assert.strictEqual(day.overnight?.name, 'Camping X')
})

test('compileDay throws when overnight names a place that does not exist', () => {
  assert.throws(() => compileDay({ day: 1, title: 'D1', stops: [], overnight: 'nope' }, places, affiliates, now))
})

test('compileDay keeps a null overnight (night outside any campsite) and the overnight note', () => {
  const day = compileDay(
    { day: 6, title: 'D6', stops: [], overnight: null, overnight_note: 'Noche de auroras.' },
    places, affiliates, now,
  )
  assert.strictEqual(day.overnight, null)
  assert.strictEqual(day.overnight_note, 'Noche de auroras.')
})

test('compileDay leaves overnight undefined when the day has none', () => {
  const day = compileDay({ day: 13, title: 'D13', stops: [] }, places, affiliates, now)
  assert.strictEqual(day.overnight, undefined)
  assert.strictEqual('overnight_note' in day && day.overnight_note !== undefined, false)
})

test('compileStop resolves parking.shared_with to the host place and keeps duration_note', () => {
  const host: PlaceSource = { place_id: 'host', name: 'Host', short_name: 'H', destination: 'islandia', lat: 1, lng: 1, type: 'monument', verified_at: '2025-09-13', parking: { price: 1000, currency: 'ISK', verified_at: '2025-09-13' } }
  const guest: PlaceSource = { place_id: 'guest', name: 'Guest', destination: 'islandia', lat: 1, lng: 1, type: 'monument', verified_at: '2025-09-13', parking: { price: 1000, currency: 'ISK', shared_with: 'host', verified_at: '2025-09-13' } }
  const reg: PlaceRegistry = { get: (id) => ({ host, guest } as Record<string, PlaceSource>)[id] }
  const stop = compileStop(
    { place_id: 'guest', order: 1, duration_min: 30, duration_max_min: 60, duration_note: 'con la ruta', planning_status: 'required', visit_status: 'visited' },
    reg, affiliates, now,
  )
  assert.strictEqual(stop.parking_shared_with?.place_id, 'host')
  assert.strictEqual(stop.duration_note, 'con la ruta')
})

test('compileStop throws when parking.shared_with names a place that does not exist', () => {
  const guest: PlaceSource = { place_id: 'guest', name: 'Guest', destination: 'islandia', lat: 1, lng: 1, type: 'monument', verified_at: '2025-09-13', parking: { price: 0, currency: 'ISK', shared_with: 'nope', verified_at: '2025-09-13' } }
  const reg: PlaceRegistry = { get: (id) => (id === 'guest' ? guest : undefined) }
  assert.throws(() => compileStop({ place_id: 'guest', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' }, reg, affiliates, now))
})
