import { test } from 'node:test'
import assert from 'node:assert'
import { nightsByPlace, nightCounts } from '../../src/lib/nightsByPlace.ts'

type Night = { day: number; overnight?: { place_id: string } | null }

const days: Night[] = [
  { day: 1, overnight: { place_id: 'camp_a' } },
  { day: 2, overnight: { place_id: 'camp_b' } },
  { day: 3, overnight: { place_id: 'camp_b' } },
  { day: 4, overnight: null },
  { day: 5 },
]

test('nightsByPlace lists, per campsite, the days whose night was spent there', () => {
  const nights = nightsByPlace(days)
  assert.deepStrictEqual(nights.get('camp_a'), [1])
  assert.deepStrictEqual(nights.get('camp_b'), [2, 3])
  assert.strictEqual(nights.has('camp_c'), false)
})

test('nightCounts tells campsite nights from nights outside; a day with no night counts for neither', () => {
  assert.deepStrictEqual(nightCounts(days), { campsite: 3, outside: 1 })
})
