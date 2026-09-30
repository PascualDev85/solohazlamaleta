import { test } from 'node:test'
import assert from 'node:assert'
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadCompiledGuide } from '../../src/lib/engine-guide.ts'

const GUIDE_PATH = 'content/guides/islandia/islandia-en-camper-13-dias.yaml'
const PLACES_PATH = 'content/places/islandia.yaml'

test('loadCompiledGuide compiles the real Islandia guide successfully', async () => {
  const compiled = await loadCompiledGuide(GUIDE_PATH, PLACES_PATH)

  assert.strictEqual(compiled.slug, 'islandia-en-camper-13-dias')
  assert.strictEqual(compiled.variants?.[0].days.length, 7)
})

test('the real guide shows total_reference, not total_base, as the trip total (4495.21 EUR for 2 travelers)', async () => {
  const compiled = await loadCompiledGuide(GUIDE_PATH, PLACES_PATH)

  assert.ok(compiled.budget)
  assert.ok(Math.abs(compiled.budget!.total_reference - 4495.21) < 0.001)
})

test('the real guide source has no affiliate_id anywhere, and no compiled stop has a booking (so the empty AffiliateRegistry never gets exercised silently)', async () => {
  // Checking the compiled output alone is not enough: a resolved affiliate
  // renames the field to `affiliate`, so a string search for "affiliate_id"
  // on the CompiledGuide would pass even if resolution happened. Check the
  // source YAML for the raw key, and the compiled stops for the structural
  // field that resolution would have populated.
  const rawYaml = await readFile(GUIDE_PATH, 'utf-8')
  assert.strictEqual(rawYaml.includes('affiliate_id'), false)

  const compiled = await loadCompiledGuide(GUIDE_PATH, PLACES_PATH)
  for (const variant of compiled.variants ?? []) {
    for (const day of variant.days) {
      for (const stop of day.stops) {
        assert.strictEqual(stop.booking, undefined)
      }
    }
  }
})

test('loadCompiledGuide throws when a stop references a place_id missing from the registry', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'engine-guide-'))
  const placesPath = join(dir, 'places.yaml')
  const brokenPlaces = (await readFile(PLACES_PATH, 'utf-8')).replace(
    'place_id: thingvellir\n',
    'place_id: thingvellir-broken\n',
  )
  await writeFile(placesPath, brokenPlaces)

  await assert.rejects(
    () => loadCompiledGuide(GUIDE_PATH, placesPath),
    /thingvellir/,
  )

  await rm(dir, { recursive: true })
})
