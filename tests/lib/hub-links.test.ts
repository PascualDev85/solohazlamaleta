import { test } from 'node:test'
import assert from 'node:assert'
import {
  canLink, guideClosing, hubMembers, hubSections, hubSourcePath, isPagePublished,
} from '../../src/lib/hubLinks.ts'
import type { LinkPage } from '../../src/lib/hubLinks.ts'

const page = (slug: string, type: LinkPage['type'], status: LinkPage['status'] = 'published', hub = '/islandia/'): LinkPage => ({
  slug, destination: 'islandia', hub, type, status, title: `Título de ${slug}`,
})

const hub = page('islandia', 'hub', 'reviewed')
const route = page('islandia-en-camper-13-dias', 'itinerary', 'reviewed')

const hubData = {
  when_to_go: ['Auroras el día 6'],
  practical: { documents: ['DNI'] },
  transport: { local: [{ mode: 'Camper', description: 'Sin 4x4' }] },
  faq: [{ q: '¿4x4?', a: 'No.' }],
}

test('isPagePublished: a guide is public when published; the hub stays noindex for now (1.13 §6)', () => {
  assert.strictEqual(isPagePublished(page('a', 'itinerary', 'published')), true)
  assert.strictEqual(isPagePublished(page('a', 'itinerary', 'reviewed')), false)
  assert.strictEqual(isPagePublished(page('a', 'satellite', 'draft')), false)
  assert.strictEqual(isPagePublished(page('islandia', 'hub', 'published')), false)
})

test('canLink: an unpublished page is never linked from a published one', () => {
  const published = page('a', 'itinerary', 'published')
  const draft = page('b', 'satellite', 'draft')
  assert.strictEqual(canLink(published, draft), false)
  assert.strictEqual(canLink(draft, published), true)
  assert.strictEqual(canLink(draft, page('c', 'itinerary', 'reviewed')), true)
  assert.strictEqual(canLink(published, page('d', 'satellite', 'published')), true)
})

test('hubMembers: the guides and satellites whose `hub` is this hub, in source order', () => {
  const golden = page('circulo-dorado', 'satellite', 'reviewed')
  const other = page('mallorca-en-5-dias', 'itinerary', 'reviewed', '/mallorca/')
  const members = hubMembers(hub, [hub, route, golden, other])
  assert.deepStrictEqual(members.guides.map((g) => g.slug), ['islandia-en-camper-13-dias'])
  assert.deepStrictEqual(members.satellites.map((g) => g.slug), ['circulo-dorado'])
})

test('hubMembers: today, one guide and no satellites', () => {
  const members = hubMembers(hub, [hub, route])
  assert.strictEqual(members.guides.length, 1)
  assert.deepStrictEqual(members.satellites, [])
})

test('hubMembers: a hub path without the trailing slash still matches', () => {
  const members = hubMembers(hub, [page('x', 'itinerary', 'reviewed', '/islandia')])
  assert.deepStrictEqual(members.guides.map((g) => g.slug), ['x'])
})

test('hubMembers: the url of each member is its page, with the trailing slash', () => {
  const [member] = hubMembers(hub, [route]).guides
  assert.strictEqual(member.url, '/islandia/islandia-en-camper-13-dias/')
})

test('hubSections: the hub\'s sections in page order, only those with content', () => {
  const sections = hubSections(hubData, { guides: true, see: true })
  assert.deepStrictEqual(sections.map((s) => s.id), ['nuestra-guia', 'que-ver', 'cuando-ir', 'practico', 'moverse', 'faq'])
  assert.deepStrictEqual(sections.map((s) => s.label), [
    'Nuestra guía', 'Qué ver', 'Cuándo ir', 'Lo práctico', 'Cómo moverse', 'Preguntas sobre Islandia',
  ])
})

test('hubSections: an empty block has no section, so nothing can link to it', () => {
  const sections = hubSections({ when_to_go: [], faq: [] }, { guides: false, see: false })
  assert.deepStrictEqual(sections, [])
})

test('guideClosing: the hub and its destination sections, built from the guide\'s hub path', () => {
  const closing = guideClosing(route, { ...hub, ...hubData }, [hub, route])
  assert.ok(closing)
  assert.strictEqual(closing.hubHref, '/islandia/')
  assert.deepStrictEqual(closing.links, [
    { href: '/islandia/#cuando-ir', label: 'Cuándo ir' },
    { href: '/islandia/#practico', label: 'Lo práctico' },
    { href: '/islandia/#moverse', label: 'Cómo moverse' },
    { href: '/islandia/#faq', label: 'Preguntas sobre Islandia' },
  ])
})

test('guideClosing: satellites of the hub follow the sections, never the guide itself', () => {
  const golden = page('circulo-dorado', 'satellite', 'reviewed')
  const closing = guideClosing(route, { ...hub, ...hubData }, [hub, route, golden])
  assert.deepStrictEqual(closing?.links.at(-1), { href: '/islandia/circulo-dorado/', label: 'Título de circulo-dorado' })
  assert.ok(!closing?.links.some((link) => link.href.startsWith('/islandia/islandia-en-camper-13-dias/')))
})

test('guideClosing: a published guide does not link to an unpublished hub', () => {
  const publishedRoute = page('islandia-en-camper-13-dias', 'itinerary', 'published')
  assert.strictEqual(guideClosing(publishedRoute, { ...hub, ...hubData }, [hub, publishedRoute]), null)
})

test('hubSourcePath: the hub\'s data file, from a guide\'s hub path', () => {
  assert.strictEqual(hubSourcePath('/islandia/'), 'content/guides/islandia/islandia.yaml')
  assert.strictEqual(hubSourcePath('/islandia'), 'content/guides/islandia/islandia.yaml')
})
