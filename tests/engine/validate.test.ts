import { test } from 'node:test'
import assert from 'node:assert'
import { validateGuide } from '../../engine/validate/index.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../../engine/types.ts'

const places: PlaceRegistry = { get: (id) => (id === 'a' ? { place_id: 'a', name: 'A', destination: 'islandia', lat: 1, lng: 1, type: 'other', verified_at: '2024-01-01' } : undefined) }
const affiliates: AffiliateRegistry = {
  get: (id) => (id === 'active-one' ? { id: 'active-one', partner: 'X', category: 'tour', description: 'd', active: true, verified_at: '2024-01-01' }
    : id === 'inactive-one' ? { id: 'inactive-one', partner: 'X', category: 'tour', description: 'd', active: false, verified_at: '2024-01-01' }
    : undefined),
}

function guideWithStop(stop: Record<string, unknown>, overrides: Record<string, unknown> = {}) {
  return {
    slug: 's', destination: 'islandia', hub: '/islandia/', type: 'itinerary', content_type: 'experience',
    status: 'reviewed', title: 't', description: 'd', updated_at: '2024-01-01', cover_image: '/x.jpg',
    summary: { tagline: 'tag' },
    variants: [{ id: 'intensivo', name: 'V', description: 'd', days: [{ day: 1, title: 'D1', stops: [stop] }] }],
    ...overrides,
  }
}

test('I5: missing place_id produces an error', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'missing', order: 1, duration_min: 30, planning_status: 'required' }),
    places, affiliates,
  )
  assert.ok(result.errors.some((e) => e.includes('missing')))
})

test('I6: missing affiliate_id produces an error', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', booking: { affiliate_id: 'missing-affiliate' } }),
    places, affiliates,
  )
  assert.ok(result.errors.some((e) => e.includes('missing-affiliate')))
})

test('I6: inactive affiliate_id produces an error', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', booking: { affiliate_id: 'inactive-one' } }),
    places, affiliates,
  )
  assert.ok(result.errors.some((e) => e.includes('inactivo')))
})

test('I6: active affiliate_id produces no error', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', booking: { affiliate_id: 'active-one' } }),
    places, affiliates,
  )
  assert.strictEqual(result.errors.length, 0)
})

test('I14: experience{} with visit_status visited is valid', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited', experience: { visited_at: '2024-01' } }),
    places, affiliates,
  )
  assert.strictEqual(result.errors.length, 0)
})

test('I14: experience{} with visit_status not_visited is an error', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'not_visited', experience: { visited_at: '2024-01' } }),
    places, affiliates,
  )
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('experience')))
})

test('I14: experience{} with visit_status unknown is an error', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'unknown', experience: { visited_at: '2024-01' } }),
    places, affiliates,
  )
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('experience')))
})

test('a not_visited stop with first-person variant_note warns, does not error', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'not_visited', variant_note: 'Nosotros hicimos esta parte del camino sin prisa.' }),
    places, affiliates,
  )
  assert.strictEqual(result.errors.length, 0)
  assert.ok(result.warnings.length > 0)
})

test('an unknown stop with first-person variant_note warns (I4: unknown branch)', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'unknown', variant_note: 'Aquí comimos genial y nos encantó.' }),
    places, affiliates,
  )
  assert.strictEqual(result.errors.length, 0)
  assert.ok(result.warnings.length > 0)
})

test('a visited stop with first-person variant_note does not warn about first person (control)', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited', variant_note: 'Aquí comimos genial y nos encantó.' }),
    places, affiliates,
  )
  assert.ok(!result.warnings.some((w) => w.includes('primera persona')))
})

test('status: draft is an error', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' }, { status: 'draft' }),
    places, affiliates,
  )
  assert.ok(result.errors.some((e) => e.includes('draft')))
})

test('schema-invalid input produces an error and no guide', () => {
  const result = validateGuide({ nonsense: true }, places, affiliates)
  assert.ok(result.errors.length > 0)
  assert.strictEqual(result.guide, undefined)
})

test('a place referenced by a stop with a stale verified_at produces a warning, not an error', () => {
  const stalePlaces: PlaceRegistry = {
    get: (id) => (id === 'a' ? { place_id: 'a', name: 'A', destination: 'islandia', lat: 1, lng: 1, type: 'other', verified_at: '2020-01-01', review_interval: 12 } : undefined),
  }
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' }),
    stalePlaces, affiliates,
    new Date('2024-06-01'),
  )
  assert.strictEqual(result.errors.length, 0)
  assert.ok(result.warnings.some((w) => w.includes('a') && w.toLowerCase().includes('caduc')))
})

test('a place referenced by a stop with a fresh verified_at produces no staleness warning', () => {
  const result = validateGuide(
    guideWithStop({ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' }),
    places, affiliates,
    new Date('2024-06-01'),
  )
  assert.ok(!result.warnings.some((w) => w.toLowerCase().includes('caduc')))
})

test('I3: a missing affiliate_id in accommodation.zones[].picks[] produces an error', () => {
  const result = validateGuide(
    guideWithStop(
      { place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
      { accommodation: { zones: [{ name: 'Zona', picks: [{ name: 'Camping X', affiliate_id: 'missing-affiliate' }] }] } },
    ),
    places, affiliates,
  )
  assert.ok(result.errors.some((e) => e.includes('missing-affiliate')))
})

test('I3: an inactive affiliate_id in practical.insurance_affiliate_id produces an error', () => {
  const result = validateGuide(
    guideWithStop(
      { place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
      { practical: { insurance_affiliate_id: 'inactive-one' } },
    ),
    places, affiliates,
  )
  assert.ok(result.errors.some((e) => e.includes('inactivo')))
})

test('I3: a valid, active affiliate_id in accommodation and practical produces no error', () => {
  const result = validateGuide(
    guideWithStop(
      { place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
      {
        accommodation: { zones: [{ name: 'Zona', picks: [{ name: 'Camping X', affiliate_id: 'active-one' }] }] },
        practical: { insurance_affiliate_id: 'active-one' },
      },
    ),
    places, affiliates,
  )
  assert.strictEqual(result.errors.length, 0)
})
