/** Where an element sits on screen, as getBoundingClientRect gives it. */
export interface ScreenPoint {
  top: number
  left: number
}

/**
 * Whether a scroll should close an open time bubble: only when it moved the
 * bubble's mark (the info icon) on screen, from `atOpen` to `now`. Scroll
 * events arrive a frame late, so the one set off by the Tab that focused the
 * mark lands after Enter has opened the bubble (2026-10-20); the mark has not
 * moved since, so it is ignored. The day strip gliding on its own does not
 * move it either. A page scroll or a swipe of the rail does. Sub-pixel
 * drift from rounding is not a move. Pure: no DOM, so it is unit-tested.
 */
export function closesHintOnScroll(atOpen: ScreenPoint, now: ScreenPoint): boolean {
  return Math.abs(now.top - atOpen.top) >= 1 || Math.abs(now.left - atOpen.left) >= 1
}
