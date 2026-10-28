import { test } from 'node:test'
import assert from 'node:assert'
import { applyBasis, compileBudget } from '../../engine/compile/budget.ts'
import type { BudgetItemSource, BudgetSource } from '../../schemas/guide.ts'

test('applyBasis: per_person multiplies by traveler count', () => {
  const item: BudgetItemSource = { category: 'vuelos', label: 'x', amount: 100, basis: 'per_person', type: 'real', verified_at: '2024-01-01' }
  assert.strictEqual(applyBasis(item, 2), 200)
})

test('applyBasis: per_group ignores traveler count', () => {
  const item: BudgetItemSource = { category: 'transporte', label: 'x', amount: 100, basis: 'per_group', type: 'real', verified_at: '2024-01-01' }
  assert.strictEqual(applyBasis(item, 5), 100)
})

test('applyBasis: per_room rounds up when travelers do not divide evenly', () => {
  const item: BudgetItemSource = { category: 'alojamiento', label: 'x', amount: 100, basis: 'per_room', travelers_per_room: 2, type: 'real', verified_at: '2024-01-01' }
  assert.strictEqual(applyBasis(item, 3), 200) // ceil(3/2) = 2 rooms
})

test('compileBudget: total_base ignores basis, total_reference applies it', () => {
  const source: BudgetSource = {
    currency: 'EUR',
    includes: [],
    excludes: [],
    items: [
      { category: 'vuelos', label: 'a', amount: 100, basis: 'per_person', type: 'real', verified_at: '2024-01-01' },
      { category: 'transporte', label: 'b', amount: 50, basis: 'per_group', type: 'real', verified_at: '2024-02-01' },
    ],
  }
  const compiled = compileBudget(source, 2)
  assert.strictEqual(compiled.total_base, 150)
  assert.strictEqual(compiled.total_reference, 250) // 100*2 + 50
})

test('compileBudget: type is real when every item is real', () => {
  const source: BudgetSource = {
    currency: 'EUR', includes: [], excludes: [],
    items: [{ category: 'vuelos', label: 'a', amount: 1, basis: 'per_person', type: 'real', verified_at: '2024-01-01' }],
  }
  assert.strictEqual(compileBudget(source, 1).type, 'real')
})

test('compileBudget: type is mixed when items disagree', () => {
  const source: BudgetSource = {
    currency: 'EUR', includes: [], excludes: [],
    items: [
      { category: 'vuelos', label: 'a', amount: 1, basis: 'per_person', type: 'real', verified_at: '2024-01-01' },
      { category: 'entradas', label: 'b', amount: -1, basis: 'per_person', type: 'estimado', verified_at: '2024-02-01' },
    ],
  }
  assert.strictEqual(compileBudget(source, 1).type, 'mixed')
})

test('compileBudget: verified_at is the earliest of all items', () => {
  const source: BudgetSource = {
    currency: 'EUR', includes: [], excludes: [],
    items: [
      { category: 'vuelos', label: 'a', amount: 1, basis: 'per_person', type: 'real', verified_at: '2024-08-20' },
      { category: 'seguro', label: 'b', amount: 1, basis: 'per_person', type: 'real', verified_at: '2024-01-15' },
    ],
  }
  assert.strictEqual(compileBudget(source, 1).verified_at, '2024-01-15')
})
