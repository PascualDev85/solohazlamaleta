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

test('two places with near-identical coordinates produce a WARNING, not an ERROR', () => {
  const { errors, warnings } = buildPlaceRegistry([
    { place_id: 'eystrahorn', name: 'Eystrahorn', destination: 'islandia', lat: 64.3028, lng: -14.8350, type: 'monument', verified_at: '2024-01-01' },
    { place_id: 'duplicate_viewpoint', name: 'Same spot, different name', destination: 'islandia', lat: 64.30285, lng: -14.83505, type: 'viewpoint', verified_at: '2024-01-01' },
  ])
  assert.deepStrictEqual(errors, [])
  assert.ok(warnings.some((w) => w.includes('eystrahorn') && w.includes('duplicate_viewpoint')))
})

test('two places a few kilometers apart (genuinely distinct) produce no near-duplicate warning', () => {
  const { warnings } = buildPlaceRegistry([
    { place_id: 'seljalandsfoss', name: 'Seljalandsfoss', destination: 'islandia', lat: 63.6156, lng: -19.9887, type: 'monument', verified_at: '2024-01-01' },
    { place_id: 'gljufrafoss', name: 'Gljúfrafoss', destination: 'islandia', lat: 63.6181, lng: -19.9909, type: 'monument', verified_at: '2024-01-01' },
  ])
  assert.deepStrictEqual(warnings, [])
})
