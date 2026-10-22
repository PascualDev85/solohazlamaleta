import { test } from 'node:test'
import assert from 'node:assert'
import { HUB_PRACTICAL_ID, campsiteAnchorId, dayAnchorId, hubSectionHref } from '../../src/lib/anchors.ts'

test('dayAnchorId is the id of the day card heading that the day strip, the index and the glance link to', () => {
  assert.strictEqual(dayAnchorId(3), 'dia-3')
  assert.strictEqual(dayAnchorId(12), 'dia-12')
})

test('campsiteAnchorId is the id of the campsite card that "Noche → …" links to', () => {
  assert.strictEqual(campsiteAnchorId('camping-skogafoss'), 'dormir-camping-skogafoss')
})

test('hubSectionHref links a guide to a section of its hub, from the guide\'s hub path', () => {
  assert.strictEqual(hubSectionHref('/islandia/', HUB_PRACTICAL_ID), '/islandia/#practico')
})

test('hubSectionHref keeps the trailing slash even if the hub path lacks it', () => {
  assert.strictEqual(hubSectionHref('/islandia', HUB_PRACTICAL_ID), '/islandia/#practico')
})
