import { test } from 'node:test'
import assert from 'node:assert'
import { closesHintOnScroll } from '../../src/lib/hint-scroll.ts'

// closesHintOnScroll decides whether a scroll event should close an open time
// bubble, from where its mark (the info icon) was on screen when the bubble
// opened and where it is now. Scroll events are delivered a frame late, so the
// one set off by the Tab that focused the mark lands after Enter has opened
// the bubble (found 2026-10-20): the mark has not moved since, so that scroll
// must not close it. The day strip gliding on its own does not move it
// either. A page scroll or a swipe of the rail does, and closes it.

test('a scroll that moved the mark closes the bubble', () => {
  assert.strictEqual(closesHintOnScroll({ top: 400, left: 24 }, { top: 300, left: 24 }), true)
  assert.strictEqual(closesHintOnScroll({ top: 400, left: 24 }, { top: 400, left: -200 }), true)
})

test('a scroll that left the mark where it was does not', () => {
  assert.strictEqual(closesHintOnScroll({ top: 400, left: 24 }, { top: 400, left: 24 }), false)
})

test('sub-pixel drift does not count as a move', () => {
  assert.strictEqual(closesHintOnScroll({ top: 400, left: 24 }, { top: 400.4, left: 23.6 }), false)
})
