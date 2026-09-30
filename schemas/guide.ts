import { z } from 'zod'
import {
  VisitStatus, PlanningStatus, TravelMode, Hills, Pace, BudgetLevel,
  BudgetBasis, BudgetItemType, BudgetCategory, NoteTarget,
  ContentType, GuideStatus, GuideType,
} from './enums.ts'

const ExperienceSchema = z.object({
  visited_at: z.string(),
  actual_price_paid: z.object({
    amount: z.number(),
    currency: z.string(),
    notes: z.string().optional(),
  }).optional(),
})

const BookingSchema = z.object({
  affiliate_id: z.string(),
  advance_notice: z.string().optional(),
})

export const StopSourceSchema = z.object({
  place_id: z.string(),
  order: z.number().int().positive(),
  duration_min: z.number().int().positive(),
  planning_status: PlanningStatus,
  visit_status: VisitStatus.optional().default('unknown'),
  start_time: z.string().optional(),
  travel_to_next_min: z.number().int().optional(),
  travel_to_next_mode: TravelMode.optional(),
  variant_note: z.string().optional(),
  experience: ExperienceSchema.optional(),
  booking: BookingSchema.optional(),
})

const PhysicalLevelSchema = z.object({
  walking_km: z.number().optional(),
  hills: Hills.optional(),
})

const FoodItemSchema = z.object({
  name: z.string(),
  area: z.string().optional(),
  price_level: z.string().optional(),
  notes: z.string().optional(),
  verified_at: z.string().optional(),
})

export const DaySourceSchema = z.object({
  day: z.number().int().positive(),
  title: z.string(),
  summary: z.string().optional(),
  physical_level: PhysicalLevelSchema.optional(),
  stops: z.array(StopSourceSchema),
  food: z.array(FoodItemSchema).optional(),
  our_take: z.string().optional(),
  plan_b: z.string().optional(),
  seniors_note: z.string().optional(),
})

const BudgetItemSourceSchema = z.object({
  category: BudgetCategory,
  label: z.string(),
  amount: z.number(),
  basis: BudgetBasis,
  travelers_per_room: z.number().int().positive().optional(),
  type: BudgetItemType,
  verified_at: z.string(),
  notes: z.string().optional(),
})

const BudgetDeltaSchema = z.object({
  items: z.array(BudgetItemSourceSchema),
})

export const VariantSourceSchema = z.object({
  id: Pace,
  name: z.string(),
  description: z.string(),
  days: z.array(DaySourceSchema),
  budget_delta: BudgetDeltaSchema.optional(),
  pace_notes: z.string().optional(),
})

export const BudgetSourceSchema = z.object({
  currency: z.string(),
  includes: z.array(z.string()),
  excludes: z.array(z.string()),
  items: z.array(BudgetItemSourceSchema),
  notes: z.string().optional(),
})

const AccommodationPickSchema = z.object({
  name: z.string(),
  price_level: z.string().optional(),
  notes: z.string().optional(),
  verified_at: z.string().optional(),
  affiliate_id: z.string().optional(),
})

const AccommodationZoneSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  best_for: z.array(z.string()).optional(),
  picks: z.array(AccommodationPickSchema).optional(),
})

const AccommodationSourceSchema = z.object({
  notes: z.string().optional(),
  zones: z.array(AccommodationZoneSchema),
})

const TransportArrivalSchema = z.object({
  from_airport: z.string(),
  description: z.string(),
  notes: z.string().optional(),
  verified_at: z.string().optional(),
})

const TransportLocalSchema = z.object({
  mode: z.string(),
  description: z.string(),
  notes: z.string().optional(),
  verified_at: z.string().optional(),
})

const TransportSourceSchema = z.object({
  arrival: z.array(TransportArrivalSchema).optional(),
  local: z.array(TransportLocalSchema).optional(),
  passes: z.array(z.string()).optional(),
})

const ChecklistItemSourceSchema = z.object({
  label: z.string(),
  when: z.string(),
  priority: z.string().optional(),
  affiliate_id: z.string().optional(),
  notes: z.string().optional(),
  group_note: z.string().optional(),
})

const PracticalSourceSchema = z.object({
  insurance_affiliate_id: z.string().optional(),
  documents: z.array(z.string()).optional(),
  plugs: z.string().optional(),
  apps: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
})

const FaqItemSchema = z.object({
  q: z.string(),
  a: z.string(),
  schema: z.boolean().optional(),
})

const AdaptationNoteConditionsSchema = z.object({
  priorities: z.array(z.string()).optional(),
  group_type: z.array(z.string()).optional(),
  budget: z.array(BudgetLevel).optional(),
  pace: z.array(Pace).optional(),
  trip_days: z.array(z.number()).optional(),
})

export const AdaptationNoteSourceSchema = z.object({
  id: z.string(),
  conditions: AdaptationNoteConditionsSchema,
  text: z.string(),
  target: NoteTarget,
  priority: z.number().optional(),
})

const SummarySourceSchema = z.object({
  tagline: z.string(),
  best_season: z.string().optional(),
  getting_around: z.string().optional(),
  base_area: z.string().optional(),
  pace_default: Pace.optional(),
})

export const GuideSourceSchema = z.object({
  slug: z.string(),
  destination: z.string(),
  hub: z.string(),
  type: GuideType,
  content_type: ContentType,
  status: GuideStatus,
  trip_done: z.string().optional(),
  title: z.string(),
  description: z.string().max(155),
  updated_at: z.string(),
  cover_image: z.string(),
  gallery: z.array(z.string()).optional(),
  days: z.number().int().optional(),
  base_travelers: z.number().int().positive().optional(),
  summary: SummarySourceSchema,
  variants: z.array(VariantSourceSchema).optional(),
  budget: BudgetSourceSchema.optional(),
  accommodation: AccommodationSourceSchema.optional(),
  transport: TransportSourceSchema.optional(),
  booking_checklist: z.array(ChecklistItemSourceSchema).optional(),
  our_criteria: z.array(z.string()).optional(),
  pitfalls: z.array(z.string()).optional(),
  terrain_tips: z.array(z.string()).optional(),
  practical: PracticalSourceSchema.optional(),
  adaptation_notes: z.array(AdaptationNoteSourceSchema).optional(),
  faq: z.array(FaqItemSchema).optional(),
  related: z.array(z.string()).optional(),
})

export type GuideSource = z.infer<typeof GuideSourceSchema>
export type VariantSource = z.infer<typeof VariantSourceSchema>
export type DaySource = z.infer<typeof DaySourceSchema>
export type StopSource = z.infer<typeof StopSourceSchema>
export type BudgetSource = z.infer<typeof BudgetSourceSchema>
export type BudgetItemSource = z.infer<typeof BudgetItemSourceSchema>
export type AdaptationNoteSource = z.infer<typeof AdaptationNoteSourceSchema>
export type FaqItem = z.infer<typeof FaqItemSchema>
