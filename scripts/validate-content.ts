import { loadGuide, loadPlaces, validateGuide, compileGuide, validatePlaceSchema } from '../engine/index.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../engine/index.ts'
import type { PlaceSource } from '../schemas/index.ts'

const GUIDE_PATH = 'content/guides/islandia/islandia-en-camper-13-dias.yaml'
const PLACES_PATH = 'content/places/islandia.yaml'

function buildPlaceRegistry(rawPlaces: unknown[]): { registry: PlaceRegistry; errors: string[] } {
  const errors: string[] = []
  const map = new Map<string, PlaceSource>()

  for (const raw of rawPlaces) {
    const result = validatePlaceSchema(raw)
    if (!result.success) {
      errors.push(`[ERROR] esquema de lugar inválido: ${result.error.issues.map((i) => i.message).join(', ')}`)
      continue
    }
    map.set(result.data.place_id, result.data)
  }

  return { registry: { get: (id) => map.get(id) }, errors }
}

function buildEmptyAffiliateRegistry(): AffiliateRegistry {
  return { get: () => undefined }
}

async function main() {
  console.log('Validando contenido...\n')

  const rawPlaces = (await loadPlaces(PLACES_PATH)) as unknown[]
  const rawGuide = await loadGuide(GUIDE_PATH)

  console.log('✔ Guides loaded: 1')
  console.log(`✔ Places loaded: ${rawPlaces.length}`)

  const { registry: places, errors: placeErrors } = buildPlaceRegistry(rawPlaces)
  const affiliates = buildEmptyAffiliateRegistry()

  if (placeErrors.length > 0) {
    console.error('\n✘ Errores en el esquema de lugares:')
    for (const error of placeErrors) console.error(`  ${error}`)
    process.exitCode = 1
    return
  }

  const result = validateGuide(rawGuide, places, affiliates)

  if (result.errors.length > 0) {
    console.error('\n✘ Errores de validación:')
    for (const error of result.errors) console.error(`  ${error}`)
    process.exitCode = 1
    return
  }
  console.log('✔ Schema valid')
  console.log('✔ References valid')
  console.log('✔ Content rules valid')

  if (result.warnings.length > 0) {
    console.warn('\n⚠ Avisos:')
    for (const warning of result.warnings) console.warn(`  ${warning}`)
  }

  try {
    const compiled = compileGuide(result.guide!, places, affiliates)
    console.log('✔ Compilation successful')
    console.log(
      `\nContent validation passed. (${compiled.places.length} lugares únicos, ${compiled.variants?.[0]?.n_stops_total ?? 0} paradas)`,
    )
  } catch (error) {
    console.error('\n✘ Error de compilación:', (error as Error).message)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('Error inesperado:', error)
  process.exitCode = 1
})
