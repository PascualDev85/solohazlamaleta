import { test } from 'node:test'
import assert from 'node:assert'
import { formatMinutes, formatDuration } from '../../src/lib/formatDuration.ts'

test('formatMinutes writes minutes, whole hours and hours with minutes', () => {
  assert.strictEqual(formatMinutes(45), '45 min')
  assert.strictEqual(formatMinutes(60), '1 h')
  assert.strictEqual(formatMinutes(70), '1 h 10 min')
  assert.strictEqual(formatMinutes(225), '3 h 45 min')
})

test('formatDuration writes a single time or a range, sharing the unit when both ends are whole hours', () => {
  assert.strictEqual(formatDuration(60), '1 h')
  assert.strictEqual(formatDuration(120, 180), '2–3 h')
  assert.strictEqual(formatDuration(180, 240), '3–4 h')
  assert.strictEqual(formatDuration(30, 45), '30–45 min')
  assert.strictEqual(formatDuration(90, 120), '1 h 30 min – 2 h')
})
