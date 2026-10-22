import { test } from 'node:test'
import assert from 'node:assert'
import { REST, approach, sameTilt, tiltFromPointer } from '../../src/lib/postcard-tilt.ts'

// The hero's postcards turn to face the pointer on desktop. tiltFromPointer
// gives the turn for a pointer position; approach eases towards it frame by frame.

const box = { left: 100, top: 50, width: 400, height: 500 }
const max = { x: 6, y: 10 }

test('a pointer on the centre of the stack leaves it at rest', () => {
  assert.deepStrictEqual(tiltFromPointer(300, 300, box, max), REST)
})

test('right of centre turns the right side away; above tips the top away', () => {
  assert.deepStrictEqual(tiltFromPointer(400, 300, box, max), { x: 0, y: 5 })
  assert.deepStrictEqual(tiltFromPointer(300, 175, box, max), { x: 3, y: 0 })
  assert.deepStrictEqual(tiltFromPointer(200, 425, box, max), { x: -3, y: -5 })
})

test('at the edge and past it, the turn is the full maximum, never more', () => {
  assert.deepStrictEqual(tiltFromPointer(500, 50, box, max), { x: 6, y: 10 })
  // Over the title, far to the left of the stack.
  assert.deepStrictEqual(tiltFromPointer(-800, 2000, box, max), { x: -6, y: -10 })
})

test('an empty box (not laid out yet) gives rest', () => {
  assert.deepStrictEqual(tiltFromPointer(10, 10, { left: 0, top: 0, width: 0, height: 0 }, max), REST)
})

test('approach covers a fraction of the gap each frame', () => {
  assert.deepStrictEqual(approach({ x: 0, y: 0 }, { x: 4, y: -8 }, 0.25), { x: 1, y: -2 })
  assert.deepStrictEqual(approach({ x: 1, y: -2 }, { x: 4, y: -8 }, 0.5), { x: 2.5, y: -5 })
})

test('approach snaps once within epsilon, so the loop can stop', () => {
  const next = approach({ x: 3.995, y: 0.004 }, { x: 4, y: 0 }, 0.2)
  assert.deepStrictEqual(next, { x: 4, y: 0 })
  assert.ok(sameTilt(next, { x: 4, y: 0 }))
})

test('approach reaches the target in a bounded number of frames', () => {
  let tilt = { x: 6, y: 10 }
  let frames = 0
  while (!sameTilt(tilt, REST) && frames < 200) {
    tilt = approach(tilt, REST, 0.2)
    frames++
  }
  assert.ok(sameTilt(tilt, REST))
  assert.ok(frames < 60, `took ${frames} frames`)
})

test('approach clamps the factor: never past the target, never backwards', () => {
  assert.deepStrictEqual(approach({ x: 0, y: 0 }, { x: 2, y: 2 }, 3), { x: 2, y: 2 })
  assert.deepStrictEqual(approach({ x: 1, y: 1 }, { x: 2, y: 2 }, -1), { x: 1, y: 1 })
})
