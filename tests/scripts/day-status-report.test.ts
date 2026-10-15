import { test } from 'node:test'
import assert from 'node:assert'
import { readFile } from 'node:fs/promises'
import {
  estimatesFromComments, placesPendingByComment, stopStatus, dayStatus, summarize, formatReport, formatTable,
  type PlaceLike, type DayLike,
} from '../../scripts/day-status-report.ts'

const GUIDE_PATH = 'content/guides/islandia/islandia-en-camper-13-dias.yaml'
const PLACES_PATH = 'content/places/islandia.yaml'

const GUIDE_TEXT = `variants:
  - id: intensivo
    days:
      - day: 1
        title: "Uno"
        # Confirmado por el autor.
        drive:
          km: 90
          minutes: 90
      - day: 2
        title: "Dos"
        # A → B. Estimación pendiente de confirmar por el autor.
        drive:
          km: 10
          minutes: 10
        # duraciones estimadas, pendiente de confirmar
        stops: []
      - day: 3
        # duración estimada, pendiente de confirmar
        stops: []
  - id: tranquilo
    days:
      - day: 1
        # duraciones estimadas, pendiente de confirmar
        stops: []
`

test('estimatesFromComments reads estimated durations and drive per day, first variant only', () => {
  const { durations, drive } = estimatesFromComments(GUIDE_TEXT)
  assert.deepStrictEqual([...durations].sort(), [2, 3])
  assert.deepStrictEqual([...drive], [2])
})

const PLACES_TEXT = `- place_id: geysir
  name: Geysir
  notes: "Ya confirmado."

# Coordinates pendientes de confirmar.
- place_id: hidden
  name: Hidden

# --- Campings. Coordenadas de directorios,
# --- PENDIENTES DE CONFIRMAR por el autor.
- place_id: camp_a
  name: Camp A

- place_id: camp_b
  name: Camp B

# --- Day 4 (the author's notes).
# Coordinates from public sources, approximate.
- place_id: kvernufoss
  name: Kvernufoss
`

test('placesPendingByComment covers the comment over a block and a pending section until the next one', () => {
  assert.deepStrictEqual([...placesPendingByComment(PLACES_TEXT)].sort(), ['camp_a', 'camp_b', 'hidden'])
})

const place = (overrides: Partial<PlaceLike>): PlaceLike => ({
  place_id: 'x', name: 'X', maps_url: 'https://maps.google.com/?cid=1', parking: { price: 0 }, ...overrides,
})

test('stopStatus asks a visited stop for parking, map card, coordinates and a short_name for long names', () => {
  const status = stopStatus(
    { place_id: 'x' },
    place({ name: 'Laguna Glaciar Fjallsárlón', maps_url: undefined, parking: undefined, notes: 'Coordenadas aproximadas, pendientes de confirmar.' }),
    new Set(),
  )
  assert.deepStrictEqual(status.missing, ['parking', 'ficha de mapa', 'coordenadas', 'short_name'])
  assert.strictEqual(status.coords_pending, true)
  assert.deepStrictEqual(stopStatus({ place_id: 'x' }, place({ short_name: 'Fjallsárlón', name: 'Laguna Glaciar Fjallsárlón' }), new Set()).missing, [])
})

test('stopStatus asks a skipped stop only for skip_reason (and coordinates), not parking or map card', () => {
  const skipped = { place_id: 'x', visit_status: 'not_visited' }
  assert.deepStrictEqual(stopStatus(skipped, place({ parking: undefined, maps_url: undefined }), new Set()).missing, ['skip_reason'])
  assert.deepStrictEqual(stopStatus({ ...skipped, skip_reason: 'Sin tiempo.' }, place({}), new Set(['x'])).missing, ['coordenadas'])
})

test('stopStatus keeps duration_note as information, not as something pending', () => {
  const status = stopStatus({ place_id: 'x', duration_note: 'con la ruta' }, place({}), new Set())
  assert.deepStrictEqual(status.missing, [])
  assert.strictEqual(status.duration_note, 'con la ruta')
})

const PLACES: Record<string, PlaceLike> = {
  x: place({ place_id: 'x' }),
  camp: place({ place_id: 'camp', name: 'Camping Árnes', short_name: 'Camping Árnes' }),
}
const lookup = (id: string) => PLACES[id]
const fullDay: DayLike = {
  day: 1, title: 'Uno', stops: [{ place_id: 'x' }],
  photo: { src: 'a.jpg', alt: 'Algo' }, highlight: 'Lo mejor', drive: { km: 1, minutes: 1 }, overnight: 'camp',
}
const options = { isLastDay: false, durationsEstimated: false, pendingByComment: new Set<string>() }

test('dayStatus closes a day that has everything', () => {
  const status = dayStatus(fullDay, lookup, options)
  assert.strictEqual(status.done, true)
  assert.deepStrictEqual(status.pending, [])
})

test('dayStatus lists what an open day still needs, in reading order', () => {
  const status = dayStatus(
    { day: 5, title: 'Cinco', stops: [{ place_id: 'x', visit_status: 'not_visited' }], photo: { src: 'a.jpg', alt: ' ' }, overnight: 'camp' },
    lookup,
    { ...options, durationsEstimated: true, pendingByComment: new Set(['camp']) },
  )
  assert.strictEqual(status.photo, 'no_alt')
  assert.deepStrictEqual(status.pending, [
    'alt de la foto', 'lo mejor del día', 'conducción', 'coordenadas del camping (Camping Árnes)',
    'duraciones por confirmar', 'X: skip_reason',
  ])
})

test('dayStatus: a night out of a campsite is done, a missing night only matters before the last day', () => {
  assert.strictEqual(dayStatus({ ...fullDay, overnight: null }, lookup, options).overnight, 'outside')
  const { overnight: _, ...noNight } = fullDay
  assert.strictEqual(dayStatus(noNight, lookup, options).overnight, 'missing')
  const last = dayStatus(noNight, lookup, { ...options, isLastDay: true })
  assert.strictEqual(last.overnight, 'not_needed')
  assert.strictEqual(last.done, true)
})

test('dayStatus flags a drive that is still an estimate', () => {
  const status = dayStatus(fullDay, lookup, { ...options, driveEstimated: true })
  assert.strictEqual(status.drive_confirmed, false)
  assert.deepStrictEqual(status.pending, ['conducción por confirmar'])
})

test('summarize counts closed days, open ones and unique places with pending coordinates', () => {
  const pending = new Set(['x', 'camp'])
  const statuses = [
    dayStatus(fullDay, lookup, options),
    dayStatus({ ...fullDay, day: 2 }, lookup, { ...options, pendingByComment: pending }),
    dayStatus({ ...fullDay, day: 3 }, lookup, { ...options, pendingByComment: pending }),
  ]
  const summary = summarize(statuses)
  assert.deepStrictEqual(summary.done, [1])
  assert.deepStrictEqual(summary.pending, [{ day: 2, count: 2 }, { day: 3, count: 2 }])
  assert.deepStrictEqual(summary.coords_pending.sort(), ['camp', 'x'])
})

test('formatTable pads by characters, so accented names line up', () => {
  assert.strictEqual(formatTable([['Día', 'Lugar'], ['1', 'Þórufoss'], ['12', 'X']]), [
    'Día  Lugar',
    '───  ────────',
    '1    Þórufoss',
    '12   X',
  ].join('\n'))
})

test('formatReport ends with the summary lines', () => {
  const statuses = [dayStatus(fullDay, lookup, options), dayStatus({ ...fullDay, day: 2, highlight: undefined }, lookup, options)]
  const lines = formatReport(statuses, summarize(statuses)).split('\n')
  assert.deepStrictEqual(lines.slice(-3), [
    'Días cerrados: 1 de 2 (1)',
    'Días con pendientes: 1 — día 2 (1)',
    'Coordenadas pendientes: 0 lugares',
  ])
  assert.ok(lines.includes('Día 2 · Uno — 1 pendiente'))
})

test('on the real files: days 5 to 13 carry estimated durations, day 4 an estimated drive, campsites are pending', async () => {
  const [guideText, placesText] = await Promise.all([readFile(GUIDE_PATH, 'utf8'), readFile(PLACES_PATH, 'utf8')])
  const { durations, drive } = estimatesFromComments(guideText)
  for (const day of [1, 2, 3, 4]) assert.ok(!durations.has(day), `day ${day}`)
  for (const day of [5, 6, 7, 8, 9, 10, 11, 12, 13]) assert.ok(durations.has(day), `day ${day}`)
  assert.ok(drive.has(4))
  assert.ok(!drive.has(1) && !drive.has(3))
  const pending = placesPendingByComment(placesText)
  assert.ok(pending.has('camp_thingvellir') && pending.has('camp_mosskogar'))
  assert.ok(!pending.has('keldur') && !pending.has('kvernufoss') && !pending.has('thingvellir'))
})
