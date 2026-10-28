import { test } from 'node:test'
import assert from 'node:assert'
import { gzipSync } from 'node:zlib'
import { DEFAULT_BUDGET, PAGE_BUDGETS, formatTable, gzipSize, kb, measure, overBudget, pageFromFile } from '../../scripts/html-size.ts'

test('the budgets are the ones in docs/1.13 §5: 43.8 KB, and 95 KB for the 13-day guide', () => {
  assert.strictEqual(DEFAULT_BUDGET, 43_800)
  assert.deepStrictEqual(PAGE_BUDGETS, { '/islandia/islandia-en-camper-13-dias/': 95_000 })
  // The guide's cap leaves a margin under the next TCP window (~102 KB).
  assert.ok(PAGE_BUDGETS['/islandia/islandia-en-camper-13-dias/'] < 102_000)
})

test('gzipSize compresses at level 6', () => {
  const html = '<p>Solo haz la maleta</p>'.repeat(500)
  assert.strictEqual(gzipSize(html), gzipSync(html, { level: 6 }).length)
  assert.ok(gzipSize(html) < html.length)
})

test('pageFromFile maps a file under dist/ to its URL, with the trailing slash', () => {
  assert.strictEqual(pageFromFile('index.html'), '/')
  assert.strictEqual(pageFromFile('islandia/islandia-en-camper-13-dias/index.html'), '/islandia/islandia-en-camper-13-dias/')
  assert.strictEqual(pageFromFile('aviso-legal\\index.html'), '/aviso-legal/')
  assert.strictEqual(pageFromFile('404.html'), '/404.html')
})

test('measure applies the page budget, else the default, and sorts by page', () => {
  const sizes = measure([
    { page: '/islandia/islandia-en-camper-13-dias/', bytes: 46_000 },
    { page: '/', bytes: 20_000 },
  ])
  assert.deepStrictEqual(sizes, [
    { page: '/', bytes: 20_000, budget: 43_800, left: 23_800 },
    { page: '/islandia/islandia-en-camper-13-dias/', bytes: 46_000, budget: 95_000, left: 49_000 },
  ])
})

test('overBudget reports only the pages past their cap; exactly at the cap passes', () => {
  const sizes = measure(
    [
      { page: '/a/', bytes: 43_800 },
      { page: '/b/', bytes: 43_801 },
      { page: '/g/', bytes: 95_100 },
    ],
    { '/g/': 95_000 },
  )
  assert.deepStrictEqual(overBudget(sizes), ['/b/: 43.8 KB > 43.8 KB (1 bytes over)', '/g/: 95.1 KB > 95.0 KB (100 bytes over)'])
  assert.deepStrictEqual(overBudget(measure([{ page: '/', bytes: 1 }])), [])
})

test('kb writes bytes as KB with one decimal, 1 KB = 1000 bytes', () => {
  assert.strictEqual(kb(43_800), '43.8 KB')
  assert.strictEqual(kb(-1_250), '-1.3 KB')
})

test('formatTable lists every page with its size, budget, what is left and the share used', () => {
  const table = formatTable(measure([{ page: '/', bytes: 21_900 }]))
  const [head, row] = table.split('\n')
  assert.match(head, /Page\s+Gzip\s+Budget\s+Left\s+Used/)
  assert.match(row, /^\/\s+21\.9 KB\s+43\.8 KB\s+21\.9 KB\s+50%$/)
})
