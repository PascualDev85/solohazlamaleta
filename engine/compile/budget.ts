import type { BudgetItemSource, BudgetSource } from '../../schemas/index.ts'
import type { CompiledBudget } from '../types.ts'

export function applyBasis(item: BudgetItemSource, travelers: number): number {
  switch (item.basis) {
    case 'per_person':
      return item.amount * travelers
    case 'per_room': {
      const perRoom = item.travelers_per_room ?? 1
      return item.amount * Math.ceil(travelers / perRoom)
    }
    case 'per_group':
      return item.amount
  }
}

export function compileBudget(source: BudgetSource, baseTravelers: number): CompiledBudget {
  const uniqueTypes = new Set(source.items.map((item) => item.type))
  const type: CompiledBudget['type'] = uniqueTypes.size === 1 ? source.items[0].type : 'mixed'

  const verifiedAt = [...source.items].map((item) => item.verified_at).sort()[0]

  const totalBase = source.items.reduce((sum, item) => sum + item.amount, 0)
  const totalReference = source.items.reduce(
    (sum, item) => sum + applyBasis(item, baseTravelers),
    0,
  )

  return {
    currency: source.currency,
    includes: source.includes,
    excludes: source.excludes,
    items: source.items,
    notes: source.notes,
    type,
    verified_at: verifiedAt,
    total_base: totalBase,
    total_reference: totalReference,
  }
}
