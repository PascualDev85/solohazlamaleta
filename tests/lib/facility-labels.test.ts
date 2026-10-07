import { test } from 'node:test'
import assert from 'node:assert'
import { facilityLabels } from '../../src/lib/facilityLabels.ts'

test('facilityLabels names what the campsite has, and says "sin" for what it lacks', () => {
  assert.deepStrictEqual(
    facilityLabels({ showers: 'included', toilets: true, common_room: false, electricity: false, verified_at: '2025-09-15' }),
    ['Duchas incluidas', 'Baños', 'Sin sala común', 'Sin electricidad'],
  )
  assert.deepStrictEqual(
    facilityLabels({ showers: 'paid', toilets: true, verified_at: '2025-09-15' }),
    ['Duchas de pago', 'Baños'],
  )
  assert.deepStrictEqual(facilityLabels({ showers: 'none', verified_at: '2025-09-15' }), ['Sin duchas'])
})

test('facilityLabels leaves out what is unknown: an absent boolean is never "sin"', () => {
  const labels = facilityLabels({ showers: 'included', verified_at: '2025-09-15' })
  assert.deepStrictEqual(labels, ['Duchas incluidas'])
})
