import { test } from 'node:test'
import assert from 'node:assert'
import { isPublished, guidePath, unpublishedGuidePaths, unpublishedHubPaths, isHubPublished } from '../../engine/index.ts'

const guide = (status: 'draft' | 'reviewed' | 'published' | 'archived', slug = 'ruta') =>
  ({ status, destination: 'islandia', slug })

test('isPublished: only "published" is public', () => {
  assert.strictEqual(isPublished(guide('published')), true)
  assert.strictEqual(isPublished(guide('draft')), false)
  assert.strictEqual(isPublished(guide('reviewed')), false)
  assert.strictEqual(isPublished(guide('archived')), false)
})

test('guidePath: /destination/slug/ with the trailing slash', () => {
  assert.strictEqual(guidePath(guide('published', 'islandia-en-camper-13-dias')), '/islandia/islandia-en-camper-13-dias/')
})

test('unpublishedGuidePaths lists every guide but the published ones, in order', () => {
  assert.deepStrictEqual(
    unpublishedGuidePaths([guide('draft', 'a'), guide('published', 'b'), guide('reviewed', 'c'), guide('archived', 'd')]),
    ['/islandia/a/', '/islandia/c/', '/islandia/d/'],
  )
  assert.deepStrictEqual(unpublishedGuidePaths([guide('published')]), [])
})

// The hub is indexable once any guide under it is published (1.13 §6: noindex
// "mientras la guía sea borrador"): one switch, the guides' own status.
test('unpublishedHubPaths lists a hub while none of its guides is published', () => {
  const draft = { status: 'reviewed' as const, hub: '/islandia/' }
  const published = { status: 'published' as const, hub: '/islandia/' }
  assert.deepStrictEqual(unpublishedHubPaths([draft]), ['/islandia/'])
  assert.deepStrictEqual(unpublishedHubPaths([draft, published]), [])
  assert.deepStrictEqual(unpublishedHubPaths([{ status: 'draft' as const, hub: '/mallorca/' }, published]), ['/mallorca/'])
})

test('isHubPublished follows the same rule for one hub', () => {
  assert.strictEqual(isHubPublished('/islandia/', [{ status: 'reviewed', hub: '/islandia/' }]), false)
  assert.strictEqual(isHubPublished('/islandia/', [{ status: 'published', hub: '/islandia/' }]), true)
  assert.strictEqual(isHubPublished('/islandia/', [{ status: 'published', hub: '/mallorca/' }]), false)
})
