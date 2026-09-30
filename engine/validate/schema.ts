import { GuideSourceSchema, PlaceSourceSchema } from '../../schemas/index.ts'

export function validateGuideSchema(raw: unknown) {
  return GuideSourceSchema.safeParse(raw)
}

export function validatePlaceSchema(raw: unknown) {
  return PlaceSourceSchema.safeParse(raw)
}
