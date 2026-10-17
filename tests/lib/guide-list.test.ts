import { test } from 'node:test'
import assert from 'node:assert'
import { readFile } from 'node:fs/promises'
import { fromLegacyGuide, fromCompiledGuide, sortGuideList, ENGINE_GUIDE_SOURCES } from '../../src/lib/guide-list.ts'
import type { GuideListItem } from '../../src/lib/guide-list.ts'
import { loadCompiledGuide } from '../../src/lib/engine-guide.ts'

const ALSACIA_PATH = 'src/content/guides/ruta-pueblos-y-vinos.json'

test('fromLegacyGuide maps the Alsacia guide to the same card the landing page showed before', async () => {
  const alsacia = JSON.parse(await readFile(ALSACIA_PATH, 'utf-8'))
  const item = fromLegacyGuide('ruta-pueblos-y-vinos', alsacia)

  assert.deepStrictEqual(item, {
    title: alsacia.meta.title,
    description: alsacia.meta.description,
    destination: 'alsacia',
    days: [2, 3, 4, 5],
    url: '/alsacia/ruta-pueblos-y-vinos/',
    lived: true,
    livedNote: 'En familia con mayores · el puente de diciembre de 2024',
    draft: true,
    updatedAt: '2026-09-22',
    coverImage: null,
    budgetPerPerson: null,
  })
})

test('fromLegacyGuide marks a guide without tripDone as not lived, with no note', async () => {
  const alsacia = JSON.parse(await readFile(ALSACIA_PATH, 'utf-8'))
  const item = fromLegacyGuide('x', { ...alsacia, meta: { ...alsacia.meta, tripDone: null, draft: false } })

  assert.strictEqual(item.lived, false)
  assert.strictEqual(item.livedNote, null)
  assert.strictEqual(item.draft, false)
})

test('fromCompiledGuide maps the real Islandia guide: 13 variant days, lived, draft while not published', async () => {
  const [source] = ENGINE_GUIDE_SOURCES
  const item = fromCompiledGuide(await loadCompiledGuide(source.guide, source.places))

  assert.deepStrictEqual(item, {
    title: 'Islandia en camper: ruta de 13 días por la Ring Road',
    description: item.description,
    destination: 'islandia',
    days: [13],
    url: '/islandia/islandia-en-camper-13-dias/',
    lived: true,
    livedNote: null,
    draft: true,
    updatedAt: '2026-10-04',
    coverImage: 'islandia/islandia-gljufrafoss.jpg',
    budgetPerPerson: item.budgetPerPerson,
  })
  assert.ok(item.description.length > 0)
})

test('fromCompiledGuide is a draft for every status except published, and not lived without trip_done', async () => {
  const [source] = ENGINE_GUIDE_SOURCES
  const guide = await loadCompiledGuide(source.guide, source.places)

  for (const status of ['draft', 'reviewed', 'archived'] as const) {
    assert.strictEqual(fromCompiledGuide({ ...guide, status }).draft, true, status)
  }
  assert.strictEqual(fromCompiledGuide({ ...guide, status: 'published' }).draft, false)
  assert.strictEqual(fromCompiledGuide({ ...guide, trip_done: undefined }).lived, false)
})

test('fromCompiledGuide falls back to the guide days when there are no variants', async () => {
  const [source] = ENGINE_GUIDE_SOURCES
  const guide = await loadCompiledGuide(source.guide, source.places)

  assert.deepStrictEqual(fromCompiledGuide({ ...guide, variants: undefined, days: 13 }).days, [13])
  assert.deepStrictEqual(fromCompiledGuide({ ...guide, variants: undefined, days: undefined }).days, [])
})

test('fromLegacyGuide keeps a cover image when the guide has one', async () => {
  const alsacia = JSON.parse(await readFile(ALSACIA_PATH, 'utf-8'))
  const item = fromLegacyGuide('x', { ...alsacia, meta: { ...alsacia.meta, coverImage: 'alsacia/colmar.jpg' } })

  assert.strictEqual(item.coverImage, 'alsacia/colmar.jpg')
})

test('fromCompiledGuide lists the derived budget per person: total over travellers, in the budget currency', async () => {
  const [source] = ENGINE_GUIDE_SOURCES
  const guide = await loadCompiledGuide(source.guide, source.places)
  const item = fromCompiledGuide(guide)

  assert.ok(guide.budget && guide.base_travelers)
  assert.deepStrictEqual(item.budgetPerPerson, {
    amount: guide.budget.total_reference / guide.base_travelers,
    currency: 'EUR',
  })
})

test('fromCompiledGuide lists no budget when the engine did not derive one', async () => {
  const [source] = ENGINE_GUIDE_SOURCES
  const guide = await loadCompiledGuide(source.guide, source.places)

  const noPerPerson = { ...guide, summary: { ...guide.summary, budget_per_person: undefined } }
  assert.strictEqual(fromCompiledGuide(noPerPerson).budgetPerPerson, null)
  assert.strictEqual(fromCompiledGuide({ ...guide, budget: undefined }).budgetPerPerson, null)
})

test('sortGuideList puts published guides first, then the most recently updated', () => {
  const item = (title: string, draft: boolean, updatedAt: string): GuideListItem => ({
    title, description: '', destination: '', days: [], url: '', lived: false, livedNote: null, draft, updatedAt,
    coverImage: null, budgetPerPerson: null,
  })
  const sorted = sortGuideList([
    item('old draft', true, '2026-01-01'),
    item('new draft', true, '2026-10-04'),
    item('old published', false, '2025-01-01'),
    item('new published', false, '2026-02-01'),
  ])

  assert.deepStrictEqual(sorted.map((g) => g.title), ['new published', 'old published', 'new draft', 'old draft'])
})
