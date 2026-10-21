import { test } from 'node:test'
import assert from 'node:assert'
import { headerRowLinks, menuDestinations, pagePathFromFile, siteLinks, inlineFits } from '../../src/lib/site-menu.ts'
import type { MenuGuide } from '../../src/lib/site-menu.ts'

const islandia: MenuGuide = { destination: 'islandia', url: '/islandia/islandia-en-camper-13-dias/', hub: '/islandia/', draft: false }
const alsacia: MenuGuide = { destination: 'alsacia', url: '/alsacia/ruta-pueblos-y-vinos/', hub: null, draft: false }
const NO_PAGES = new Set<string>()

test('pagePathFromFile turns a page file into its URL path, with the trailing slash', () => {
  assert.strictEqual(pagePathFromFile('../pages/index.astro'), '/')
  assert.strictEqual(pagePathFromFile('../pages/islandia/index.astro'), '/islandia/')
  assert.strictEqual(pagePathFromFile('../pages/sobre-mi.astro'), '/sobre-mi/')
  assert.strictEqual(pagePathFromFile('../pages/islandia/islandia-en-camper-13-dias.astro'), '/islandia/islandia-en-camper-13-dias/')
})

test('pagePathFromFile skips dynamic routes: their paths are not known from the file name', () => {
  assert.strictEqual(pagePathFromFile('../pages/[destino]/[slug].astro'), null)
  assert.strictEqual(pagePathFromFile('../pages/ir/[id].astro'), null)
})

test('a destination links to its hub when the hub page exists', () => {
  const links = menuDestinations([islandia], { currentPath: '/sobre-mi/', pagePaths: new Set(['/islandia/']) })
  assert.deepStrictEqual(links, [{ href: '/islandia/', label: 'Islandia' }])
})

test('a destination links to its guide while its hub page does not exist', () => {
  const links = menuDestinations([islandia, alsacia], { currentPath: '/sobre-mi/', pagePaths: NO_PAGES })
  assert.deepStrictEqual(links, [
    { href: '/alsacia/ruta-pueblos-y-vinos/', label: 'Alsacia' },
    { href: '/islandia/islandia-en-camper-13-dias/', label: 'Islandia' },
  ])
})

test('a draft stays out of the menu on pages that do not show it', () => {
  const draft = { ...islandia, draft: true }
  assert.deepStrictEqual(menuDestinations([draft], { currentPath: '/sobre-mi/', pagePaths: NO_PAGES }), [])
  assert.deepStrictEqual(menuDestinations([draft], { currentPath: '/alsacia/ruta-pueblos-y-vinos/', pagePaths: NO_PAGES }), [])
})

test('a draft shows on its own page, on its hub and on the catalogue, which already list it', () => {
  const draft = { ...islandia, draft: true }
  const hub = new Set(['/islandia/'])
  assert.deepStrictEqual(menuDestinations([draft], { currentPath: draft.url, pagePaths: NO_PAGES }), [
    { href: draft.url, label: 'Islandia' },
  ])
  assert.deepStrictEqual(menuDestinations([draft], { currentPath: '/islandia/', pagePaths: hub }), [{ href: '/islandia/', label: 'Islandia' }])
  assert.strictEqual(menuDestinations([draft], { currentPath: '/', pagePaths: NO_PAGES }).length, 1)
})

test('two guides of one destination make one entry: its hub, or the first guide given', () => {
  const second = { ...islandia, url: '/islandia/islandia-en-7-dias/' }
  assert.deepStrictEqual(menuDestinations([islandia, second], { currentPath: '/', pagePaths: new Set(['/islandia/']) }), [
    { href: '/islandia/', label: 'Islandia' },
  ])
  assert.deepStrictEqual(menuDestinations([islandia, second], { currentPath: '/', pagePaths: NO_PAGES }), [
    { href: islandia.url, label: 'Islandia' },
  ])
})

test('a published guide of a destination wins over a draft listed before it', () => {
  const draft = { ...islandia, draft: true, url: '/islandia/borrador/' }
  assert.deepStrictEqual(menuDestinations([draft, islandia], { currentPath: '/sobre-mi/', pagePaths: NO_PAGES }), [
    { href: islandia.url, label: 'Islandia' },
  ])
})

test('siteLinks hangs the destinations under "Guías" and keeps every other link, in order', () => {
  const nav = [
    { href: '/#guias', label: 'Guías' },
    { href: '/sobre-mi/', label: 'Sobre mí' },
    { href: '/buscar/', label: 'Buscar' },
  ]
  const destinations = [{ href: '/islandia/', label: 'Islandia' }]
  assert.deepStrictEqual(siteLinks(nav, destinations), [
    { href: '/#guias', label: 'Guías', children: destinations },
    { href: '/sobre-mi/', label: 'Sobre mí', children: [] },
    { href: '/buscar/', label: 'Buscar', children: [] },
  ])
})

test('inlineFits counts every label, destinations included, against the one-row budget', () => {
  const nav = [{ href: '/#guias', label: 'Guías' }, { href: '/sobre-mi/', label: 'Sobre mí' }, { href: '/buscar/', label: 'Buscar' }]
  const named = (labels: string[]) => labels.map((label) => ({ href: `/${label.toLowerCase()}/`, label }))
  assert.strictEqual(inlineFits(siteLinks(nav, named(['Islandia', 'Alsacia']))), true)
  assert.strictEqual(inlineFits(siteLinks(nav, named(['Islandia', 'Alsacia', 'Tailandia', 'Egipto', 'Marruecos']))), false)
})

test('a destination carries the cover of its first guide that has one, as the menu thumbnail', () => {
  const second = { ...islandia, url: '/islandia/islandia-en-7-dias/', coverImage: 'islandia/gljufrafoss.jpg' }
  assert.deepStrictEqual(menuDestinations([islandia, second], { currentPath: '/', pagePaths: NO_PAGES }), [
    { href: islandia.url, label: 'Islandia', image: 'islandia/gljufrafoss.jpg' },
  ])
  assert.deepStrictEqual(menuDestinations([{ ...alsacia, coverImage: null }], { currentPath: '/', pagePaths: NO_PAGES }), [
    { href: alsacia.url, label: 'Alsacia' },
  ])
})

test('headerRowLinks lists the row in order, destinations after "Guías", without the search link (the header has its own button)', () => {
  const nav = [{ href: '/#guias', label: 'Guías' }, { href: '/sobre-mi/', label: 'Sobre mí' }, { href: '/buscar/', label: 'Buscar' }]
  const row = headerRowLinks(siteLinks(nav, [{ href: '/islandia/', label: 'Islandia', image: 'x.jpg' }]))
  assert.deepStrictEqual(row, [
    { href: '/#guias', label: 'Guías' },
    { href: '/islandia/', label: 'Islandia' },
    { href: '/sobre-mi/', label: 'Sobre mí' },
  ])
  assert.deepStrictEqual(headerRowLinks(siteLinks(nav.slice(0, 2), []), '/sobre-mi/'), [{ href: '/#guias', label: 'Guías' }])
})
