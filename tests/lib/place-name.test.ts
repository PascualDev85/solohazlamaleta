import { test } from 'node:test'
import assert from 'node:assert'
import { shortName } from '../../src/lib/placeName.ts'

test('shortName prefers the short name the author gave the place', () => {
  assert.strictEqual(shortName({ name: 'Camping Skógafoss (junto a la cascada)', short_name: 'Skógafoss' }), 'Skógafoss')
})

test('shortName falls back to the full name when there is no short one', () => {
  assert.strictEqual(shortName({ name: 'Seljalandsfoss' }), 'Seljalandsfoss')
})
