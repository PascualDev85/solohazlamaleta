import { test } from 'node:test'
import assert from 'node:assert'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadGuide, loadPlaces } from '../../engine/load/index.ts'

test('loadGuide parses a YAML file into an object', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'engine-load-'))
  const path = join(dir, 'guide.yaml')
  await writeFile(path, 'slug: test\ntitle: "Test Guide"\n')

  const result = await loadGuide(path) as Record<string, unknown>
  assert.strictEqual(result.slug, 'test')
  assert.strictEqual(result.title, 'Test Guide')

  await rm(dir, { recursive: true })
})

test('loadPlaces parses a YAML list into an array', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'engine-load-'))
  const path = join(dir, 'places.yaml')
  await writeFile(path, '- place_id: a\n  name: A\n- place_id: b\n  name: B\n')

  const result = await loadPlaces(path) as unknown[]
  assert.strictEqual(result.length, 2)

  await rm(dir, { recursive: true })
})

test('loadGuide rejects when the file does not exist', async () => {
  await assert.rejects(() => loadGuide('/nonexistent/path.yaml'))
})
