import { test } from 'node:test'
import assert from 'node:assert'
import { placeMapLink, placeMapUrl } from '../../src/lib/maps.ts'

test('placeMapUrl builds a single-point Google Maps URL with six decimals and an encoded comma', () => {
  const url = placeMapUrl(64.255889, -21.13)
  assert.strictEqual(url, 'https://www.google.com/maps/search/?api=1&query=64.255889%2C-21.130000')
})

test('placeMapUrl works with negative coordinates on both axes', () => {
  const url = placeMapUrl(-33.87, -151.21)
  assert.strictEqual(url, 'https://www.google.com/maps/search/?api=1&query=-33.870000%2C-151.210000')
})

test('placeMapLink uses the exact Google Maps link the author gave the place', () => {
  const url = 'https://maps.app.goo.gl/abc123'
  assert.strictEqual(placeMapLink({ lat: 64.255889, lng: -21.13, maps_url: url }), url)
})

test('placeMapLink falls back to a pin on the coordinates without one', () => {
  assert.strictEqual(
    placeMapLink({ lat: 64.255889, lng: -21.13 }),
    'https://www.google.com/maps/search/?api=1&query=64.255889%2C-21.130000',
  )
})
