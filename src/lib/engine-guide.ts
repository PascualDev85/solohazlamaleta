import {
  loadGuide, loadPlaces, buildPlaceRegistry, validateGuide, compileGuide,
} from '../../engine/index.ts'
import type { CompiledGuide, AffiliateRegistry } from '../../engine/index.ts'

/**
 * Temporary: data/affiliates.yaml does not exist yet (1.7.1 §5, deferred to
 * before Fase 4). This registry's get() always returns undefined, which
 * means any affiliate_id referenced anywhere in a guide fails validation
 * ([ERROR] affiliate_id inexistente) instead of resolving silently as
 * undefined in the CompiledGuide. That is deliberate fail-safe behavior,
 * not a gap: if a guide is ever edited to reference an affiliate before the
 * real registry exists, the build must fail, and it does.
 */
function emptyAffiliateRegistry(): AffiliateRegistry {
  return { get: () => undefined }
}

/**
 * The only point of contact between src/ and engine/. Pure orchestration —
 * load, validate, compile — no business logic. Which variant to show, how
 * to filter stops, any calculation: that belongs in the engine, never here.
 */
export async function loadCompiledGuide(guidePath: string, placesPath: string): Promise<CompiledGuide> {
  const rawPlaces = (await loadPlaces(placesPath)) as unknown[]
  const { registry: places, errors: placeErrors } = buildPlaceRegistry(rawPlaces)
  if (placeErrors.length > 0) {
    throw new Error(`Errores en el registro de lugares (${placesPath}):\n${placeErrors.join('\n')}`)
  }

  const rawGuide = await loadGuide(guidePath)
  const affiliates = emptyAffiliateRegistry()
  const result = validateGuide(rawGuide, places, affiliates)

  if (result.errors.length > 0) {
    throw new Error(`La guía "${guidePath}" no pasa la validación:\n${result.errors.join('\n')}`)
  }
  for (const warning of result.warnings) {
    console.warn(`[${guidePath}] ${warning}`)
  }

  return compileGuide(result.guide!, places, affiliates)
}
