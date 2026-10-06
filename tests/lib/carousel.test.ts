import { test } from 'node:test'
import assert from 'node:assert'
import { closestIndex, clampIndex } from '../../src/lib/carousel.ts'

test('closestIndex returns the slide whose start is nearest the scroll position', () => {
  const starts = [0, 350, 700, 1050]
  assert.strictEqual(closestIndex(starts, 0), 0)
  assert.strictEqual(closestIndex(starts, 160), 0)
  assert.strictEqual(closestIndex(starts, 190), 1)
  assert.strictEqual(closestIndex(starts, 1200), 3)
})

test('closestIndex keeps the first of two equally close slides', () => {
  assert.strictEqual(closestIndex([0, 100], 50), 0)
})

test('clampIndex keeps an index inside the list', () => {
  assert.strictEqual(clampIndex(-1, 13), 0)
  assert.strictEqual(clampIndex(5, 13), 5)
  assert.strictEqual(clampIndex(13, 13), 12)
})
