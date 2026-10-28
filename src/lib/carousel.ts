/** Index of the slide whose start offset is nearest `position` (ties keep the first). */
export function closestIndex(starts: number[], position: number): number {
  let best = 0
  starts.forEach((start, i) => {
    if (Math.abs(start - position) < Math.abs(starts[best] - position)) best = i
  })
  return best
}

/** Keeps `index` inside a list of `length` items. */
export function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(length - 1, index))
}
