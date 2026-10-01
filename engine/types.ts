import type { PlaceSource, GuideSource, AdaptationNoteSource, FaqItem, BudgetItemSource } from '../schemas/index.ts'

export type { GuideSource, PlaceSource }

export interface PlaceRegistry {
  get(placeId: string): PlaceSource | undefined
}

export interface AffiliateRegistryEntry {
  id: string
  partner: string
  category: string
  destination?: string
  description: string
  active: boolean
  verified_at: string
}

export interface AffiliateRegistry {
  get(affiliateId: string): AffiliateRegistryEntry | undefined
}

export interface CompiledPlace extends PlaceSource {
  is_stale: boolean
  stale_fields: string[]
}

export interface CompiledAffiliate {
  id: string
  partner: string
  category: string
  destination?: string
  redirect_url: string
  description: string
  active: boolean
  verified_at: string
}

export interface CompiledStop {
  place: CompiledPlace
  order: number
  duration_min: number
  planning_status: 'required' | 'optional'
  visit_status: 'visited' | 'not_visited' | 'unknown'
  start_time?: string
  travel_to_next_min?: number
  travel_to_next_mode?: string
  variant_note?: string
  skip_reason?: string
  experience?: {
    visited_at: string
    actual_price_paid?: { amount: number; currency: string; notes?: string }
  }
  booking?: {
    affiliate: CompiledAffiliate
    advance_notice?: string
  }
}

export interface CompiledDay {
  day: number
  title: string
  summary?: string
  physical_level?: { walking_km?: number; hills?: 'none' | 'some' | 'many' }
  stops: CompiledStop[]
  n_stops: number
  food?: object[]
  our_take?: string
  plan_b?: string
  seniors_note?: string
}

export interface CompiledVariant {
  id: 'intensivo' | 'equilibrado' | 'tranquilo'
  name: string
  description: string
  days: CompiledDay[]
  n_stops_total: number
  all_places: CompiledPlace[]
  budget_delta?: {
    items: BudgetItemSource[]
    total: number
  }
  pace_notes?: string
}

export interface CompiledBudget {
  currency: string
  includes: string[]
  excludes: string[]
  items: BudgetItemSource[]
  notes?: string
  type: 'real' | 'estimado' | 'mixed'
  verified_at: string
  total_base: number
  total_reference: number
}

export interface CompiledSummary {
  tagline: string
  best_season?: string
  getting_around?: string
  base_area?: string
  pace_default?: 'intensivo' | 'equilibrado' | 'tranquilo'
  budget_per_person?: number
}

// TODO: expand in sprint de alojamiento — resolve affiliate_id when data/affiliates.yaml exists
export type CompiledAccommodation = GuideSource['accommodation']

// TODO: expand in sprint de transporte
export type CompiledTransport = GuideSource['transport']

// TODO: expand in sprint de checklist — resolve affiliate_id when data/affiliates.yaml exists
export type CompiledChecklistItem = NonNullable<GuideSource['booking_checklist']>[number]

// TODO: expand in sprint de contenido práctico — resolve insurance_affiliate_id when data/affiliates.yaml exists
export type CompiledPractical = GuideSource['practical']

export interface CompiledGuide {
  slug: string
  destination: string
  hub: string
  type: 'itinerary' | 'satellite' | 'hub'
  content_type: 'experience' | 'editorial'
  status: 'draft' | 'reviewed' | 'published' | 'archived'
  trip_done?: string
  title: string
  description: string
  updated_at: string
  cover_image: string
  gallery?: string[]
  days?: number
  base_travelers?: number
  our_criteria?: string[]
  pitfalls?: string[]
  terrain_tips?: string[]
  practical?: CompiledPractical
  adaptation_notes?: AdaptationNoteSource[]
  faq?: FaqItem[]
  related?: string[]

  summary: CompiledSummary
  variants?: CompiledVariant[]
  budget?: CompiledBudget
  accommodation?: CompiledAccommodation
  transport?: CompiledTransport
  booking_checklist?: CompiledChecklistItem[]

  places: CompiledPlace[]
  has_experience: boolean
  compiled_at: string
}
