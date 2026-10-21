import { test } from 'node:test'
import assert from 'node:assert'
import { readFile } from 'node:fs/promises'
import { loadCompiledGuide } from '../../src/lib/engine-guide.ts'
import { engineGuideSections, engineSectionFlags, legacyGuideSections } from '../../src/lib/guide-sections.ts'

const ISLANDIA_GUIDE = 'content/guides/islandia/islandia-en-camper-13-dias.yaml'
const ISLANDIA_PLACES = 'content/places/islandia.yaml'

test('engineGuideSections lists the sections the guide page renders, in page order', async () => {
  const guide = await loadCompiledGuide(ISLANDIA_GUIDE, ISLANDIA_PLACES)
  assert.deepStrictEqual(
    engineGuideSections(guide).map((section) => section.id),
    ['itinerario', 'dormir', 'llegar', 'presupuesto', 'reservar', 'criterio', 'practico', 'faq'],
  )
})

test('engineGuideSections leaves out a section with nothing to show', async () => {
  const guide = await loadCompiledGuide(ISLANDIA_GUIDE, ISLANDIA_PLACES)
  const bare = { ...guide, budget: undefined, faq: [] }
  const ids = engineGuideSections(bare).map((section) => section.id)
  assert.ok(!ids.includes('presupuesto'))
  assert.ok(!ids.includes('faq'))
  assert.strictEqual(engineSectionFlags(bare).budget, false)
})

test('legacyGuideSections follows the legacy page: its ids and headings are in the template', async () => {
  const page = await readFile('src/pages/[destino]/[slug].astro', 'utf-8')
  const alsacia = JSON.parse(await readFile('src/content/guides/ruta-pueblos-y-vinos.json', 'utf-8'))
  const sections = legacyGuideSections(alsacia)
  assert.ok(sections.length >= 3)
  for (const { id, label } of sections) assert.ok(page.includes(`<h2 id="${id}">${label}</h2>`), `no <h2 id="${id}">${label}</h2>`)
  const empty = legacyGuideSections({ ...alsacia, lodging: [], bookingChecklist: [], pitfalls: [], faq: [] })
  assert.deepStrictEqual(empty.map((section) => section.id), ['resumen', 'duraciones', 'itinerario'])
})
