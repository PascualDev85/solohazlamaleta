import type { PlaceSource } from '../../schemas/index.ts'
import type { CompiledPlace, CompiledAffiliate, AffiliateRegistryEntry } from '../types.ts'

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30

function monthsSince(dateStr: string, now: Date): number {
  const then = new Date(dateStr)
  return (now.getTime() - then.getTime()) / MS_PER_MONTH
}

export function resolvePlace(place: PlaceSource, now: Date = new Date()): CompiledPlace {
  const reviewInterval = place.review_interval ?? 12
  const staleFields: string[] = []

  if (monthsSince(place.verified_at, now) > reviewInterval) {
    staleFields.push('verified_at')
  }
  if (place.entry && monthsSince(place.entry.verified_at, now) > reviewInterval) {
    staleFields.push('entry.price')
  }
  if (place.hours && monthsSince(place.hours.verified_at, now) > reviewInterval) {
    staleFields.push('hours')
  }

  return {
    ...place,
    is_stale: staleFields.length > 0,
    stale_fields: staleFields,
  }
}

export function resolveAffiliate(affiliate: AffiliateRegistryEntry): CompiledAffiliate {
  return {
    id: affiliate.id,
    partner: affiliate.partner,
    category: affiliate.category,
    destination: affiliate.destination,
    redirect_url: `/ir/${affiliate.id}`,
    description: affiliate.description,
    active: affiliate.active,
    verified_at: affiliate.verified_at,
  }
}
