import { test } from 'node:test'
import assert from 'node:assert'
import { budgetRows } from '../../src/lib/budgetRows.ts'
import type { BudgetItemSource } from '../../schemas/index.ts'

function item(partial: Partial<BudgetItemSource>): BudgetItemSource {
  return { category: 'otro', label: 'x', amount: 0, basis: 'per_group', type: 'real', verified_at: '2025-09', ...partial }
}

test('budgetRows derives the per-person column: per_group amounts are split, per_person amounts are the person price', () => {
  const rows = budgetRows([
    item({ label: 'Camper', amount: 1000, basis: 'per_group' }),
    item({ label: 'Seguro', amount: 30, basis: 'per_person' }),
  ], 2)
  assert.deepStrictEqual(rows, [
    { label: 'Camper', total: 1000, per_person: 500, notes: undefined },
    { label: 'Seguro', total: 60, per_person: 30, notes: undefined },
  ])
})

test('budgetRows keeps the item notes and never rounds: the table formats, the helper does not', () => {
  const rows = budgetRows([item({ label: 'Vuelos', amount: 571.12, notes: 'n' })], 2)
  assert.strictEqual(rows[0].per_person, 285.56)
  assert.strictEqual(rows[0].notes, 'n')
})
