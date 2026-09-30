import type { GuideSource } from '../../schemas/index.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../types.ts'
import { validateGuideSchema } from './schema.ts'
import { validateReferences } from './references.ts'
import { validateContentRules } from './content-rules.ts'

export interface ValidationResult {
  errors: string[]
  warnings: string[]
  guide?: GuideSource
}

export function validateGuide(
  raw: unknown,
  places: PlaceRegistry,
  affiliates: AffiliateRegistry,
  now: Date = new Date(),
): ValidationResult {
  const schemaResult = validateGuideSchema(raw)
  if (!schemaResult.success) {
    return {
      errors: schemaResult.error.issues.map(
        (issue) => `[ERROR] esquema inválido en ${issue.path.join('.')}: ${issue.message}`,
      ),
      warnings: [],
    }
  }

  const guide = schemaResult.data
  const referenceErrors = validateReferences(guide, places, affiliates)
  const contentRules = validateContentRules(guide, places, now)

  return {
    errors: [...referenceErrors, ...contentRules.errors],
    warnings: contentRules.warnings,
    guide,
  }
}
