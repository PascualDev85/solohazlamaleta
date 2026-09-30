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
})

export const HoursSchema = z.object({
  open: z.string().optional(),
  close: z.string().optional(),
  days_closed: z.array(z.string()).optional(),
  notes: z.string().optional(),
  verified_at: z.string(),
})

export const PlaceSourceSchema = z.object({
  place_id: z.string(),
  name: z.string(),
  destination: z.string(),
  lat: z.number(),
  lng: z.number(),
  type: PlaceType,
  verified_at: z.string(),
  review_interval: z.number().optional().default(12),
  source_url: z.string().url().optional(),
  entry: EntrySchema.optional(),
  hours: HoursSchema.optional(),
  notes: z.string().optional(),
})

export type PlaceSource = z.infer<typeof PlaceSourceSchema>
export type Entry = z.infer<typeof EntrySchema>
export type Hours = z.infer<typeof HoursSchema>
