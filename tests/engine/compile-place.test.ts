import { test } from 'node:test'
import assert from 'node:assert'
import { resolvePlace, resolveAffiliate } from '../../engine/compile/place.ts'
import type { PlaceSource } from '../../schemas/place.ts'

const basePlace: PlaceSource = {
  place_id: 'x',
  name: 'X',
  destination: 'islandia',
  lat: 1,
  lng: 1,
  type: 'other',
  verified_at: '2024-01-01',
  review_interval: 12,
}

test('a recently verified place is not stale', () => {
  const now = new Date('2024-06-01')
  const compiled = resolvePlace(basePlace, now)
  assert.strictEqual(compiled.is_stale, false)
  assert.deepStrictEqual(compiled.stale_fields, [])
})

test('a place verified more than review_interval months ago is stale', () => {
  const now = new Date('2026-01-01')
  const compiled = resolvePlace(basePlace, now)
  assert.strictEqual(compiled.is_stale, true)
  assert.ok(compiled.stale_fields.includes('verified_at'))
})

test('entry.verified_at is checked independently of the place-level verified_at', () => {
  const place: PlaceSource = {
    ...basePlace,
    verified_at: '2024-08-15',
    entry: { price: 900, currency: 'ISK', verified_at: '2020-01-01' },
  }
  const now = new Date('2024-09-01')
  const compiled = resolvePlace(place, now)
  assert.strictEqual(compiled.is_stale, true)
  assert.deepStrictEqual(compiled.stale_fields, ['entry.price'])
})

test('description flows through to CompiledPlace unchanged, independent of notes', () => {
  const place: PlaceSource = {
    ...basePlace,
    description: 'Cascada de 60 m accesible desde la Ring Road.',
    notes: 'Parking de pago junto a la cascada.',
  }
  const compiled = resolvePlace(place, new Date('2024-06-01'))
  assert.strictEqual(compiled.description, 'Cascada de 60 m accesible desde la Ring Road.')
  assert.strictEqual(compiled.notes, 'Parking de pago junto a la cascada.')
})

test('resolveAffiliate builds the /ir/{id} redirect url', () => {
  const compiled = resolveAffiliate({
    id: 'iati-seguro-europa',
    partner: 'IATI',
    category: 'insurance',
    description: 'Seguro de viaje',
    active: true,
    verified_at: '2024-01-01',
  })
  assert.strictEqual(compiled.redirect_url, '/ir/iati-seguro-europa')
})

test('parking.verified_at is checked like entry and hours (stale_fields includes parking)', () => {
  const place = { ...basePlace, verified_at: '2024-05-01', parking: { price: 1000, currency: 'ISK', verified_at: '2022-01-01' } }
  const compiled = resolvePlace(place, new Date('2024-06-01'))
  assert.deepStrictEqual(compiled.stale_fields, ['parking'])
})
