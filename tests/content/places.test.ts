import { test } from 'node:test'
import assert from 'node:assert'
import { loadPlaces } from '../../engine/load/index.ts'
import { PlaceSourceSchema } from '../../schemas/place.ts'

const PLACES_PATH = new URL('../../content/places/islandia.yaml', import.meta.url).pathname

test('islandia.yaml loads and every entry matches PlaceSourceSchema', async () => {
  const raw = await loadPlaces(PLACES_PATH) as unknown[]
  assert.strictEqual(raw.length, 56)

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

// Places from docs/1.6.4_json_islandia.md §1 — verified by the author directly.
const AUTHOR_VERIFIED_PLACE_IDS = new Set([
  'thingvellir', 'geysir', 'gullfoss', 'seljalandsfoss', 'skogafoss', 'jokulsarlon', 'vestrahorn',
])

test('every place added for days 4-12 (not in the author-verified §1 sample) flags its coordinates/notes as pending author confirmation', async () => {
  const raw = await loadPlaces(PLACES_PATH) as { place_id: string; notes?: string }[]
  const implementerWritten = raw.filter((p) => !AUTHOR_VERIFIED_PLACE_IDS.has(p.place_id))

  assert.strictEqual(implementerWritten.length, 49)
  for (const place of implementerWritten) {
    assert.ok(
      place.notes?.toLowerCase().includes('pendiente') && place.notes?.toLowerCase().includes('confirmar'),
      `${place.place_id} is missing a pending-confirmation note: ${JSON.stringify(place.notes)}`,
    )
  }
})
