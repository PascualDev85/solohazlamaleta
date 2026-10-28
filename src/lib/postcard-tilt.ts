/** A turn of the hero's postcard stack, in degrees: around the X axis (nod) and the Y axis (shake). */
export interface Tilt {
  x: number
  y: number
}

export interface Box {
  left: number
  top: number
  width: number
  height: number
}

export const REST: Tilt = { x: 0, y: 0 }

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

/**
 * The turn that makes the stack face a pointer at (px, py). The stack's
 * centre is the rest point; at its edge, and anywhere past it, the turn is
 * the full `max`. Pointer to the right turns the right side away (positive Y),
 * pointer above tips the top away (positive X). Pure: no DOM, so it is
 * unit-tested; the hero's script only feeds it pointer events.
 */
export function tiltFromPointer(px: number, py: number, box: Box, max: Tilt): Tilt {
  if (box.width <= 0 || box.height <= 0) return REST
  const nx = clamp((px - (box.left + box.width / 2)) / (box.width / 2), -1, 1)
  const ny = clamp((py - (box.top + box.height / 2)) / (box.height / 2), -1, 1)
  // + 0 turns -0 into 0, so a centred pointer reads as rest.
  return { x: -ny * max.x + 0, y: nx * max.y + 0 }
}

/**
 * One frame of easing from `current` towards `target`: a fraction of the gap
 * each frame, so the stack follows the pointer softly and settles without
 * overshoot. Within `epsilon` degrees it snaps, so the loop can stop.
 */
export function approach(current: Tilt, target: Tilt, factor: number, epsilon = 0.01): Tilt {
  const step = (from: number, to: number) => {
    const next = from + (to - from) * clamp(factor, 0, 1)
    return Math.abs(to - next) < epsilon ? to : next
  }
  return { x: step(current.x, target.x), y: step(current.y, target.y) }
}

export function sameTilt(a: Tilt, b: Tilt): boolean {
  return a.x === b.x && a.y === b.y
}
