import { test } from 'node:test'
import assert from 'node:assert'
import { formatDate, formatLongDate } from '../../src/lib/formatDate.ts'

test('formatDate gives month and year in Spanish', () => {
  assert.strictEqual(formatDate('2025-09-15'), 'septiembre de 2025')
})

test('formatDate keeps the first of the month in its own month west of UTC', () => {
  // An ISO date parses as UTC midnight: read in local time in America it
  // would still be the last day of the month before.
  const tz = process.env.TZ
  process.env.TZ = 'America/Los_Angeles'
  try {
    assert.strictEqual(formatDate('2026-10-01'), 'octubre de 2026')
  } finally {
    if (tz === undefined) delete process.env.TZ
    else process.env.TZ = tz
  }
})

test('formatLongDate gives the full date in words', () => {
  assert.strictEqual(formatLongDate('2026-10-04'), '4 de octubre de 2026')
  assert.strictEqual(formatLongDate('2026-01-01'), '1 de enero de 2026')
})
