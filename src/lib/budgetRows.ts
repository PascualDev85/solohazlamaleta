import type { BudgetItemSource } from '../../schemas/index.ts'
import { applyBasis } from '../../engine/index.ts'

export interface BudgetRow {
  label: string
  /** What the whole group paid. */
  total: number
  /** The group total split by the reference travellers (1.10 §3.5): never typed by hand. */
  per_person: number
  notes?: string
}

/** One table row per budget item: concept, group total and the derived per-person figure. */
export function budgetRows(items: BudgetItemSource[], travelers: number): BudgetRow[] {
  return items.map((item) => {
    const total = applyBasis(item, travelers)
    return { label: item.label, total, per_person: total / travelers, notes: item.notes }
  })
}
