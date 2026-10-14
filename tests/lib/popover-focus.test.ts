import { test } from 'node:test'
import assert from 'node:assert'
import { cycleIndex } from '../../src/lib/popover-focus.ts'

test('cycleIndex moves forward and wraps from the last control to the first', () => {
  assert.strictEqual(cycleIndex(0, 3, false), 1)
  assert.strictEqual(cycleIndex(2, 3, false), 0)
})

test('cycleIndex moves back and wraps from the first control to the last', () => {
  assert.strictEqual(cycleIndex(1, 3, true), 0)
  assert.strictEqual(cycleIndex(0, 3, true), 2)
})

test('cycleIndex enters the panel at its first control, or its last going back', () => {
  assert.strictEqual(cycleIndex(-1, 3, false), 0)
  assert.strictEqual(cycleIndex(-1, 3, true), 2)
})

test('cycleIndex has nowhere to go in an empty panel', () => {
  assert.strictEqual(cycleIndex(-1, 0, false), -1)
})
