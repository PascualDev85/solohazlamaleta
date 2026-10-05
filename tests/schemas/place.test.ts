import { test } from 'node:test'
import assert from 'node:assert'
import { PlaceSourceSchema } from '../../schemas/place.ts'

test('valid minimal place parses', () => {
  const result = PlaceSourceSchema.safeParse({
    place_id: 'thingvellir',
    name: 'Þingvellir',
    destination: 'islandia',
    lat: 64.2559,
    lng: -21.13,
    type: 'park',
    verified_at: '2024-08-15',
  })
  assert.strictEqual(result.success, true)
})

test('review_interval defaults to 12 when omitted', () => {
  const result = PlaceSourceSchema.parse({
    place_id: 'x',
    name: 'X',
    destination: 'islandia',
    lat: 1,
    lng: 1,
    type: 'other',
    verified_at: '2024-01-01',
  })
  assert.strictEqual(result.review_interval, 12)
})

test('invalid type is rejected', () => {
  const result = PlaceSourceSchema.safeParse({
    place_id: 'x',
    name: 'X',
    destination: 'islandia',
    lat: 1,
    lng: 1,
    type: 'not-a-real-type',
    verified_at: '2024-01-01',
  })
  assert.strictEqual(result.success, false)
})

test('entry and hours can each carry an independent verified_at', () => {
  const result = PlaceSourceSchema.parse({
    place_id: 'vestrahorn',
    name: 'Vestrahorn',
    destination: 'islandia',
    lat: 64.2448,
    lng: -14.9836,
    type: 'monument',
    verified_at: '2024-08-15',
    entry: { price: 900, currency: 'ISK', verified_at: '2024-08-15' },
    hours: { open: '08:00', close: '22:00', verified_at: '2024-07-01' },
  })
  assert.strictEqual(result.entry?.verified_at, '2024-08-15')
  assert.strictEqual(result.hours?.verified_at, '2024-07-01')
})

test('short_name is optional and kept when present', () => {
  const result = PlaceSourceSchema.parse({
    place_id: 'thingvellir', name: 'Parque Nacional de Þingvellir', short_name: 'Þingvellir',
    destination: 'islandia', lat: 1, lng: 1, type: 'park', verified_at: '2024-08-15',
  })
  assert.strictEqual(result.short_name, 'Þingvellir')
})

test('parking accepts a free (0) or paid price and rejects a negative one', () => {
  const base = { place_id: 'x', name: 'X', destination: 'islandia', lat: 1, lng: 1, type: 'other', verified_at: '2025-09-12' }
  assert.strictEqual(PlaceSourceSchema.safeParse({ ...base, parking: { price: 0, currency: 'ISK', verified_at: '2025-09-12' } }).success, true)
  assert.strictEqual(PlaceSourceSchema.safeParse({ ...base, parking: { price: 1000, currency: 'ISK', verified_at: '2025-09-12' } }).success, true)
  assert.strictEqual(PlaceSourceSchema.safeParse({ ...base, parking: { price: -1, currency: 'ISK', verified_at: '2025-09-12' } }).success, false)
})

test('maps_url accepts a Google Maps link and rejects any other host', () => {
  const base = { place_id: 'x', name: 'X', destination: 'islandia', lat: 1, lng: 1, type: 'other', verified_at: '2025-09-12' }
  assert.strictEqual(PlaceSourceSchema.safeParse({ ...base, maps_url: 'https://maps.google.com/?cid=802240876601686224' }).success, true)
  assert.strictEqual(PlaceSourceSchema.safeParse({ ...base, maps_url: 'https://www.google.com/maps/place/X' }).success, true)
  assert.strictEqual(PlaceSourceSchema.safeParse({ ...base, maps_url: 'https://example.com/maps' }).success, false)
})
