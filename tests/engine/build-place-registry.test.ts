import { test } from 'node:test'
import assert from 'node:assert'
import { buildPlaceRegistry } from '../../engine/validate/registry.ts'

test('builds a registry from valid places with no errors', () => {
  const { registry, errors } = buildPlaceRegistry([
    { place_id: 'a', name: 'A', destination: 'islandia', lat: 1, lng: 1, type: 'other', verified_at: '2024-01-01' },
    { place_id: 'b', name: 'B', destination: 'islandia', lat: 2, lng: 2, type: 'other', verified_at: '2024-01-01' },
  ])
  assert.deepStrictEqual(errors, [])
  assert.strictEqual(registry.get('a')?.name, 'A')
  assert.strictEqual(registry.get('b')?.name, 'B')
})

test('I1: a duplicate place_id produces an error and does not silently overwrite', () => {
  const { registry, errors } = buildPlaceRegistry([
    { place_id: 'godafoss', name: 'Real Goðafoss', destination: 'islandia', lat: 65.68, lng: -17.55, type: 'monument', verified_at: '2024-01-01' },
    { place_id: 'godafoss', name: 'DUPLICATE', destination: 'islandia', lat: 0, lng: 0, type: 'other', verified_at: '2020-01-01' },
  ])
  assert.ok(errors.some((e) => e.includes('godafoss') && e.toLowerCase().includes('duplicado')))
  // the first (real) entry must win, not get silently clobbered by the duplicate
  assert.strictEqual(registry.get('godafoss')?.name, 'Real Goðafoss')
})

test('a schema-invalid place produces an error naming the offending entry', () => {
  const { errors } = buildPlaceRegistry([
    { place_id: 'bad', name: 'Bad', destination: 'islandia', lat: 'not-a-number', type: 'other', verified_at: '2024-01-01' },
  ])
  assert.ok(errors.some((e) => e.includes('bad')))
})
