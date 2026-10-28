export interface DockState {
  /** Last scroll position that counted as a move. */
  anchor: number
  visible: boolean
}

export interface DockOptions {
  /** Within this many px of the top, the pill is always hidden. */
  topZone?: number
  /** Moves smaller than this (px) are ignored, so jitter never flips it. */
  minDelta?: number
}

/**
 * Whether the floating "En esta guía" pill shows after the page scrolls to `y`.
 * Hidden at the very top and while scrolling down (the reader is reading);
 * shown while scrolling up (the reader is looking for something), all the way
 * up to the top. Pure: no DOM, so it is unit-tested and reusable.
 */
export function nextDock(state: DockState, y: number, options: DockOptions = {}): DockState {
  const { topZone = 64, minDelta = 8 } = options

  if (y <= topZone) return { anchor: y, visible: false }

  const delta = y - state.anchor
  if (Math.abs(delta) < minDelta) return state

  return { anchor: y, visible: delta < 0 }
}
