import { test } from 'node:test'
import assert from 'node:assert'
import { compileGuide } from '../../engine/compile/guide.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../../engine/types.ts'
import type { GuideSource } from '../../schemas/index.ts'

const places: PlaceRegistry = {
  get: (id) => (id === 'a' ? { place_id: 'a', name: 'A', destination: 'islandia', lat: 1, lng: 1, type: 'other', verified_at: '2024-01-01' } : undefined),
}
const emptyAffiliates: AffiliateRegistry = { get: () => undefined }
const now = new Date('2024-06-01')

function minimalSource(overrides: Partial<GuideSource> = {}): GuideSource {
  return {
    slug: 's', destination: 'islandia', hub: '/islandia/', type: 'itinerary', content_type: 'experience',
    status: 'reviewed', title: 't', description: 'd', updated_at: '2024-01-01', cover_image: '/x.jpg',
    base_travelers: 2,
    summary: { tagline: 'tag' },
    variants: [{
      id: 'intensivo', name: 'V', description: 'd',
      days: [
        { day: 1, title: 'D1', stops: [{ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' }] },
        { day: 2, title: 'D2', stops: [{ place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' }] },
      ],
    }],
    ...overrides,
  }
}

test('places is the deduplicated union of every stop place across all variants', () => {
  const compiled = compileGuide(minimalSource(), places, emptyAffiliates, now)
  assert.strictEqual(compiled.places.length, 1)
})

test('has_experience is true when content_type is experience and trip_done is set', () => {
  const compiled = compileGuide(minimalSource({ trip_done: '2024' }), places, emptyAffiliates, now)
  assert.strictEqual(compiled.has_experience, true)
})

test('has_experience is false when trip_done is missing', () => {
  const compiled = compileGuide(minimalSource(), places, emptyAffiliates, now)
  assert.strictEqual(compiled.has_experience, false)
})

test('compiled_at is set to the given now as an ISO string', () => {
  const compiled = compileGuide(minimalSource(), places, emptyAffiliates, now)
  assert.strictEqual(compiled.compiled_at, now.toISOString())
})

test('summary.budget_per_person is derived from budget.total_reference / base_travelers', () => {
  const source = minimalSource({
    budget: {
      currency: 'EUR', includes: [], excludes: [],
      items: [{ category: 'vuelos', label: 'a', amount: 100, basis: 'per_person', type: 'real', verified_at: '2024-01-01' }],
    },
  })
  const compiled = compileGuide(source, places, emptyAffiliates, now)
  assert.strictEqual(compiled.summary.budget_per_person, 100) // 200 total_reference / 2 travelers
})

test('a guide with only days 1 and 2 (no days 3-13) is a valid, partial CompiledGuide', () => {
  const compiled = compileGuide(minimalSource(), places, emptyAffiliates, now)
  assert.deepStrictEqual(compiled.variants?.[0].days.map((d) => d.day), [1, 2])
})
