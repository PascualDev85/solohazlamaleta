import type { BudgetItemSource } from '../../schemas/index.ts'
import { applyBasis } from '../../engine/index.ts'

export interface BudgetRow {
  label: string
  /** What the whole group paid. */
  total: number
  /** The group total split by the reference travellers (1.10 §3.5): never typed by hand. */
  per_person: number
  /** This row's part of the sum of all rows, 0 to 1: the width of its bar. */
  share: number
  notes?: string
}

/** One table row per budget item: concept, group total, the derived per-person figure and its share of the whole. */
export function budgetRows(items: BudgetItemSource[], travelers: number): BudgetRow[] {
  const totals = items.map((item) => applyBasis(item, travelers))
  const sum = totals.reduce((acc, total) => acc + total, 0)
  return items.map((item, i) => {
    const total = totals[i]
    return { label: item.label, total, per_person: total / travelers, share: sum > 0 ? total / sum : 0, notes: item.notes }
  })
}
