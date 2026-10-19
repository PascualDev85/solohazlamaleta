import { test } from 'node:test'
import assert from 'node:assert'
import { formatPrice, formatWholePrice } from '../../src/lib/formatPrice.ts'

// Intl puts a no-break space between the figure and the currency.
const nbsp = ' '

test('formatPrice writes Spanish decimals and groups thousands', () => {
  assert.strictEqual(formatPrice(4495.21, 'EUR'), `4.495,21${nbsp}€`)
  assert.strictEqual(formatPrice(5, 'EUR'), `5,00${nbsp}€`)
})

test("formatPrice keeps the currency's own decimals: the króna has none", () => {
  assert.strictEqual(formatPrice(4500, 'ISK'), `4.500${nbsp}ISK`)
})

test('formatWholePrice rounds to whole units and still groups thousands', () => {
  assert.strictEqual(formatWholePrice(2248, 'EUR'), `2.248${nbsp}€`)
  assert.strictEqual(formatWholePrice(899.6, 'EUR'), `900${nbsp}€`)
  assert.strictEqual(formatWholePrice(1500, 'ISK'), `1.500${nbsp}ISK`)
})
