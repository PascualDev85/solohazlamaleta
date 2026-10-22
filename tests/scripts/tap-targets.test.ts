import { test } from 'node:test'
import assert from 'node:assert'
import { TAP_EXCEPTIONS, TAP_MIN, hitRun, tapCandidateBox, tapTargetIssue } from '../../scripts/ui-shared.ts'

const box = { left: 100, top: 200, right: 136, bottom: 236 }

test('the minimum is 44px, the WCAG 2.5.5 size', () => {
  assert.strictEqual(TAP_MIN, 44)
})

test('every exception says why', () => {
  for (const e of TAP_EXCEPTIONS) assert.ok(e.why.trim().length > 0, String(e.label))
})

test('tapCandidateBox: without layers, the element itself plus the slack', () => {
  assert.deepStrictEqual(tapCandidateBox({ box, padding: box, layers: [] }, 0), box)
  assert.deepStrictEqual(tapCandidateBox({ box, padding: box, layers: [] }), { left: 96, top: 196, right: 140, bottom: 240 })
})

test('tapCandidateBox: a layer with negative insets grows the box from the padding box', () => {
  // A 36px coin with a 1px border and -6px insets: the padding box is 34px.
  const padding = { left: 101, top: 201, right: 135, bottom: 235 }
  const layers = [{ top: -6, right: -6, bottom: -6, left: -6 }]
  assert.deepStrictEqual(tapCandidateBox({ box, padding, layers }, 0), { left: 95, top: 195, right: 141, bottom: 241 })
})

test('tapCandidateBox: a layer inside the element never shrinks it', () => {
  const layers = [{ top: 5, right: 5, bottom: 5, left: 5 }]
  assert.deepStrictEqual(tapCandidateBox({ box, padding: box, layers }, 0), box)
})

test('tapCandidateBox: only the axis a layer grows on changes', () => {
  // inset: -14px 0, the "Mapa" link's 44px-tall layer before 2026-10-21.
  const layers = [{ top: -14, right: 0, bottom: -14, left: 0 }]
  assert.deepStrictEqual(tapCandidateBox({ box, padding: box, layers }, 0), { left: 100, top: 186, right: 136, bottom: 250 })
})

test('tapCandidateBox: several layers take the widest reach on each side', () => {
  const layers = [
    { top: -10, right: 0, bottom: 0, left: -2 },
    { top: 0, right: -8, bottom: -4, left: 0 },
  ]
  assert.deepStrictEqual(tapCandidateBox({ box, padding: box, layers }, 0), { left: 98, top: 190, right: 144, bottom: 240 })
})

test('hitRun: the unbroken run around the starting sample', () => {
  const hits = [false, true, true, true, false, true]
  assert.strictEqual(hitRun(hits, 2), 3)
  assert.strictEqual(hitRun(hits, 1), 3)
  assert.strictEqual(hitRun(hits, 5), 1)
})

test('hitRun: a miss at the start counts nothing (something covers the centre)', () => {
  assert.strictEqual(hitRun([true, false, true], 1), 0)
})

test('hitRun: runs to both ends', () => {
  assert.strictEqual(hitRun(Array(46).fill(true), 23), 46)
  assert.strictEqual(hitRun([true], 0), 1)
})

test('hitRun: a neighbour covering the edge cuts the run', () => {
  // A 46px area whose last 3px are under the next coin's layer.
  const hits = [...Array(43).fill(true), false, false, false]
  assert.strictEqual(hitRun(hits, 23), 43)
})

test('tapTargetIssue: 44×44 passes, one px less on either side does not', () => {
  const t = { label: 'a.x', inText: false }
  assert.strictEqual(tapTargetIssue({ ...t, width: 44, height: 44 }), null)
  assert.strictEqual(tapTargetIssue({ ...t, width: 300, height: 46 }), null)
  assert.strictEqual(tapTargetIssue({ ...t, width: 43, height: 46 }), 'a.x: 43×46px tap area (< 44×44)')
  assert.strictEqual(tapTargetIssue({ ...t, width: 300, height: 43 }), 'a.x: 300×43px tap area (< 44×44)')
})

test('tapTargetIssue: rounds the size it reports', () => {
  assert.strictEqual(tapTargetIssue({ label: 'a.x', inText: false, width: 36.4, height: 35.6 }), 'a.x: 36×36px tap area (< 44×44)')
})

test('tapTargetIssue: a link in running text is exempt (WCAG 2.5.5 inline)', () => {
  assert.strictEqual(tapTargetIssue({ label: '.prose a', inText: true, width: 40, height: 20 }), null)
})

test('tapTargetIssue: an exception matches by label, and only that label', () => {
  const exceptions = [{ label: /^a\.tiny$/, why: 'test' }]
  assert.strictEqual(tapTargetIssue({ label: 'a.tiny', inText: false, width: 10, height: 10 }, TAP_MIN, exceptions), null)
  assert.notStrictEqual(tapTargetIssue({ label: 'a.tiny-other', inText: false, width: 10, height: 10 }, TAP_MIN, exceptions), null)
})

test('tapTargetIssue: the minimum can be set', () => {
  assert.strictEqual(tapTargetIssue({ label: 'a.x', inText: false, width: 24, height: 24 }, 24, []), null)
})
