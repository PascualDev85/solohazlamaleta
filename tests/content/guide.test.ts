import { test } from 'node:test'
import assert from 'node:assert'
import { readFile } from 'node:fs/promises'
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

test('the guide contains days 1 through 13', async () => {
  const raw = await loadGuide(GUIDE_PATH) as { variants: { days: { day: number }[] }[] }
  const days = raw.variants[0].days.map((d) => d.day).sort((a, b) => a - b)
  assert.deepStrictEqual(days, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
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

test('no day summary leaks the internal "estimated duration" editorial note to readers', async () => {
  const raw = await loadGuide(GUIDE_PATH) as { variants: { days: { day: number; summary?: string }[] }[] }
  for (const day of raw.variants[0].days) {
    assert.ok(
      !day.summary?.toLowerCase().includes('pendiente') && !day.summary?.toLowerCase().includes('editorial'),
      `day ${day.day} summary still contains an internal note: ${JSON.stringify(day.summary)}`,
    )
  }
})

test('days without author-verified durations (all but 1 to 4) flag it as a YAML comment, not reader-visible text', async () => {
  const rawYaml = await readFile(GUIDE_PATH, 'utf-8')
  const dayBlocks = rawYaml.split(/\n(?=      - day: \d+\n)/)
  const estimatedDays = [5, 6, 7, 8, 9, 10, 11, 12, 13]

  for (const day of estimatedDays) {
    const block = dayBlocks.find((b) => b.startsWith(`      - day: ${day}\n`))
    assert.ok(block, `could not find a block for day ${day}`)
    assert.match(
      block!,
      /#\s*duraci[oó]n(?:es)? estimad[ao]s?, pendiente de confirmar/,
      `day ${day} is missing the "estimated duration" YAML comment`,
    )
  }
})
