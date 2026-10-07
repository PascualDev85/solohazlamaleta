import type { CompiledDay } from '../../engine/index.ts'

/**
 * How long the day is on the road, door to door: the driving time plus the
 * shortest visit at every stop on the route. A planning figure, shown with
 * "≈"; the lower end of the visit ranges is used so the number is the least
 * the day takes, not the most. Undefined without driving data.
 */
export function minutesOnRoute(day: CompiledDay): number | undefined {
  if (!day.drive) return undefined
  const visits = day.route_stops.reduce((sum, stop) => sum + stop.duration_min, 0)
  return day.drive.minutes + visits
}

/**
 * A door-to-door figure to the nearest half hour: "10 h 45 min" says more
 * than a day of stops and roads can promise, "11 h" is what a traveller
 * plans with.
 */
export function roundToHalfHour(minutes: number): number {
  return Math.round(minutes / 30) * 30
}
