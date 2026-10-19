import { test } from 'node:test'
import assert from 'node:assert'
import { isPublished, guidePath, unpublishedGuidePaths } from '../../engine/index.ts'

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
