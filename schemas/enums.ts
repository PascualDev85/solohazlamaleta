import { z } from 'zod'

export const PlaceType = z.enum([
  'monument', 'museum', 'park', 'food',
  'transport', 'accommodation', 'activity',
  'viewpoint', 'area', 'other',
])

export const ContentType = z.enum(['experience', 'editorial'])
export const GuideStatus = z.enum(['draft', 'reviewed', 'published', 'archived'])
export const GuideType = z.enum(['itinerary', 'satellite', 'hub'])
export const VisitStatus = z.enum(['visited', 'not_visited', 'unknown'])
export const PlanningStatus = z.enum(['required', 'optional'])
export const Pace = z.enum(['intensivo', 'equilibrado', 'tranquilo'])
export const BudgetLevel = z.enum(['ajustado', 'medio', 'comodo'])
export const BudgetBasis = z.enum(['per_person', 'per_room', 'per_group'])
export const BudgetItemType = z.enum(['real', 'estimado'])
export const TravelMode = z.enum(['a pie', 'metro', 'bus', 'taxi', 'tren', 'coche', 'barco'])
export const NoteTarget = z.enum(['email', 'pdf', 'both'])
export const Hills = z.enum(['none', 'some', 'many'])

export const AffiliateCategory = z.enum([
  'tour', 'accommodation', 'transport',
  'insurance', 'rental', 'ticket', 'other',
])

export const BudgetCategory = z.enum([
  'vuelos', 'alojamiento', 'transporte', 'entradas',
  'comidas', 'seguro', 'otro',
])
