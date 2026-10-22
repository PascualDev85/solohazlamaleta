import { test } from 'node:test'
import assert from 'node:assert'
import { photoSharpnessIssue } from '../../scripts/ui-shared.ts'

// A photo looks soft when the file the browser picked has fewer pixels than
// the screen shows it at. Screens past 2x gain little a reader can see, so
// the bar stops at 2x; and a file can be no wider than its source, so a photo
// whose largest file is already served is only a warning (a bigger original
// is needed), not a defect of the page.

const photo = { label: 'hero', shownWidth: 300, dpr: 3, fileWidth: 600, sourceWidth: 1600 }

test('a file at least 90 % of the width shown × the pixel ratio (capped at 2x) passes', () => {
  assert.strictEqual(photoSharpnessIssue(photo), null)
  assert.strictEqual(photoSharpnessIssue({ ...photo, fileWidth: 540 }), null)
})

test('a file well below what the screen shows fails, with the numbers', () => {
  assert.match(photoSharpnessIssue({ ...photo, fileWidth: 400 }) ?? '', /hero: 400px file shown at 300px × 2 \(needs 540px\)/)
})

test('on a 1x screen the bar is the shown width', () => {
  assert.strictEqual(photoSharpnessIssue({ ...photo, dpr: 1, fileWidth: 300 }), null)
  assert.ok(photoSharpnessIssue({ ...photo, dpr: 1, fileWidth: 200 }))
})

test('a short file of a big original fails: the page should offer a bigger file', () => {
  assert.ok(!(photoSharpnessIssue({ ...photo, fileWidth: 400 }) ?? '').startsWith('warning'))
})

test('when the original itself is too small and its full width is served, it is only a warning', () => {
  assert.match(photoSharpnessIssue({ ...photo, fileWidth: 400, sourceWidth: 400 }) ?? '', /^warning: .*bigger original/)
})
