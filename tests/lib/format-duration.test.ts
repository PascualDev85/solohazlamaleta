import { test } from 'node:test'
import assert from 'node:assert'
import { formatMinutes } from '../../src/lib/formatDuration.ts'

test('formatMinutes writes minutes, whole hours and hours with minutes', () => {
  assert.strictEqual(formatMinutes(45), '45 min')
  assert.strictEqual(formatMinutes(60), '1 h')
  assert.strictEqual(formatMinutes(70), '1 h 10 min')
  assert.strictEqual(formatMinutes(225), '3 h 45 min')
})
