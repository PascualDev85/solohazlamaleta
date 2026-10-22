/** Minutes in words for planning figures: "45 min", "1 h", "3 h 45 min". */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

/**
 * A visit time, single or a range: "1 h", "2–3 h", "30–45 min",
 * "1 h 30 min – 2 h". When both ends are whole hours (or both under an hour)
 * the unit is written once.
 */
export function formatDuration(minutes: number, maxMinutes?: number): string {
  if (maxMinutes == null) return formatMinutes(minutes)
  if (minutes % 60 === 0 && maxMinutes % 60 === 0) return `${minutes / 60}–${maxMinutes / 60} h`
  if (minutes < 60 && maxMinutes < 60) return `${minutes}–${maxMinutes} min`
  return `${formatMinutes(minutes)} – ${formatMinutes(maxMinutes)}`
}
