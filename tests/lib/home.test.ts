import { test } from 'node:test'
import assert from 'node:assert'
import { destinationCards, homeStats, hubPathsFromPages, postcardPhotos } from '../../src/lib/home.ts'
import type { GuideListItem } from '../../src/lib/guide-list.ts'

// The landing page's blocks built from the guide list: which destinations to
// show and where they lead, and the figures in "Hola, somos…".

const item = (over: Partial<GuideListItem>): GuideListItem => ({
  title: 'Guía',
  description: '',
  destination: 'islandia',
  days: [13],
  url: '/islandia/islandia-en-camper-13-dias/',
  lived: true,
  livedNote: null,
  draft: false,
  updatedAt: '2026-10-01',
  coverImage: null,
  budgetPerPerson: null,
  ...over,
})

test('hubPathsFromPages turns destination index pages into hub paths, leaving the home page out', () => {
  const keys = ['/src/pages/index.astro', '/src/pages/islandia/index.astro', '/src/pages/buscar/index.astro']
  assert.deepStrictEqual([...hubPathsFromPages(keys, ['islandia', 'alsacia'])], ['/islandia/'])
})

test('destinationCards groups guides by destination, with the count and a readable name', () => {
  const cards = destinationCards(
    [item({}), item({ url: '/islandia/otra/', updatedAt: '2026-09-01' }), item({ destination: 'alsacia', url: '/alsacia/ruta/' })],
    new Set(),
  )
  assert.deepStrictEqual(cards.map((c) => [c.name, c.guides]), [['Islandia', 2], ['Alsacia', 1]])
})

test('destinationCards leads to the hub when the destination has one, otherwise to its first guide', () => {
  const guides = [item({}), item({ destination: 'alsacia', url: '/alsacia/ruta/' })]
  const [islandia, alsacia] = destinationCards(guides, new Set(['/islandia/']))
  assert.strictEqual(islandia.url, '/islandia/')
  assert.strictEqual(alsacia.url, '/alsacia/ruta/')
})

test('destinationCards marks a destination as a draft only when all its guides are drafts, and lists it last', () => {
  const cards = destinationCards(
    [item({ destination: 'alsacia', url: '/alsacia/ruta/', draft: true }), item({}), item({ url: '/islandia/b/', draft: true })],
    new Set(),
  )
  assert.deepStrictEqual(cards.map((c) => [c.slug, c.draft]), [['islandia', false], ['alsacia', true]])
})

test('destinationCards takes the cover of the first guide that has one', () => {
  const [card] = destinationCards([item({}), item({ url: '/islandia/b/', coverImage: 'islandia/gullfoss.jpg' })], new Set())
  assert.strictEqual(card.cover, 'islandia/gullfoss.jpg')
})

test('homeStats counts guides, destinations, the longest version of each route and the places with their day', () => {
  const guides = [item({ days: [13] }), item({ destination: 'alsacia', days: [2, 3, 4, 5] })]
  const index = [{ places: [{}, {}, {}] }, { places: [{}, {}] }]
  assert.deepStrictEqual(homeStats(guides, index), { guides: 2, destinations: 2, days: 18, places: 5 })
})

test('postcardPhotos takes the other photos of the cover\'s destination, in a stable order, at most three', () => {
  const paths = [
    'islandia/gullfoss.jpg',
    'islandia/gljufrafoss.jpg',
    'alsacia/colmar.jpg',
    'islandia/reikiavik.jpg',
    'islandia/dias/3/skogafoss.jpg',
    'islandia/akureyri.jpg',
    'islandia/vik.jpg',
  ]
  assert.deepStrictEqual(postcardPhotos('islandia/gljufrafoss.jpg', paths), [
    'islandia/akureyri.jpg',
    'islandia/gullfoss.jpg',
    'islandia/reikiavik.jpg',
  ])
  assert.deepStrictEqual(postcardPhotos('alsacia/colmar.jpg', paths), [])
})
