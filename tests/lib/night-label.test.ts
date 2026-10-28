import { test } from 'node:test'
import assert from 'node:assert'
import { nightLabel } from '../../src/lib/nightLabel.ts'

test('nightLabel names the campsite of the night by its short name', () => {
  assert.strictEqual(nightLabel({ name: 'Camping Árnes (Þjórsárdalur)', short_name: 'Camping Árnes' }), 'Camping Árnes')
  assert.strictEqual(nightLabel({ name: 'Camping Vík' }), 'Camping Vík')
})

test('nightLabel says so when the night was spent outside any campsite (null)', () => {
  assert.strictEqual(nightLabel(null), 'Fuera de camping')
})

test('nightLabel gives nothing for a day without a night (absent)', () => {
  assert.strictEqual(nightLabel(undefined), undefined)
})
