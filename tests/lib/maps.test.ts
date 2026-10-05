import { test } from 'node:test'
import assert from 'node:assert'
import { placeMapUrl } from '../../src/lib/maps.ts'

test('placeMapUrl builds a single-point Google Maps URL with six decimals and an encoded comma', () => {
  const url = placeMapUrl(64.255889, -21.13)
  assert.strictEqual(url, 'https://www.google.com/maps/search/?api=1&query=64.255889%2C-21.130000')
})

test('placeMapUrl works with negative coordinates on both axes', () => {
  const url = placeMapUrl(-33.87, -151.21)
  assert.strictEqual(url, 'https://www.google.com/maps/search/?api=1&query=-33.870000%2C-151.210000')
})
