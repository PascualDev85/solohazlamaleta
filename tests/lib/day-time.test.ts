import { test } from 'node:test'
import assert from 'node:assert'
import { minutesOnRoute, roundToHour } from '../../src/lib/dayTime.ts'
import type { CompiledDay, CompiledStop } from '../../engine/index.ts'

function stop(duration_min: number, duration_max_min?: number): CompiledStop {
  return { duration_min, duration_max_min } as CompiledStop
}

function day(partial: Partial<CompiledDay>): CompiledDay {
  return { route_stops: [], ...partial } as CompiledDay
}

test('minutesOnRoute adds the driving time to the minimum visit time of every route stop', () => {
  const d = day({
    drive: { km: 275, minutes: 225 },
    route_stops: [stop(120, 180), stop(60), stop(60), stop(180, 240)],
  })
  assert.strictEqual(minutesOnRoute(d), 645)
})

test('minutesOnRoute is undefined without driving data: a day with no drive has no route to measure', () => {
  assert.strictEqual(minutesOnRoute(day({ route_stops: [stop(60)] })), undefined)
})

test('minutesOnRoute only counts route stops, never the skipped ones', () => {
  const d = day({
    drive: { km: 10, minutes: 15 },
    route_stops: [stop(30)],
    skipped_stops: [stop(500)],
  })
  assert.strictEqual(minutesOnRoute(d), 45)
})

test('roundToHour rounds a planning figure to the nearest hour', () => {
  assert.strictEqual(roundToHour(645), 660)
  assert.strictEqual(roundToHour(505), 480)
  assert.strictEqual(roundToHour(510), 540)
  assert.strictEqual(roundToHour(600), 600)
  assert.strictEqual(roundToHour(44), 60)
})
