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
  }).strict().optional(),
}).strict()

const BookingSchema = z.object({
  affiliate_id: z.string(),
  advance_notice: z.string().optional(),
}).strict()

export const StopSourceSchema = z.object({
  place_id: z.string(),
  order: z.number().int().positive(),
  duration_min: z.number().int().positive(),
  // Upper end of a visit-time range ("2–3 h"); duration_min is the lower end.
  duration_max_min: z.number().int().positive().optional(),
  // What the upper end of the range includes ("con la ruta hasta la base"):
  // a small hike mark next to the time, never a sentence on the card.
  duration_note: z.string().optional(),
  planning_status: PlanningStatus,
  visit_status: VisitStatus.optional().default('unknown'),
  start_time: z.string().optional(),
  travel_to_next_min: z.number().int().optional(),
  travel_to_next_mode: TravelMode.optional(),
  variant_note: z.string().optional(),
  skip_reason: z.string().optional(),
  experience: ExperienceSchema.optional(),
  booking: BookingSchema.optional(),
}).strict().refine(
  (stop) => stop.duration_max_min == null || stop.duration_max_min > stop.duration_min,
  { message: 'duration_max_min debe ser mayor que duration_min', path: ['duration_max_min'] },
)

const PhysicalLevelSchema = z.object({
  walking_km: z.number().optional(),
  hills: Hills.optional(),
}).strict()

const FoodItemSchema = z.object({
  name: z.string(),
  area: z.string().optional(),
  price_level: z.string().optional(),
  notes: z.string().optional(),
  verified_at: z.string().optional(),
}).strict()

const DayPhotoSchema = z.object({
  src: z.string(),
  alt: z.string().trim().min(1),
  caption: z.string().optional(),
}).strict()

const DriveSchema = z.object({
  km: z.number().positive(),
  minutes: z.number().int().positive(),
}).strict()

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
  photo: DayPhotoSchema.optional(),
  highlight: z.string().optional(),
  drive: DriveSchema.optional(),
  // place_id of the campsite (type: accommodation) where the night was spent.
  // null: the night was spent outside any campsite. Absent: no night (last
  // day) or not filled in yet.
  overnight: z.string().nullable().optional(),
  // What the author says about that night. Shown in the day panel whenever it
  // has text, with or without a campsite. Never on the card.
  overnight_note: z.string().optional(),
}).strict()

const BudgetItemSourceSchema = z.object({
  category: BudgetCategory,
  label: z.string(),
  amount: z.number(),
  basis: BudgetBasis,
  travelers_per_room: z.number().int().positive().optional(),
  type: BudgetItemType,
  verified_at: z.string(),
  notes: z.string().optional(),
}).strict()

const BudgetDeltaSchema = z.object({
  items: z.array(BudgetItemSourceSchema),
}).strict()

export const VariantSourceSchema = z.object({
  id: Pace,
  name: z.string(),
  description: z.string(),
  days: z.array(DaySourceSchema),
  budget_delta: BudgetDeltaSchema.optional(),
  pace_notes: z.string().optional(),
}).strict()

export const BudgetSourceSchema = z.object({
  currency: z.string(),
  includes: z.array(z.string()),
  excludes: z.array(z.string()),
  items: z.array(BudgetItemSourceSchema),
  notes: z.string().optional(),
}).strict()

// What we paid for the night, with the date: it is our experience, not the
// place's price (that is entry.price on the place; I16 applies).
const PricePaidSchema = z.object({
  amount: z.number().min(0),
  currency: z.string(),
  verified_at: z.string(),
  notes: z.string().optional(),
}).strict()

// A campsite we slept at: the place holds the facts (coordinates, facilities,
// current price), the pick holds only what is ours.
const AccommodationPickSchema = z.object({
  place_id: z.string(),
  price_paid: PricePaidSchema.optional(),
  // One line of opinion, first person.
  opinion: z.string().optional(),
  notes: z.string().optional(),
  affiliate_id: z.string().optional(),
}).strict()

const AccommodationZoneSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  best_for: z.array(z.string()).optional(),
  picks: z.array(AccommodationPickSchema).optional(),
}).strict()

const AccommodationSourceSchema = z.object({
  notes: z.string().optional(),
  zones: z.array(AccommodationZoneSchema),
}).strict()

const TransportArrivalSchema = z.object({
  from_airport: z.string(),
  description: z.string(),
  notes: z.string().optional(),
  verified_at: z.string().optional(),
}).strict()

const TransportLocalSchema = z.object({
  mode: z.string(),
  description: z.string(),
  notes: z.string().optional(),
  verified_at: z.string().optional(),
}).strict()

const TransportSourceSchema = z.object({
  arrival: z.array(TransportArrivalSchema).optional(),
  local: z.array(TransportLocalSchema).optional(),
  passes: z.array(z.string()).optional(),
}).strict()

const ChecklistItemSourceSchema = z.object({
  label: z.string(),
  when: z.string(),
  priority: z.string().optional(),
  affiliate_id: z.string().optional(),
  notes: z.string().optional(),
  group_note: z.string().optional(),
}).strict()

const PracticalSourceSchema = z.object({
  insurance_affiliate_id: z.string().optional(),
  documents: z.array(z.string()).optional(),
  plugs: z.string().optional(),
  apps: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional(),
}).strict()

const FaqItemSchema = z.object({
  q: z.string(),
  a: z.string(),
  schema: z.boolean().optional(),
}).strict()

const AdaptationNoteConditionsSchema = z.object({
  priorities: z.array(z.string()).optional(),
  group_type: z.array(z.string()).optional(),
  budget: z.array(BudgetLevel).optional(),
  pace: z.array(Pace).optional(),
  trip_days: z.array(z.number()).optional(),
}).strict()

export const AdaptationNoteSourceSchema = z.object({
  id: z.string(),
  conditions: AdaptationNoteConditionsSchema,
  text: z.string(),
  target: NoteTarget,
  priority: z.number().optional(),
}).strict()

// A route decision and its reason, shown as a pair: never a loose sentence.
const RouteDecisionSchema = z.object({
  decision: z.string(),
  reason: z.string(),
}).strict()

const SummarySourceSchema = z.object({
  tagline: z.string(),
  best_season: z.string().optional(),
  getting_around: z.string().optional(),
  base_area: z.string().optional(),
  pace_default: Pace.optional(),
}).strict()

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
  // "Nuestro criterio" (1.12 §13): how we choose, and what we left out and why.
  how_we_choose: z.array(z.string()).optional(),
  route_decisions: z.array(RouteDecisionSchema).optional(),
  pitfalls: z.array(z.string()).optional(),
  terrain_tips: z.array(z.string()).optional(),
  practical: PracticalSourceSchema.optional(),
  adaptation_notes: z.array(AdaptationNoteSourceSchema).optional(),
  faq: z.array(FaqItemSchema).optional(),
  related: z.array(z.string()).optional(),
}).strict()

export type GuideSource = z.infer<typeof GuideSourceSchema>
export type VariantSource = z.infer<typeof VariantSourceSchema>
export type DaySource = z.infer<typeof DaySourceSchema>
export type StopSource = z.infer<typeof StopSourceSchema>
export type BudgetSource = z.infer<typeof BudgetSourceSchema>
export type BudgetItemSource = z.infer<typeof BudgetItemSourceSchema>
export type AdaptationNoteSource = z.infer<typeof AdaptationNoteSourceSchema>
export type FaqItem = z.infer<typeof FaqItemSchema>
export type RouteDecision = z.infer<typeof RouteDecisionSchema>
export type AccommodationPickSource = z.infer<typeof AccommodationPickSchema>
export type AccommodationSource = z.infer<typeof AccommodationSourceSchema>
