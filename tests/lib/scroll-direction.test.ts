import { test } from 'node:test'
import assert from 'node:assert'
import { nextDock } from '../../src/lib/scroll-direction.ts'

// nextDock decides whether the floating pill shows after a scroll event.
// It keeps an "anchor" (the last scroll position that counted) so tiny moves
// (trackpad jitter) never flip it.

test('hidden at the very top of the page, whatever the direction', () => {
  assert.deepStrictEqual(nextDock({ anchor: 900, visible: true }, 10), { anchor: 10, visible: false })
  assert.deepStrictEqual(nextDock({ anchor: 0, visible: false }, 30), { anchor: 30, visible: false })
})

test('scrolling down hides it', () => {
  assert.deepStrictEqual(nextDock({ anchor: 1000, visible: true }, 1100), { anchor: 1100, visible: false })
})

test('scrolling up shows it, and it stays while scrolling up until the top', () => {
  assert.deepStrictEqual(nextDock({ anchor: 2000, visible: false }, 1900), { anchor: 1900, visible: true })
  assert.deepStrictEqual(nextDock({ anchor: 1900, visible: true }, 200), { anchor: 200, visible: true })
})

test('a tiny move changes nothing, not even the anchor', () => {
  assert.deepStrictEqual(nextDock({ anchor: 1000, visible: true }, 1004), { anchor: 1000, visible: true })
  assert.deepStrictEqual(nextDock({ anchor: 1000, visible: false }, 996), { anchor: 1000, visible: false })
})

test('the top zone and the minimum move can be tuned', () => {
  assert.deepStrictEqual(nextDock({ anchor: 500, visible: true }, 150, { topZone: 200 }), { anchor: 150, visible: false })
  assert.deepStrictEqual(nextDock({ anchor: 1000, visible: false }, 980, { minDelta: 30 }), { anchor: 1000, visible: false })
})
