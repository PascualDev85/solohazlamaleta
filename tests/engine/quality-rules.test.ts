import { test } from 'node:test'
import assert from 'node:assert'
import { validateGuide } from '../../engine/validate/index.ts'
import { StopSourceSchema } from '../../schemas/guide.ts'
import type { PlaceSource } from '../../schemas/index.ts'
import type { PlaceRegistry, AffiliateRegistry } from '../../engine/types.ts'

const NOW = new Date('2024-06-01')
const basePlace: PlaceSource = { place_id: 'a', name: 'A', destination: 'islandia', lat: 1, lng: 1, type: 'other', verified_at: '2024-01-01', review_interval: 12 }
const camp: PlaceSource = { ...basePlace, place_id: 'camp', name: 'Camping', type: 'accommodation' }
const camp2: PlaceSource = { ...camp, place_id: 'camp2' }
const affiliates: AffiliateRegistry = { get: () => undefined }

function registry(...list: PlaceSource[]): PlaceRegistry {
  const map = new Map([camp, camp2, ...list].map((p) => [p.place_id, p]))
  return { get: (id) => map.get(id) }
}

const stop = (overrides: Record<string, unknown> = {}) => ({
  place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited', ...overrides,
})

function guide(days: Record<string, unknown>[]) {
  return {
    slug: 's', destination: 'islandia', hub: '/islandia/', type: 'itinerary', content_type: 'experience',
    status: 'reviewed', title: 't', description: 'd', updated_at: '2024-01-01', cover_image: '/x.jpg',
    summary: { tagline: 'tag' }, trip_done: '2024-01',
    variants: [{ id: 'intensivo', name: 'V', description: 'd', days }],
  }
}

const day = (overrides: Record<string, unknown> = {}) => ({ day: 1, title: 'D1', stops: [stop()], ...overrides })

function warningsFor(place: Partial<PlaceSource>, days = [day()]) {
  const result = validateGuide(guide(days), registry({ ...basePlace, ...place }), affiliates, NOW)
  assert.deepStrictEqual(result.errors, [])
  return result.warnings
}

const has = (warnings: string[], text: string) => warnings.some((w) => w.startsWith('[WARNING]') && w.includes(text))

// 1. LUGAR.description

test('description with first person warns', () => {
  assert.ok(has(warningsFor({ description: 'Cascada donde nos paramos a comer.' }), 'primera persona en description'))
})

test('description with an unsourced superlative warns, naming the place', () => {
  for (const description of [
    'Una de las cascadas más visitadas de Islandia.',
    'Es la más alta del país.',
    'El cañón más famoso del norte.',
    'Una cascada imprescindible.',
    'Paisaje espectacular junto al mar.',
    'Un lugar increíble.',
    'Merece la pena el desvío.',
  ]) {
    const warnings = warningsFor({ description })
    assert.ok(has(warnings, 'a: superlativo u opinión sin cifra en description'), description)
  }
})

test('description with a superlative backed by a figure in the same sentence does not warn', () => {
  const warnings = warningsFor({ description: 'Una de las más altas, con 122 metros de caída. Está en el valle de Þjórsárdalur.' })
  assert.ok(!has(warnings, 'superlativo'))
})

test('a figure in another sentence does not back a superlative', () => {
  const warnings = warningsFor({ description: 'Cascada de 122 metros. Una de las más visitadas.' })
  assert.ok(has(warnings, 'superlativo'))
})

test('a figure never backs an evaluative word', () => {
  assert.ok(has(warningsFor({ description: 'Espectacular, con 122 metros de caída.' }), 'superlativo'))
})

test('an objective description does not warn (control)', () => {
  const warnings = warningsFor({ description: 'Cascada de dos saltos en el río Hvítá. Más pequeña que Jökulsárlón.' })
  assert.ok(!has(warnings, 'description'))
})

// 2. LUGAR.notes: opinion or first person

test('notes with first person or opinion warn', () => {
  for (const notes of ['Nos gustó mucho el mirador.', 'Recomendamos ir temprano.', 'Se puede rodear por detrás: espectacular.', 'Vale la pena subir.']) {
    assert.ok(has(warningsFor({ notes }), 'opinión o primera persona en notes'), notes)
  }
})

test('practical notes do not warn (control)', () => {
  assert.ok(!has(warningsFor({ notes: 'Parking de pago, 1.000 ISK. Hay baños. Mejor desde el mirador inferior.' }), 'notes'))
})

// 3. LUGAR.notes: internal instructions

test('notes with instructions to the implementer warn', () => {
  for (const notes of [
    'Al confirmar coordenadas, mover el pin.',
    'Lugar agrupado con Selfoss.',
    'TODO: revisar acceso.',
    'Nota para el implementador: separar.',
    'Parking gratuito [revisar precio].',
  ]) {
    assert.ok(has(warningsFor({ notes }), 'instrucción interna en notes'), notes)
  }
})

test('"pendiente de confirmar" is a legitimate note and does not warn', () => {
  const warnings = warningsFor({ notes: 'Coordenadas aproximadas, pendientes de confirmar por el autor antes de publicar.' })
  assert.ok(!has(warnings, 'instrucción interna'))
  assert.ok(!has(warningsFor({ notes: 'Pendiente de confirmar el horario.' }), 'instrucción interna'))
})

// 4. Stops

test('a stop without duration_min is already rejected by the schema', () => {
  const { duration_min: _, ...noDuration } = stop()
  assert.strictEqual(StopSourceSchema.safeParse(noDuration).success, false)
})

test('a not_visited stop without skip_reason warns with its location', () => {
  const warnings = warningsFor({}, [day({ stops: [stop(), stop({ order: 2, visit_status: 'not_visited' })] })])
  assert.ok(has(warnings, 'parada not_visited sin skip_reason'))
  assert.ok(has(warnings, 'variante intensivo, día 1, place_id a'))
})

test('a not_visited stop with skip_reason does not warn (control)', () => {
  const warnings = warningsFor({}, [day({ stops: [stop({ visit_status: 'not_visited', skip_reason: 'No daba tiempo.' })] })])
  assert.ok(!has(warnings, 'skip_reason'))
})

// 5. Drive days and travel times

const drive = { km: 100, minutes: 90 }

test('a drive day whose route stops lack travel_to_next_min warns once', () => {
  const warnings = warningsFor({}, [day({ drive, stops: [stop(), stop({ order: 2 }), stop({ order: 3 })] })])
  const travel = warnings.filter((w) => w.includes('travel_to_next_min'))
  assert.strictEqual(travel.length, 1)
  assert.ok(travel[0].includes('día 1'))
})

test('the last route stop and skipped stops do not need travel_to_next_min', () => {
  const warnings = warningsFor({}, [day({
    drive,
    stops: [
      stop({ travel_to_next_min: 20 }),
      stop({ order: 2 }),
      stop({ order: 3, visit_status: 'not_visited', skip_reason: 'x' }),
    ],
  })])
  assert.ok(!has(warnings, 'travel_to_next_min'))
})

test('a day without drive does not need travel_to_next_min (control)', () => {
  assert.ok(!has(warningsFor({}, [day({ stops: [stop(), stop({ order: 2 })] })]), 'travel_to_next_min'))
})

// 6. Day photo alt

const photo = (alt: string, caption?: string) => ({ src: 'x.jpg', alt, caption })

test('a photo alt that repeats the caption warns', () => {
  const warnings = warningsFor({}, [day({ photo: photo('Gullfoss, septiembre de 2025', 'Gullfoss, septiembre de 2025') })])
  assert.ok(has(warnings, 'photo.alt repite el caption'))
})

test('a photo alt shorter than 20 characters warns', () => {
  assert.ok(has(warningsFor({}, [day({ photo: photo('Una cascada') })]), 'photo.alt de 11 caracteres'))
})

test('a descriptive photo alt does not warn (control)', () => {
  const warnings = warningsFor({}, [day({ photo: photo('Cascada de Gullfoss en dos saltos, con nubes oscuras', 'Gullfoss, 2025') })])
  assert.ok(!has(warnings, 'photo.alt'))
})

// 7. Route line names

test('a route place on a drive day with a long name and no short_name warns', () => {
  const warnings = warningsFor({ name: 'Cascada Kirkjufellsfoss' }, [day({ drive })])
  assert.ok(has(warnings, 'a: name de 23 caracteres sin short_name'))
})

test('a long name with short_name, or on a day without drive, does not warn', () => {
  assert.ok(!has(warningsFor({ name: 'Cascada Kirkjufellsfoss', short_name: 'Kirkjufell' }, [day({ drive })]), 'short_name'))
  assert.ok(!has(warningsFor({ name: 'Cascada Kirkjufellsfoss' }, [day()]), 'short_name'))
  assert.ok(!has(warningsFor({ name: 'Gullfoss' }, [day({ drive })]), 'short_name'))
})

// 8. Price check dates older than 12 months

const entry = (verified_at: string) => ({ price: 0, currency: 'ISK', verified_at })
const parking = (verified_at: string) => ({ price: 1000, currency: 'ISK', verified_at })

test('a parking price older than 12 months warns even with a longer review_interval', () => {
  const warnings = warningsFor({ review_interval: 24, parking: parking('2023-01-01') })
  assert.ok(has(warnings, 'precio verificado hace más de 12 meses (parking)'))
})

test('a stale entry price already reported as stale data is not repeated', () => {
  const warnings = warningsFor({ entry: entry('2023-01-01') })
  assert.ok(has(warnings, 'datos caducados (entry.price)'))
  assert.ok(!has(warnings, 'precio verificado'))
})

test('a price on a campsite (no stop) older than 12 months warns', () => {
  const result = validateGuide(
    guide([day({ overnight: 'camp' })]),
    registry(basePlace, { ...camp, entry: entry('2023-01-01') }),
    affiliates, NOW,
  )
  assert.deepStrictEqual(result.errors, [])
  assert.ok(has(result.warnings, 'camp: precio verificado hace más de 12 meses (entry.price)'))
})

test('a recent price does not warn (control)', () => {
  assert.ok(!has(warningsFor({ entry: entry('2024-05-01'), parking: parking('2024-05-01') }), 'precio'))
})

// 9. Overnight sequence

test('the same overnight on non-consecutive days warns', () => {
  const warnings = warningsFor({}, [
    day({ day: 1, overnight: 'camp' }), day({ day: 2, overnight: 'camp2' }), day({ day: 3, overnight: 'camp' }), day({ day: 4 }),
  ])
  assert.ok(has(warnings, 'overnight camp repetido en días no consecutivos (variante intensivo, días 1, 3)'))
})

test('a day without overnight that is not the last warns; null and the last day do not', () => {
  const warnings = warningsFor({}, [day({ day: 1 }), day({ day: 2, overnight: null }), day({ day: 3 })])
  const missing = warnings.filter((w) => w.includes('día sin overnight'))
  assert.strictEqual(missing.length, 1)
  assert.ok(missing[0].includes('día 1'))
})

test('the same overnight on consecutive days does not warn (control)', () => {
  const warnings = warningsFor({}, [day({ day: 1, overnight: 'camp' }), day({ day: 2, overnight: 'camp' }), day({ day: 3 })])
  assert.ok(!has(warnings, 'overnight'))
})
