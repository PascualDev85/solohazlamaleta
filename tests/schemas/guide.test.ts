import { test } from 'node:test'
import assert from 'node:assert'
import { GuideSourceSchema, StopSourceSchema, DaySourceSchema } from '../../schemas/guide.ts'

function minimalGuide(overrides: Record<string, unknown> = {}) {
  return {
    slug: 'test-guide',
    destination: 'islandia',
    hub: '/islandia/',
    type: 'itinerary',
    content_type: 'experience',
    status: 'reviewed',
    title: 'Test',
    description: 'A short description.',
    updated_at: '2026-01-01',
    cover_image: '/img.jpg',
    summary: { tagline: 'Test tagline' },
    ...overrides,
  }
}

test('minimal valid guide parses', () => {
  const result = GuideSourceSchema.safeParse(minimalGuide())
  assert.strictEqual(result.success, true)
})

test('description over 155 chars is rejected', () => {
  const result = GuideSourceSchema.safeParse(
    minimalGuide({ description: 'x'.repeat(156) }),
  )
  assert.strictEqual(result.success, false)
})

test('stop visit_status defaults to unknown', () => {
  const stop = StopSourceSchema.parse({
    place_id: 'x',
    order: 1,
    duration_min: 30,
    planning_status: 'required',
  })
  assert.strictEqual(stop.visit_status, 'unknown')
})

test('stop with experience block parses when visit_status is visited', () => {
  const result = StopSourceSchema.safeParse({
    place_id: 'x',
    order: 1,
    duration_min: 30,
    planning_status: 'required',
    visit_status: 'visited',
    experience: { visited_at: '2024-08' },
  })
  assert.strictEqual(result.success, true)
})

test('guide with a full variant/day/stop tree parses', () => {
  const result = GuideSourceSchema.safeParse(
    minimalGuide({
      base_travelers: 2,
      variants: [
        {
          id: 'intensivo',
          name: 'Full route',
          description: 'desc',
          days: [
            {
              day: 1,
              title: 'Day one',
              stops: [
                { place_id: 'a', order: 1, duration_min: 30, planning_status: 'required', visit_status: 'visited' },
              ],
            },
          ],
        },
      ],
      budget: {
        currency: 'EUR',
        includes: ['x'],
        excludes: ['y'],
        items: [
          { category: 'vuelos', label: 'Flights', amount: 100, basis: 'per_person', type: 'real', verified_at: '2024-01-01' },
        ],
      },
    }),
  )
  assert.strictEqual(result.success, true, JSON.stringify('error' in result ? result.error?.issues : []))
})

function minimalDay(overrides: Record<string, unknown> = {}) {
  return { day: 1, title: 'D1', stops: [], ...overrides }
}

test('day with photo, highlight, drive and overnight parses', () => {
  const result = DaySourceSchema.safeParse(minimalDay({
    photo: { src: 'islandia/x.jpg', alt: 'A waterfall', caption: 'X, 2025' },
    highlight: 'The best bit.',
    drive: { km: 275, minutes: 225 },
    overnight: 'Camping X',
  }))
  assert.strictEqual(result.success, true)
})

test('day photo without alt is rejected', () => {
  const result = DaySourceSchema.safeParse(minimalDay({ photo: { src: 'islandia/x.jpg' } }))
  assert.strictEqual(result.success, false)
})

test('day photo with an empty alt is rejected', () => {
  const result = DaySourceSchema.safeParse(minimalDay({ photo: { src: 'islandia/x.jpg', alt: '  ' } }))
  assert.strictEqual(result.success, false)
})

test('day drive with non-positive values is rejected', () => {
  for (const drive of [{ km: 0, minutes: 60 }, { km: 100, minutes: 0 }, { km: -5, minutes: 60 }]) {
    const result = DaySourceSchema.safeParse(minimalDay({ drive }))
    assert.strictEqual(result.success, false, JSON.stringify(drive))
  }
})

test('stop duration_max_min must be greater than duration_min', () => {
  const base = { place_id: 'x', order: 1, planning_status: 'required', visit_status: 'visited' }
  assert.strictEqual(StopSourceSchema.safeParse({ ...base, duration_min: 120, duration_max_min: 180 }).success, true)
  assert.strictEqual(StopSourceSchema.safeParse({ ...base, duration_min: 120, duration_max_min: 120 }).success, false)
  assert.strictEqual(StopSourceSchema.safeParse({ ...base, duration_min: 120, duration_max_min: 60 }).success, false)
})
