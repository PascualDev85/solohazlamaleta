import { test } from 'node:test'
import assert from 'node:assert'
import { existsSync } from 'node:fs'
import { loadGuide } from '../../engine/load/index.ts'
import { GuideSourceSchema, type GuideSource } from '../../schemas/guide.ts'

const HUB_PATH = 'content/guides/islandia/islandia.yaml'
const GUIDE_PATH = 'content/guides/islandia/islandia-en-camper-13-dias.yaml'

test('the Islandia hub matches GuideSourceSchema as a guide of type hub, without variants', async () => {
  const result = GuideSourceSchema.safeParse(await loadGuide(HUB_PATH))
  assert.strictEqual(result.success, true, JSON.stringify('error' in result ? result.error?.issues : []))
  assert.strictEqual(result.data!.type, 'hub')
  assert.strictEqual(result.data!.variants, undefined)
})

test('every guide the hub lists in related exists in the destination folder', async () => {
  const hub = (await loadGuide(HUB_PATH)) as GuideSource
  assert.ok((hub.related ?? []).length > 0)
  for (const slug of hub.related ?? []) {
    assert.ok(existsSync(`content/guides/${hub.destination}/${slug}.yaml`), `missing guide: ${slug}`)
  }
})

test('the hub has no affiliate_id anywhere (no affiliate is active, 1.13 §6)', async () => {
  assert.strictEqual(JSON.stringify(await loadGuide(HUB_PATH)).includes('affiliate_id'), false)
})

// Temporary duplication until step 5 of 1.13 §8 moves "Lo práctico" out of the
// guide: while both copies exist they must not drift apart.
test('the hub copy of practical matches the guide, currency aside', async () => {
  const hub = (await loadGuide(HUB_PATH)) as GuideSource
  const guide = (await loadGuide(GUIDE_PATH)) as GuideSource
  const { currency: _, ...hubPractical } = hub.practical ?? {}
  assert.deepStrictEqual(hubPractical, guide.practical)
})
