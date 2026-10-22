import { test } from 'node:test'
import assert from 'node:assert'
import { anchorHrefs, brokenLinks, elementIds } from '../../scripts/link-check-tools.ts'

test('anchorHrefs reads the href of every <a>, decoding entities, and nothing else', () => {
  const html = `<link rel="canonical" href="/x/"><a class="a" href="/islandia/#dia-2">Día 2</a>
    <a href='/?q=1&amp;b=2'>q</a><a id="no-href">x</a>`
  assert.deepStrictEqual(anchorHrefs(html), ['/islandia/#dia-2', '/?q=1&b=2'])
})

test('elementIds reads every id', () => {
  assert.deepStrictEqual([...elementIds('<h2 id="dia-1">1</h2><section id=\'faq\'></section>')], ['dia-1', 'faq'])
})

const site = new Map([
  ['/islandia/', '<h2 id="practico">P</h2><a href="/islandia/ruta/#dia-1">1</a>'],
  ['/islandia/ruta/', '<h2 id="dia-1">1</h2><a href="#dia-1">1</a><a href="/islandia/#practico">P</a>'],
  ['/', '<main id="main"></main>'],
])
const files = new Set(['/favicon.svg'])

test('brokenLinks: nothing to report when every page and id exists', () => {
  assert.deepStrictEqual(brokenLinks(site, files, ['/islandia/', '/islandia/ruta/']), [])
})

test('brokenLinks: external links, mailto and assets that exist are not page links', () => {
  const pages = new Map([['/a/', '<a href="https://example.com/x">x</a><a href="mailto:a@b.c">m</a><a href="/favicon.svg">f</a>']])
  assert.deepStrictEqual(brokenLinks(pages, files, ['/a/']), [])
})

test('brokenLinks: a page that does not exist', () => {
  const pages = new Map([...site, ['/islandia/', '<a href="/islandia/circulo-dorado/">x</a>']])
  assert.deepStrictEqual(brokenLinks(pages, files, ['/islandia/']), [
    '/islandia/ → /islandia/circulo-dorado/: no such page',
  ])
})

test('brokenLinks: an id that the target page does not have, on another page or on the same one', () => {
  const pages = new Map([...site, ['/islandia/', '<a href="/islandia/ruta/#dia-99">x</a><a href="#cuando-ir">y</a>']])
  assert.deepStrictEqual(brokenLinks(pages, files, ['/islandia/']), [
    '/islandia/ → /islandia/ruta/#dia-99: no id "dia-99" there',
    '/islandia/ → #cuando-ir: no id "cuando-ir" there',
  ])
})

test('brokenLinks: a page link without the trailing slash', () => {
  const pages = new Map([...site, ['/islandia/', '<a href="/islandia/ruta#dia-1">x</a>']])
  assert.deepStrictEqual(brokenLinks(pages, files, ['/islandia/']), [
    '/islandia/ → /islandia/ruta#dia-1: no trailing slash',
  ])
})

test('brokenLinks: a missing asset', () => {
  const pages = new Map([['/a/', '<a href="/fotos/no.jpg">x</a>']])
  assert.deepStrictEqual(brokenLinks(pages, files, ['/a/']), ['/a/ → /fotos/no.jpg: no such file'])
})

test('brokenLinks: only the pages asked for are checked', () => {
  const pages = new Map([...site, ['/otra/', '<a href="/nada/">x</a>']])
  assert.deepStrictEqual(brokenLinks(pages, files, ['/islandia/']), [])
})

test('brokenLinks: a malformed escape is reported as a broken link, not a crash', () => {
  const pages = new Map([['/a/', '<a href="/islandia/100%/">x</a><a href="#dia-%E0">y</a>']])
  assert.deepStrictEqual(brokenLinks(pages, files, ['/a/']), [
    '/a/ → /islandia/100%/: malformed escape',
    '/a/ → #dia-%E0: malformed escape',
  ])
})
