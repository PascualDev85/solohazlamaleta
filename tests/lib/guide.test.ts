import { test } from 'node:test'
import assert from 'node:assert'
import { dayCost, directionsUrls, groupWasLived, wasLived } from '../../src/lib/guide.ts'

// Only the fields each helper reads; the full shape lives in src/content/schema.ts.
type Stops = Parameters<typeof directionsUrls>[0]
type Guide = Parameters<typeof wasLived>[0]

const stopsAt = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ lat: 48 + i / 100, lng: 7 })) as unknown as Stops

test('directionsUrls gives no link for fewer than two stops', () => {
  assert.deepStrictEqual(directionsUrls(stopsAt(0)), [])
  assert.deepStrictEqual(directionsUrls(stopsAt(1)), [])
})

test('directionsUrls links two stops as origin and destination, with no waypoints', () => {
  const [url] = directionsUrls(stopsAt(2))
  const params = new URL(url).searchParams
  assert.strictEqual(params.get('origin'), '48,7')
  assert.strictEqual(params.get('destination'), '48.01,7')
  assert.strictEqual(params.get('waypoints'), null)
})

test('directionsUrls splits a day past 25 stops into legs that share their joining stop', () => {
  const urls = directionsUrls(stopsAt(26))
  assert.strictEqual(urls.length, 2)
  const [first, second] = urls.map((url) => new URL(url).searchParams)
  assert.strictEqual(first.get('waypoints')?.split('|').length, 23)
  // The second leg starts where the first one ended: no stop is dropped.
  assert.strictEqual(second.get('origin'), first.get('destination'))
  assert.strictEqual(second.get('destination'), '48.25,7')
})

test('dayCost adds up the priced stops and is null when nothing is priced', () => {
  const priced = [{ cost: { amount: 12 } }, {}, { cost: { amount: 8.5 } }] as unknown as Stops
  assert.strictEqual(dayCost(priced), 20.5)
  assert.strictEqual(dayCost([{}, {}] as unknown as Stops), null)
})

test('wasLived marks the days of the variant the author actually made', () => {
  const guide = { meta: { tripDone: { days: 3, group: 'couple' } }, variants: { '3': [1, 2, 4] } } as unknown as Guide
  assert.strictEqual(wasLived(guide, 4), true)
  assert.strictEqual(wasLived(guide, 3), false)
})

test('wasLived is false for every day of a guide whose trip is not done', () => {
  const guide = { meta: { tripDone: null }, variants: { '3': [1, 2, 3] } } as unknown as Guide
  assert.strictEqual(wasLived(guide, 1), false)
})

test('groupWasLived is true only for the group the trip was made with', () => {
  const guide = { meta: { tripDone: { days: 3, group: 'couple' } } } as unknown as Guide
  assert.strictEqual(groupWasLived(guide, 'couple'), true)
  assert.strictEqual(groupWasLived(guide, 'friends'), false)
})
