/**
 * Where an element sits on screen, as getBoundingClientRect gives it, with the
 * scroll offsets of the page and of each box around it (the route rail, a
 * day sheet), always listed in the same order.
 */
export interface ScreenPoint {
  top: number
  left: number
  offsets: number[]
}

const moved = (a: number, b: number) => Math.abs(a - b) >= 1

/**
 * Whether a scroll should close an open time bubble: only when it moved the
 * bubble's mark (the info icon) on screen, from `atOpen` to `now`, and a
 * scroller really moved. Scroll events arrive a frame late, so the one set
 * off by the Tab that focused the mark lands after Enter has opened the
 * bubble (2026-10-20); the mark has not moved since, so it is ignored. In
 * that same frame the day card's scroll-driven 3D turn may still be settling
 * and glide the mark a few pixels with no offset changing (2026-10-21): not a
 * scroll either. The day strip gliding on its own does not move it. A page
 * scroll or a swipe of the rail does. Sub-pixel drift from rounding is not a
 * move. Pure: no DOM, so it is unit-tested.
 */
export function closesHintOnScroll(atOpen: ScreenPoint, now: ScreenPoint): boolean {
  const markMoved = moved(now.top, atOpen.top) || moved(now.left, atOpen.left)
  const scrolled = now.offsets.some((offset, i) => moved(offset, atOpen.offsets[i] ?? offset))
  return markMoved && scrolled
}
