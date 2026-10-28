import { test } from 'node:test'
import assert from 'node:assert'
import { twoDigitDay } from '../../src/lib/dayNumber.ts'

test('twoDigitDay pads the day to two digits, as the day strip and the glance show it', () => {
  assert.strictEqual(twoDigitDay(3), '03')
  assert.strictEqual(twoDigitDay(13), '13')
})
