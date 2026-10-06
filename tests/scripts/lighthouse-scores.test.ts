import { test } from 'node:test'
import assert from 'node:assert'
import { median, findFailures } from '../../scripts/lighthouse-scores.ts'

test('median of an odd and an even list of runs', () => {
  assert.strictEqual(median([99, 100, 100]), 100)
  assert.strictEqual(median([98, 100, 99]), 99)
  assert.strictEqual(median([99, 100]), 99.5)
})

test('findFailures returns nothing when every median reaches the threshold', () => {
  const results = [{ page: '/', device: 'mobile', runs: { performance: [100, 99, 100], seo: [100, 100, 100] } }]
  assert.deepStrictEqual(findFailures(results, 100), [])
})

test('findFailures reports each page, device and category below the threshold, with its median', () => {
  const results = [
    { page: '/', device: 'desktop', runs: { performance: [100, 100, 100] } },
    { page: '/guia/', device: 'mobile', runs: { performance: [99, 99, 100], accessibility: [100, 100, 100] } },
  ]
  assert.deepStrictEqual(findFailures(results, 100), ['/guia/ (mobile) performance: 99'])
})
