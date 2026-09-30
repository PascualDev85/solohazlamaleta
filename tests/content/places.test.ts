import { test } from 'node:test'
import assert from 'node:assert'
import { loadPlaces } from '../../engine/load/index.ts'
import { PlaceSourceSchema } from '../../schemas/place.ts'

const PLACES_PATH = new URL('../../content/places/islandia.yaml', import.meta.url).pathname

test('islandia.yaml loads and every entry matches PlaceSourceSchema', async () => {
  const raw = await loadPlaces(PLACES_PATH) as unknown[]
  assert.strictEqual(raw.length, 26)

  for (const entry of raw) {
    const result = PlaceSourceSchema.safeParse(entry)
    assert.strictEqual(
      result.success,
      true,
      `place failed schema: ${JSON.stringify(entry)} — ${JSON.stringify('error' in result ? result.error?.issues : [])}`,
    )
  }
})

test('every place_id is unique', async () => {
  const raw = await loadPlaces(PLACES_PATH) as { place_id: string }[]
  const ids = raw.map((p) => p.place_id)
  assert.strictEqual(new Set(ids).size, ids.length)
})
