import { test } from 'node:test'
import assert from 'node:assert'
import { closesHintOnScroll } from '../../src/lib/hint-scroll.ts'

// closesHintOnScroll decides whether a scroll event should close an open time
// bubble, from where its mark (the info icon) was on screen when the bubble
// opened and where it is now, with the scroll offsets of the page and of the
// scrollers around the mark (the route rail). Scroll events are delivered a
// frame late, so the one set off by the Tab that focused the mark lands after
// Enter has opened the bubble (found 2026-10-20): the mark has not moved
// since, so that scroll must not close it. The day strip gliding on its own
// does not move it either. A page scroll or a swipe of the rail does, and
// closes it.

const at = (top: number, left: number, offsets = [1200, 1125]) => ({ top, left, offsets })

test('a scroll that moved the mark closes the bubble', () => {
  assert.strictEqual(closesHintOnScroll(at(400, 24), at(300, 24, [1300, 1125])), true)
  assert.strictEqual(closesHintOnScroll(at(400, 24), at(400, -200, [1200, 1349])), true)
})

test('a scroll that left the mark where it was does not', () => {
  assert.strictEqual(closesHintOnScroll(at(400, 24), at(400, 24)), false)
  assert.strictEqual(closesHintOnScroll(at(400, 24), at(400, 24, [1200, 1400])), false)
})

test('sub-pixel drift does not count as a move', () => {
  assert.strictEqual(closesHintOnScroll(at(400, 24), at(400.4, 23.6, [1200.4, 1125])), false)
})

// The day card's 3D turn follows the rail's scroll a frame late: right after
// the Tab that scrolled the rail, the mark still glides into place (15px,
// found 2026-10-21) with no scroll offset changing. That is not a scroll.
test('a mark that moves while no scroller moved (an animation settling) does not close it', () => {
  assert.strictEqual(closesHintOnScroll(at(156.35, 602.21), at(154.25, 617.33)), false)
})
