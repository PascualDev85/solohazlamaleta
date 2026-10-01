import { test } from 'node:test'
import assert from 'node:assert'
import { loadGuide, loadPlaces } from '../../engine/load/index.ts'
import { GuideSourceSchema } from '../../schemas/guide.ts'

const GUIDE_PATH = new URL('../../content/guides/islandia/islandia-en-camper-13-dias.yaml', import.meta.url).pathname
const PLACES_PATH = new URL('../../content/places/islandia.yaml', import.meta.url).pathname

test('the real Islandia guide matches GuideSourceSchema', async () => {
  const raw = await loadGuide(GUIDE_PATH)
  const result = GuideSourceSchema.safeParse(raw)
  assert.strictEqual(
    result.success,
    true,
    JSON.stringify('error' in result ? result.error?.issues : []),
  )
})

test('the guide contains days 1 through 12 (day 13 is the departure, no stops)', async () => {
  const raw = await loadGuide(GUIDE_PATH) as { variants: { days: { day: number }[] }[] }
  const days = raw.variants[0].days.map((d) => d.day).sort((a, b) => a - b)
  assert.deepStrictEqual(days, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
})

test('every stop place_id exists in the place registry', async () => {
  const rawGuide = await loadGuide(GUIDE_PATH) as { variants: { days: { stops: { place_id: string }[] }[] }[] }
  const rawPlaces = await loadPlaces(PLACES_PATH) as { place_id: string }[]
  const placeIds = new Set(rawPlaces.map((p) => p.place_id))

  for (const variant of rawGuide.variants) {
    for (const day of variant.days) {
      for (const stop of day.stops) {
        assert.ok(placeIds.has(stop.place_id), `missing place_id: ${stop.place_id}`)
      }
    }
  }
})

test('the guide has no source-written derived fields (places, budget.type, etc.)', async () => {
  const raw = await loadGuide(GUIDE_PATH) as Record<string, unknown>
  assert.strictEqual('places' in raw, false)
  const budget = raw.budget as Record<string, unknown> | undefined
  assert.strictEqual(budget && 'type' in budget, false)
  assert.strictEqual(budget && 'total_base' in budget, false)
  assert.strictEqual(budget && 'total_reference' in budget, false)
})

test('the guide has no affiliate_id references anywhere', async () => {
  const raw = await loadGuide(GUIDE_PATH)
  assert.strictEqual(JSON.stringify(raw).includes('affiliate_id'), false)
})

test('days 9-12 flag their stop durations as estimated, not confirmed data', async () => {
  const raw = await loadGuide(GUIDE_PATH) as { variants: { days: { day: number; summary?: string }[] }[] }
  const days = raw.variants[0].days.filter((d) => [9, 10, 11, 12].includes(d.day))

  assert.strictEqual(days.length, 4)
  for (const day of days) {
    assert.ok(
      day.summary?.toLowerCase().includes('estimad'),
      `day ${day.day} summary does not flag durations as estimated: ${JSON.stringify(day.summary)}`,
    )
  }
})
