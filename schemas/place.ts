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
  // The price covers this many hours ("1.000 ISK / 5 h"); absent for a flat fee.
  period_hours: z.number().positive().optional(),
  verified_at: z.string(),
}).strict()

// The exact Google Maps place card for a stop (e.g. a named car park), when a
// bare coordinate pin is not good enough. Google hosts only.
const GoogleMapsUrl = z.string().url().refine(
  (url) => /^https:\/\/(maps\.google\.com|www\.google\.com\/maps)\b/.test(url),
  { message: 'maps_url debe ser un enlace de Google Maps' },
)

export const PlaceSourceSchema = z.object({
  place_id: z.string(),
  name: z.string(),
  short_name: z.string().optional(),
  destination: z.string(),
  lat: z.number(),
  lng: z.number(),
  maps_url: GoogleMapsUrl.optional(),
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
