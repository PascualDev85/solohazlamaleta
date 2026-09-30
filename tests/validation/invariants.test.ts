import { test } from 'node:test'
import assert from 'node:assert'
import { validateGuide, compileGuide } from '../../engine/index.ts'
import { PlaceSourceSchema } from '../../schemas/index.ts'
import type { PlaceRegistry, AffiliateRegistry, GuideSource } from '../../engine/index.ts'

const places: PlaceRegistry = {
  get: (id) => (id === 'a' ? { place_id: 'a', name: 'A', destination: 'islandia', lat: 1, lng: 1, type: 'other', verified_at: '2024-01-01', entry: { price: 10, currency: 'EUR', verified_at: '2024-01-01' } } : undefined),
}
const emptyAffiliates: AffiliateRegistry = { get: () => undefined }
const now = new Date('2024-06-01')

function guideWithStop(stop: Record<string, unknown>): GuideSource {
  return {
    slug: 's', destination: 'islandia', hub: '/islandia/', type: 'itinerary', content_type: 'experience',
    status: 'reviewed', title: 't', description: 'd', updated_at: '2024-01-01', cover_image: '/x.jpg',
    summary: { tagline: 'tag' },
    variants: [{ id: 'intensivo', name: 'V', description: 'd', days: [{ day: 1, title: 'D1', stops: [stop] as never } as never] }],
  } as GuideSource
}

test('I1 — un LUGAR existe una sola vez globalmente: el mismo place_id en dos paradas resuelve al mismo lugar', () => {
  const source: GuideSource = {
    ...guideWithStop({}),
    variants: [{
      id: 'intensivo', name: 'V', description: 'd',
      days: [{
        day: 1, title: 'D1',
        stops: [
          { place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
          { place_id: 'a', order: 2, duration_min: 45, planning_status: 'required', visit_status: 'visited' },
        ],
      }],
    }],
  }
  const result = compileGuide(source, places, emptyAffiliates, now)
  const [stop1, stop2] = result.variants![0].days[0].stops
  assert.deepStrictEqual(stop1.place, stop2.place)
})

test('I5 — place_id inexistente impide compilar (ERROR, no advertencia)', () => {
  const source = guideWithStop({ place_id: 'no-existe', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' })
  const result = validateGuide(source, places, emptyAffiliates)
  assert.ok(result.errors.some((e) => e.includes('no-existe')))
})

test('I6 — affiliate_id inexistente impide compilar (ERROR, no advertencia)', () => {
  const source = guideWithStop({
    place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited',
    booking: { affiliate_id: 'no-existe' },
  })
  const result = validateGuide(source, places, emptyAffiliates)
  assert.ok(result.errors.some((e) => e.includes('no-existe')))
})

test('I14 — experience{} con visit_status: visited es válido', () => {
  const source = guideWithStop({
    place_id: 'a', order: 1, duration_min: 30, planning_status: 'required',
    visit_status: 'visited', experience: { visited_at: '2024-05' },
  })
  const result = validateGuide(source, places, emptyAffiliates)
  assert.strictEqual(result.errors.length, 0)
})

test('I14 — experience{} con visit_status: not_visited es ERROR', () => {
  const source = guideWithStop({
    place_id: 'a', order: 1, duration_min: 30, planning_status: 'required',
    visit_status: 'not_visited', experience: { visited_at: '2024-05' },
  })
  const result = validateGuide(source, places, emptyAffiliates)
  assert.ok(result.errors.length > 0)
})

test('I14 — experience{} con visit_status: unknown es ERROR', () => {
  const source = guideWithStop({
    place_id: 'a', order: 1, duration_min: 30, planning_status: 'required',
    visit_status: 'unknown', experience: { visited_at: '2024-05' },
  })
  const result = validateGuide(source, places, emptyAffiliates)
  assert.ok(result.errors.length > 0)
})

test('I15 — el estado de visita pertenece a PARADA, nunca a LUGAR', () => {
  const parsed = PlaceSourceSchema.parse({
    place_id: 'a', name: 'A', destination: 'islandia', lat: 1, lng: 1,
    type: 'other', verified_at: '2024-01-01',
    visit_status: 'visited', // not a real field on PlaceSource — Zod strips unknown keys
  } as never)
  assert.strictEqual('visit_status' in parsed, false)
})

test('I16 — actual_price_paid (PARADA) y entry.price (LUGAR) coexisten sin sobrescribirse', () => {
  const source: GuideSource = {
    ...guideWithStop({}),
    variants: [{
      id: 'intensivo', name: 'V', description: 'd',
      days: [{
        day: 1, title: 'D1',
        stops: [{
          place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited',
          experience: { visited_at: '2024-05', actual_price_paid: { amount: 6, currency: 'EUR' } },
        }],
      }],
    }],
  }
  const compiled = compileGuide(source, places, emptyAffiliates, now)
  const stop = compiled.variants![0].days[0].stops[0]
  assert.strictEqual(stop.experience?.actual_price_paid?.amount, 6)
  assert.strictEqual(stop.place.entry?.price, 10)
})
