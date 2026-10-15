import { test } from 'node:test'
import assert from 'node:assert'
import { splitDetail } from '../../src/lib/splitDetail.ts'

test('splitDetail takes a trailing parenthesis as the detail: "Vedur (tiempo oficial)"', () => {
  assert.deepStrictEqual(splitDetail('Vedur (tiempo oficial)'), { name: 'Vedur', detail: 'tiempo oficial' })
})

test('splitDetail leaves a text without a trailing parenthesis whole, and keeps an inner one', () => {
  assert.deepStrictEqual(splitDetail('Maps.me'), { name: 'Maps.me', detail: undefined })
  assert.deepStrictEqual(splitDetail('Carnet (B) de conducir'), { name: 'Carnet (B) de conducir', detail: undefined })
})
