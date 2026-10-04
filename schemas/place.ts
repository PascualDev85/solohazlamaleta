import { z } from 'zod'
import { PlaceType } from './enums.ts'

export const EntrySchema = z.object({
  price: z.number(),
  currency: z.string(),
  booking_required: z.boolean().optional(),
  advance_notice: z.string().optional(),
  url_booking: z.string().url().optional(),
  verified_at: z.string(),
  notes: z.string().optional(),
}).strict()

export const HoursSchema = z.object({
  open: z.string().optional(),
  close: z.string().optional(),
  days_closed: z.array(z.string()).optional(),
  notes: z.string().optional(),
  verified_at: z.string(),
}).strict()

// Car park price; 0 means free. Sensitive, so it always carries its check date.
export const ParkingSchema = z.object({
  price: z.number().min(0),
  currency: z.string(),
  verified_at: z.string(),
}).strict()

export const PlaceSourceSchema = z.object({
  place_id: z.string(),
  name: z.string(),
  short_name: z.string().optional(),
  destination: z.string(),
  lat: z.number(),
  lng: z.number(),
  type: PlaceType,
  verified_at: z.string(),
  review_interval: z.number().optional().default(12),
  source_url: z.string().url().optional(),
  entry: EntrySchema.optional(),
  hours: HoursSchema.optional(),
  parking: ParkingSchema.optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
}).strict()

export type PlaceSource = z.infer<typeof PlaceSourceSchema>
export type Entry = z.infer<typeof EntrySchema>
export type Hours = z.infer<typeof HoursSchema>
