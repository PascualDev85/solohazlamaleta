import { test } from 'node:test'
import assert from 'node:assert'
import { bookingNote, checkedParking, countLabel, showcaseDay } from '../../src/lib/home-showcase.ts'
import type { CompiledDay, CompiledStop } from '../../engine/index.ts'

// "Dentro de cada guía" on the landing page: one real day of a guide, and the
// facts its margin notes quote, all picked from the compiled guide.

const stop = (over: Partial<CompiledStop['place']> = {}, rest: Partial<CompiledStop> = {}): CompiledStop =>
  ({
    order: 1,
    duration_min: 60,
    planning_status: 'required',
    visit_status: 'visited',
    place: { place_id: 'p', name: 'Lugar', destination: 'islandia', lat: 0, lng: 0, type: 'nature', verified_at: '2025-09-01', is_stale: false, stale_fields: [], ...over },
    ...rest,
  }) as CompiledStop

const day = (n: number, over: Partial<CompiledDay> = {}): CompiledDay =>
  ({
    day: n,
    title: `Día ${n}`,
    stops: [],
    route_stops: [stop(), stop(), stop()],
    skipped_stops: [],
    n_stops: 3,
    n_route_stops: 3,
    route_line: [],
    ...over,
  }) as CompiledDay

const photo = { src: 'islandia/x.jpg', alt: 'x' }
const night = stop().place

test('showcaseDay picks the first day with a photo, a night and at least three stops', () => {
  const days = [
    day(1, { photo, overnight: night, route_stops: [stop(), stop()] }),
    day(2, { overnight: night }),
    day(3, { photo, overnight: night }),
    day(4, { photo, overnight: night }),
  ]
  assert.strictEqual(showcaseDay(days)?.day, 3)
})

test('showcaseDay falls back to the first day with stops, and to null without any', () => {
  assert.strictEqual(showcaseDay([day(1, { route_stops: [] }), day(2)])?.day, 2)
  assert.strictEqual(showcaseDay([day(1, { route_stops: [] })]), null)
  assert.strictEqual(showcaseDay([]), null)
})

test('bookingNote is the first high-priority item to book, otherwise the first one', () => {
  const items = [
    { label: 'Seguro', when: 'Antes de salir', priority: 'media' },
    { label: 'Camper', when: '3-6 meses antes', priority: 'alta' },
    { label: 'Glaciar', when: '1-2 meses antes', priority: 'alta' },
  ] as const
  assert.deepStrictEqual(bookingNote([...items]), { label: 'Camper', when: '3-6 meses antes' })
  assert.deepStrictEqual(bookingNote([items[0]]), { label: 'Seguro', when: 'Antes de salir' })
  assert.strictEqual(bookingNote([]), null)
  assert.strictEqual(bookingNote(undefined), null)
})

test('checkedParking is the first paid car park of the day with its own price, and when it was checked', () => {
  const stops = [
    stop({ name: 'Gratis', parking: { price: 0, currency: 'ISK', verified_at: '2026-10-04' } }),
    stop({ name: 'Compartido', parking: { price: 1000, currency: 'ISK', verified_at: '2026-10-04' } }, { parking_shared_with: night }),
    stop({ name: 'Parque Nacional de Þingvellir', short_name: 'Þingvellir', parking: { price: 1000, currency: 'ISK', verified_at: '2026-10-04' } }),
  ]
  assert.deepStrictEqual(checkedParking(stops), { place: 'Þingvellir', price: 1000, currency: 'ISK', verifiedAt: '2026-10-04' })
})

test('checkedParking is null when no stop has a paid car park of its own', () => {
  assert.strictEqual(checkedParking([stop(), stop({ parking: { price: 0, currency: 'ISK', verified_at: '2026-10-04' } })]), null)
})

test('countLabel writes a count with its noun in the right number', () => {
  assert.strictEqual(countLabel(1, 'destino', 'destinos'), '1 destino')
  assert.strictEqual(countLabel(2, 'destino', 'destinos'), '2 destinos')
  assert.strictEqual(countLabel(0, 'lugar', 'lugares'), '0 lugares')
  assert.strictEqual(countLabel(1200, 'lugar', 'lugares'), '1200 lugares')
})
